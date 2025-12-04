require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

const flightId = process.argv[2];
if (!flightId) {
  console.error('Usage: node src/scripts/fixFlight.js <flightId>');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log('Connected to MongoDB');

    const col = mongoose.connection.db.collection('flights');
    const raw = await col.findOne({ _id: new ObjectId(flightId) });

    if (!raw) {
      console.error('Flight not found with id', flightId);
      process.exit(1);
    }

    console.log('Raw flight document:', raw);

    const updates = {};

    // Fix price if it's an object
    if (raw.price && typeof raw.price === 'object' && !Array.isArray(raw.price)) {
      // Prefer economy, then amount, then business, then first numeric property
      const priceObj = raw.price;
      const newPrice =
        priceObj.economy || priceObj.amount || priceObj.business ||
        Object.values(priceObj).find((v) => typeof v === 'number');

      if (typeof newPrice === 'number') {
        updates.price = newPrice;
        console.log('Will set price ->', newPrice);
      } else {
        console.warn('Could not determine numeric price from object, skipping price update');
      }
    }

    // Fix seatsAvailable / totalSeats
    const seatsAvailableIsNumber = typeof raw.seatsAvailable === 'number' && !isNaN(raw.seatsAvailable);
    const totalSeatsIsNumber = typeof raw.totalSeats === 'number' && !isNaN(raw.totalSeats);

    if (!seatsAvailableIsNumber && totalSeatsIsNumber) {
      updates.seatsAvailable = raw.seatsAvailable || raw.totalSeats;
      console.log('Will set seatsAvailable ->', updates.seatsAvailable);
    }

    if (!totalSeatsIsNumber && typeof raw.seatsAvailable === 'number' && !isNaN(raw.seatsAvailable)) {
      updates.totalSeats = raw.totalSeats || raw.seatsAvailable;
      console.log('Will set totalSeats ->', updates.totalSeats);
    }

    if (!totalSeatsIsNumber && !seatsAvailableIsNumber) {
      // Fallback defaults
      updates.totalSeats = raw.totalSeats || 100;
      updates.seatsAvailable = raw.seatsAvailable || updates.totalSeats;
      console.log('Will set default totalSeats and seatsAvailable ->', updates.totalSeats, updates.seatsAvailable);
    }

    // Ensure required string fields
    ['flightNumber', 'origin', 'destination'].forEach((f) => {
      if (!raw[f] || typeof raw[f] !== 'string') {
        updates[f] = raw[f] || 'UNKNOWN';
        console.log(`Will set ${f} ->`, updates[f]);
      }
    });

    // Ensure departureTime/arrivalTime
    if (!raw.departureTime) {
      const now = new Date();
      updates.departureTime = now;
      console.log('Will set departureTime ->', updates.departureTime);
    }
    if (!raw.arrivalTime) {
      const later = new Date((updates.departureTime || raw.departureTime || Date.now()) + 2 * 60 * 60 * 1000); // +2h
      updates.arrivalTime = later;
      console.log('Will set arrivalTime ->', updates.arrivalTime);
    }

    // Normalize status casing to allowed enum: Scheduled | Delayed | Cancelled
    if (raw.status && typeof raw.status === 'string') {
      const normal = raw.status.trim();
      const map = {
        scheduled: 'Scheduled',
        delayed: 'Delayed',
        cancelled: 'Cancelled',
        canceled: 'Cancelled',
      };
      const lower = normal.toLowerCase();
      if (map[lower] && map[lower] !== raw.status) {
        updates.status = map[lower];
        console.log('Will set status ->', updates.status);
      }
    }

    if (Object.keys(updates).length === 0) {
      console.log('No updates required');
      process.exit(0);
    }

    const result = await col.updateOne({ _id: raw._id }, { $set: updates });
    console.log('Update result:', result.result || result);

    const after = await col.findOne({ _id: raw._id });
    console.log('Updated document:', after);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();

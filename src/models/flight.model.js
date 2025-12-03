const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    origin: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    seatsAvailable: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Delayed', 'Cancelled'],
      default: 'Scheduled',
    },
    amenities: {
      wifi: { type: Boolean, default: false },
      meals: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Flight = mongoose.model('Flight', FlightSchema);

module.exports = Flight;


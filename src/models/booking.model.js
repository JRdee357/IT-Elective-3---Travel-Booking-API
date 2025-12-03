const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    seat: { type: String, trim: true },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: true,
    },
    passengers: {
      type: Number,
      required: true,
      min: 1,
    },
    passengerDetails: {
      type: [PassengerSchema],
      default: [],
    },
    extras: {
      baggage: { type: Number, default: 0 },
      mealPreference: { type: String, trim: true },
    },
    payment: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      method: { type: String, required: true },
      last4: { type: String },
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Canceled'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;


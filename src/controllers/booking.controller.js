const Booking = require('../models/booking.model');
const Flight = require('../models/flight.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const mapBookingResponse = (booking) =>
  booking.populate([
    { path: 'flight', select: 'flightNumber origin destination departureTime arrivalTime price' },
    { path: 'user', select: 'firstName lastName email phone' },
  ]);

// Validate flight schema before saving
const validateFlightSchema = (flight) => {
  const errors = [];
  
  // Check required fields
  if (!flight.flightNumber || typeof flight.flightNumber !== 'string') {
    errors.push('flightNumber is required and must be a string');
  }
  if (!flight.origin || typeof flight.origin !== 'string') {
    errors.push('origin is required and must be a string');
  }
  if (!flight.destination || typeof flight.destination !== 'string') {
    errors.push('destination is required and must be a string');
  }
  if (!flight.departureTime || !(flight.departureTime instanceof Date)) {
    errors.push('departureTime is required and must be a valid date');
  }
  if (!flight.arrivalTime || !(flight.arrivalTime instanceof Date)) {
    errors.push('arrivalTime is required and must be a valid date');
  }
  if (typeof flight.price !== 'number' || flight.price < 0) {
    errors.push(`price must be a number >= 0, got ${typeof flight.price}: ${JSON.stringify(flight.price)}`);
  }
  if (typeof flight.totalSeats !== 'number' || flight.totalSeats < 1 || isNaN(flight.totalSeats)) {
    errors.push(`totalSeats must be an integer >= 1, got ${typeof flight.totalSeats}: ${flight.totalSeats}`);
  }
  if (typeof flight.seatsAvailable !== 'number' || flight.seatsAvailable < 0 || isNaN(flight.seatsAvailable)) {
    errors.push(`seatsAvailable must be an integer >= 0, got ${typeof flight.seatsAvailable}: ${flight.seatsAvailable}`);
  }
  if (flight.status && !['Scheduled', 'Delayed', 'Cancelled'].includes(flight.status)) {
    errors.push(`status must be one of: Scheduled, Delayed, Cancelled. Got: ${flight.status}`);
  }
  
  return errors;
};

const createBooking = asyncHandler(async (req, res, next) => {
  const {
    flightId,
    passengers,
    passengerDetails = [],
    extras,
    payment = {},
  } = req.body;

  const flight = await Flight.findById(flightId);

  if (!flight) {
    return next(new ApiError(404, 'Flight not found'));
  }

  // Validate flight schema before proceeding
  const schemaErrors = validateFlightSchema(flight.toObject());
  if (schemaErrors.length > 0) {
    return next(new ApiError(400, `Flight has schema issues:\n${schemaErrors.join('\n')}`));
  }

  if (flight.seatsAvailable < passengers) {
    return next(new ApiError(400, 'Not enough seats available on this flight'));
  }

  const expectedAmount = flight.price * passengers;
  const amount = payment.amount || expectedAmount;

  // Validate amount matches expected cost
  if (payment.amount && Math.abs(payment.amount - expectedAmount) > 0.01) {
    return next(new ApiError(400, `Payment amount must equal flight price × passengers: ${flight.price} × ${passengers} = ${expectedAmount}. Got: ${payment.amount}`));
  }

  const booking = await Booking.create({
    user: req.user._id,
    flight: flightId,
    passengers,
    passengerDetails,
    extras,
    payment: {
      amount,
      currency: payment.currency || 'USD',
      method: payment.method || 'card',
    },
  });

  flight.seatsAvailable -= passengers;
  await flight.save();

  const populatedBooking = await mapBookingResponse(booking);

  return res.status(201).json({
    success: true,
    message: 'Booking confirmed',
    data: populatedBooking,
  });
});

const getBookingById = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'You cannot view another user\'s booking'));
  }

  const populatedBooking = await mapBookingResponse(booking);

  return res.json({
    success: true,
    data: populatedBooking,
  });
});

const updateBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate('flight');

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'You cannot modify another user’s booking'));
  }

  if (booking.status === 'Canceled') {
    return next(new ApiError(400, 'Canceled bookings cannot be modified'));
  }

  if (req.body.passengers) {
    const diff = req.body.passengers - booking.passengers;
    if (diff > 0 && booking.flight.seatsAvailable < diff) {
      return next(new ApiError(400, 'Not enough seats available to increase passengers'));
    }
    booking.flight.seatsAvailable -= diff;
    booking.passengers = req.body.passengers;
    await booking.flight.save();
  }

  if (req.body.passengerDetails) {
    booking.passengerDetails = req.body.passengerDetails;
  }

  if (req.body.extras) {
    booking.extras = { ...booking.extras, ...req.body.extras };
  }

  if (req.body.payment) {
    booking.payment = { ...booking.payment, ...req.body.payment };
  }

  await booking.save();
  const populatedBooking = await mapBookingResponse(booking);

  return res.json({
    success: true,
    message: 'Booking updated',
    data: populatedBooking,
  });
});

const cancelBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate('flight');

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'You cannot cancel another user’s booking'));
  }

  if (booking.status === 'Canceled') {
    return res.json({
      success: true,
      message: 'Booking already canceled',
    });
  }

  booking.status = 'Canceled';
  booking.flight.seatsAvailable += booking.passengers;

  await booking.save();
  await booking.flight.save();

  return res.json({
    success: true,
    message: 'Booking canceled',
  });
});

module.exports = {
  createBooking,
  getBookingById,
  updateBooking,
  cancelBooking,
};


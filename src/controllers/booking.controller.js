const Booking = require('../models/booking.model');
const Flight = require('../models/flight.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const mapBookingResponse = (booking) =>
  booking.populate([
    { path: 'flight', select: 'flightNumber origin destination departureTime arrivalTime price' },
    { path: 'user', select: 'firstName lastName email phone' },
  ]);

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

  if (flight.seatsAvailable < passengers) {
    return next(new ApiError(400, 'Not enough seats available on this flight'));
  }

  const amount = payment.amount || flight.price * passengers;

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
      last4: payment.last4,
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


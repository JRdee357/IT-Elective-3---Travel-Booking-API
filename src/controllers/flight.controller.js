const Flight = require('../models/flight.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const searchFlights = asyncHandler(async (req, res) => {
  const { origin, destination, date, passengers = 1 } = req.query;

  const query = {};

  if (origin) {
    query.origin = origin.toUpperCase();
  }
  if (destination) {
    query.destination = destination.toUpperCase();
  }
  if (date) {
    const travelDate = new Date(date);
    const nextDate = new Date(travelDate);
    nextDate.setDate(travelDate.getDate() + 1);

    query.departureTime = {
      $gte: travelDate,
      $lt: nextDate,
    };
  }

  query.seatsAvailable = { $gte: Number(passengers) || 1 };

  const flights = await Flight.find(query).sort('departureTime');

  return res.json({
    success: true,
    count: flights.length,
    data: flights,
  });
});

const getFlightById = asyncHandler(async (req, res, next) => {
  const { flightId } = req.params;

  const flight = await Flight.findById(flightId);

  if (!flight) {
    return next(new ApiError(404, 'Flight not found'));
  }

  return res.json({
    success: true,
    data: flight,
  });
});

module.exports = {
  searchFlights,
  getFlightById,
};


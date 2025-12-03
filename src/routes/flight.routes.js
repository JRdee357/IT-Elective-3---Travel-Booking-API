const express = require('express');
const { query, param } = require('express-validator');
const { searchFlights, getFlightById } = require('../controllers/flight.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

/**
 * @swagger
 * /api/v1/flights:
 *   get:
 *     summary: Search for available flights
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: passengers
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of flights
 */
router.get(
  '/',
  [
    query('origin').optional().isString().trim(),
    query('destination').optional().isString().trim(),
    query('date').optional().isISO8601(),
    query('passengers').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  searchFlights
);

/**
 * @swagger
 * /api/v1/flights/{flightId}:
 *   get:
 *     summary: Get flight by ID
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: flightId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flight details
 *       404:
 *         description: Flight not found
 */
router.get('/:flightId', [param('flightId').isMongoId()], validateRequest, getFlightById);

module.exports = router;


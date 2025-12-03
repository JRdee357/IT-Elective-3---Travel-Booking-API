const express = require('express');
const { body, param } = require('express-validator');
const {
  createBooking,
  getBookingById,
  updateBooking,
  cancelBooking,
} = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightId
 *               - passengers
 *             properties:
 *               flightId:
 *                 type: string
 *                 description: MongoDB ID of the flight
 *               passengers:
 *                 type: integer
 *                 description: Number of passengers
 *               payment:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                   amount:
 *                     type: number
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid booking data or not enough seats
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  [
    authenticate,
    body('flightId').isMongoId().withMessage('flightId is required'),
    body('passengers').isInt({ min: 1 }).withMessage('passengers must be at least 1'),
    body('payment.method').optional().isString(),
    body('payment.amount').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  createBooking
);

/**
 * @swagger
 * /api/v1/bookings/{bookingId}:
 *   get:
 *     summary: View a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the booking
 */
router.get(
  '/:bookingId',
  [authenticate, param('bookingId').isMongoId()],
  validateRequest,
  getBookingById
);

/**
 * @swagger
 * /api/v1/bookings/{bookingId}:
 *   put:
 *     summary: Update an existing booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passengers:
 *                 type: integer
 *               payment:
 *                 type: object
 */
router.put(
  '/:bookingId',
  [authenticate, param('bookingId').isMongoId()],
  validateRequest,
  updateBooking
);

/**
 * @swagger
 * /api/v1/bookings/{bookingId}/cancel:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the booking
 *     responses:
 *       200:
 *         description: Booking canceled successfully
 *       403:
 *         description: Forbidden - not your booking
 *       404:
 *         description: Booking not found
 */
router.delete(
  '/:bookingId/cancel',
  [authenticate, param('bookingId').isMongoId()],
  validateRequest,
  cancelBooking
);

module.exports = router;


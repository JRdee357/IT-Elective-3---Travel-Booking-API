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
 */
router.put(
  '/:bookingId',
  [authenticate, param('bookingId').isMongoId()],
  validateRequest,
  updateBooking
);

/**
 * @swagger
 * /api/v1/bookings/{bookingId}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:bookingId',
  [authenticate, param('bookingId').isMongoId()],
  validateRequest,
  cancelBooking
);

module.exports = router;


const express = require('express');
const { body, param } = require('express-validator');
const {
  registerUser,
  getUserBookings,
  updateUserProfile,
  deleteUser,
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Register a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Account created
 */
router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional().isString(),
  ],
  validateRequest,
  registerUser
);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: View bookings by authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the user
 */
router.get(
  '/:userId',
  [authenticate, param('userId').isMongoId()],
  validateRequest,
  getUserBookings
);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 */
router.put(
  '/:userId',
  [
    authenticate,
    param('userId').isMongoId(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 8 }),
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('phone').optional().isString(),
  ],
  validateRequest,
  updateUserProfile
);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   delete:
 *     summary: Delete a user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the user
 */
router.delete(
  '/:userId',
  [authenticate, param('userId').isMongoId()],
  validateRequest,
  deleteUser
);

module.exports = router;


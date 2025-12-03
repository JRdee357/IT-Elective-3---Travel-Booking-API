const express = require('express');
const { body } = require('express-validator');
const { loginUser } = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate and retrieve a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *       401:
 *         description: Invalid email or password
 */
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest,
  loginUser
);

module.exports = router;


const express = require('express');
const { body } = require('express-validator');
const { loginUser } = require('../../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate and retrieve a JWT
 *     tags: [Auth]
 */
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest,
  loginUser
);

module.exports = router;


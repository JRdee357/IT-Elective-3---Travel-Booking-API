const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ApiError(401, 'User no longer exists'));
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

const authorizeSameUserOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authenticated'));
  }

  if (req.user.role === 'admin' || req.user._id.toString() === (req.params.userId || req.params.id)) {
    return next();
  }

  return next(new ApiError(403, 'You are not allowed to access this resource'));
};

module.exports = {
  authenticate,
  authorizeSameUserOrAdmin,
};


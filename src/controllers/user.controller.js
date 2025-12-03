const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const generateToken = require('../../utils/generateToken');

const sanitizeUser = (user) => {
  const { password, __v, ...safeUser } = user.toObject();
  return safeUser;
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, 'Email already registered'));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
  });

  const token = generateToken(user._id);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    data: sanitizeUser(user),
  });
});

const getUserBookings = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
    return next(new ApiError(403, 'You cannot view another user’s bookings'));
  }

  const bookings = await Booking.find({ user: userId })
    .populate('flight', 'flightNumber origin destination departureTime arrivalTime price')
    .sort('-createdAt');

  return res.json({
    success: true,
    data: {
      user: sanitizeUser(user),
      bookings,
    },
  });
});

const updateUserProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
    return next(new ApiError(403, 'You cannot update another user profile'));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'password'];

  allowedUpdates.forEach((field) => {
    if (req.body[field]) {
      user[field] = req.body[field];
    }
  });

  await user.save();

  return res.json({
    success: true,
    message: 'Profile updated',
    data: sanitizeUser(user),
  });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
    return next(new ApiError(403, 'You cannot delete another user'));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  await Booking.updateMany({ user: userId }, { status: 'Canceled' });
  await user.deleteOne();

  return res.json({
    success: true,
    message: 'User account deleted and bookings canceled',
  });
});

module.exports = {
  registerUser,
  getUserBookings,
  updateUserProfile,
  deleteUser,
};


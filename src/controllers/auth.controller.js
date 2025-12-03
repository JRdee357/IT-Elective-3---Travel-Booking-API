const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  const token = generateToken(user._id);

  return res.json({
    success: true,
    message: 'Authenticated successfully',
    token,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    },
  });
});

module.exports = {
  loginUser,
};


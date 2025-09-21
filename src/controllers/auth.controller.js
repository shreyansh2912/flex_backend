const User = require('../models/user.model');
const { successJson, errorJson } = require('../utils/responseHelpers');
const { generateOTP } = require('../utils/otpGenerator');
const sendOtpEmail = require('../utils/sendOtpEmail');
const jwt = require('jsonwebtoken');

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorJson(res, 'Email is required', 400);

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    await sendOtpEmail(email, otp);

    return successJson(res, null, 'OTP sent to email', 200);
  } catch (err) {
    return errorJson(res, err.message, 500);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return errorJson(res, 'Email and OTP are required', 400);

    const user = await User.findOne({ email });
    if (!user) return errorJson(res, 'User not found', 404);

    if (!user.otp || !user.otpExpiresAt) {
      return errorJson(res, 'No OTP requested', 400);
    }

    if (user.otp !== otp) {
      return errorJson(res, 'Invalid OTP', 401);
    }

    // if (user.otpExpiresAt < new Date()) {
    //   return errorJson(res, 'OTP expired', 401);
    // }

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name},
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return successJson(res, { token, user }, 'Login successful');

  } catch (err) {
    return errorJson(res, err.message, 500);
  }
};


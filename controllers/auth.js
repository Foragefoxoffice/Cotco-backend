const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const path = require("path");
const fs = require("fs");

// @desc    Register user (with profile upload)
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User already exists', 400));
  }

  // Generate username (same as email)
  const username = email;

  // Generate random password
  const firstName = name.split(" ")[0].toLowerCase();
  const randPassNum = Math.floor(1000 + Math.random() * 9000);
  const rawPassword = `${firstName}@${randPassNum}`;

  // Handle profile upload
  let profileImage = null;
  if (req.files && req.files.profileImage) {
    const file = req.files.profileImage;
    const uploadDir = path.join(__dirname, "../uploads/profile/");
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = Date.now() + "-" + file.name;
    const uploadPath = path.join(uploadDir, fileName);

    await file.mv(uploadPath);
    profileImage = `/uploads/profile/${fileName}`;
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    role: role || "supervisor", // default supervisor
    password: rawPassword,
    isVerified: true,
    profileImage
  });

  // Email message
  const message = `
    <h2>Welcome ${name}</h2>
    <p>Your account has been created successfully.</p>
    <p><strong>Username:</strong> ${username}</p>
    <p><strong>Password:</strong> ${rawPassword}</p>
    <p>Please login and change your password.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Account Credentials',
      message
    });

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        username,
        profileImage,
        message: 'User registered and credentials emailed'
      }
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    return next(new ErrorResponse('User created but email could not be sent', 500));
  }
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
exports.resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorResponse('User not found', 404));
  if (user.isVerified) return next(new ErrorResponse('Email already verified', 400));

  user.emailVerificationToken = crypto.randomBytes(3).toString('hex');
  user.emailVerificationExpire = Date.now() + 30 * 60 * 1000;
  await user.save();

  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${user.emailVerificationToken}`;
  const message = `
    <h1>Email Verification</h1>
    <p>Click to verify: <a href=${verificationUrl}>${verificationUrl}</a></p>
    <p>Or use OTP: ${user.emailVerificationToken}</p>
  `;

  try {
    await sendEmail({ email: user.email, subject: 'Email Verification', message });
    res.status(200).json({ success: true, message: 'Verification email resent' });
  } catch (err) {
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new ErrorResponse('Provide email & password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new ErrorResponse('Invalid credentials', 401));
  if (!user.isVerified) return next(new ErrorResponse('Verify your email first', 401));

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const fieldsToUpdate = { name, email, phone };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Logout
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, data: {} });
});

// Helper to send JWT
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email },
    token,
    role: user.role
  });
};

// @desc    Forgot password - send OTP
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorResponse('Provide email', 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorResponse('No user found', 404));

  const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
  user.resetPasswordToken = otp;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save();

  const message = `
    <h2>Password Reset OTP</h2>
    <p>Your OTP: <strong>${otp}</strong></p>
    <p>Valid for 30 minutes.</p>
  `;

  try {
    await sendEmail({ email: user.email, subject: 'Password Reset OTP', message });
    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password with OTP
// @route   POST /api/v1/auth/resetpassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return next(new ErrorResponse('Email, OTP & new password required', 400));
  }

  const user = await User.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) return next(new ErrorResponse('Invalid or expired OTP', 400));

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful' });
});

const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  verifyEmail,
  resendVerification,
  updateDetails,
  updatePassword,
forgotPassword,
resetPassword 
} = require('../controllers/auth');

const router = express.Router();

const { protect, authorize, requireVerifiedEmail } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/updatedetails', protect, requireVerifiedEmail, updateDetails);
router.put('/updatepassword', protect, requireVerifiedEmail, updatePassword);

module.exports = router;




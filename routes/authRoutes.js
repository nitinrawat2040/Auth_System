const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { sendOtp, verifyOtp } = require('../controllers/otpController');
const { signUp, loginUser } = require('../controllers/authController');
const { resetPassword } = require('../controllers/authController');

// Rate limiting route
const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    cooldown: true,
    retryAfter: 10, // in seconds
    message: "Too many OTP verification attempts. Please try again after 10 minutes.",
  },
});

// OTP routes
router.post('/send-otp', sendOtp);

// Signup route
router.post('/signup', signUp);

// Login route
router.post('/login', loginUser);

//Reset password route
router.post("/reset-password", resetPassword);

// Apply rate limiter to the OTP verification route
router.post('/verify-otp', verifyOtp);
// router.post('/verify-otp', verifyOtpLimiter, verifyOtp);

module.exports = router;

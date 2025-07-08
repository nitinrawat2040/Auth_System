const express = require('express');
const router = express.Router();

const { sendOtp, verifyOtp } = require('../controllers/otpController');
const { signUp } = require('../controllers/authController');

// OTP routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Signup route
router.post('/signup', signUp);

module.exports = router;

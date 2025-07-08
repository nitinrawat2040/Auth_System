const axios = require('axios');
require('dotenv').config();   


const otpStore = {};  // Use Redis or DB in production
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY; // move to .env in production

exports.sendOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.json({ success: false, message: "Phone is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = otp;

    try {
        await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'q',
                message: `Your OTP is ${otp}`,
                language: 'english',
                flash: 0,
                numbers: phone,
            },
            {
                headers: {
                    'authorization': FAST2SMS_API_KEY,
                    'Content-Type': 'application/json',
                }
            }
        );
        res.json({ success: true, message: `OTP sent successfully: ${otp}` });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

exports.verifyOtp = (req, res) => {
    const { phone, otp } = req.body;
    if (otpStore[phone] === otp) {
        delete otpStore[phone];
        return res.json({ success: true, message: 'OTP verified' });
    }
    return res.json({ success: false, message: 'Invalid OTP' });
};

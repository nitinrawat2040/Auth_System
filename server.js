const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); 
const mysql = require('mysql');

// MySQL DB connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'eshop'
});

db.connect(err => {
    if(err) throw err;
    console.log("MySQL connected!");
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const otpStore = {};     // In-memory store (use DB in production)
const FAST2SMS_API_KEY = '4rMyb0XL2QwTfaJ5cdNUKGxHAs167gjuEtqYoWpD3BnORCkVemlNH7aCIDmQsw96h4eXPYEdbGiJBnyV';
// Send OTP
app.post('/send-otp', async (req,res) => {
    const {phone} = req.body;

    if (!phone) 
        return res.json({
    success: false,
    message:"Phone is required",
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = otp;

    try {
        const response = await axios.post(
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
                },
            }
        );

    res.json({success: true, message: `OTP sent successfully: ${otp}`});
    }
    catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// verfiy OTP
app.post('/verify-otp', (req,res) => {
    const { phone, otp } = req.body;
    if (otpStore[phone] === otp) {
        delete otpStore[phone]; // delete the stored otp in otpStore
        return res.json({success: true, message:'OTP verified'});
    }
    return res.json({success: false, message: 'Invalid OTP'});
});

//start the server
app.listen(5000, () => {
    console.log("Starting server at port 5000");
})

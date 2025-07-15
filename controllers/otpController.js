const axios = require('axios');
require('dotenv').config();   
const db = require('../database/db'); 
const bcrypt = require('bcrypt');
const twilio = require('twilio'); // ✅ ADD THIS LINE


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const otpStore = {};  // Use Redis or DB in production
// const rateLimitStore = {};
// const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY; 

exports.sendOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.json({ success: false, message: "Phone is required" });
    }

     try {
    // Check if number exists in database
    const [rows] = await db.execute('SELECT * FROM users WHERE number = ?', [phone]);

    if (rows.length === 0) {
      return res.json({ success: false, message: "Mobile number is not registered." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

   const hashedOtp = await bcrypt.hash(otp, 10);
  await db.query(
  `UPDATE users SET otp_attempts = ?, otp_attempt_count = 0, otp_cooldown_until = NULL WHERE number = ?`,
  [hashedOtp, phone]
);
    console.log(`(Dev Mode) OTP for ${phone}: ${otp}`);
    
    // res.json({ success: true, message: `OTP sent successfully: ${otp}` });
  //  await axios.post(
  //           'https://www.fast2sms.com/dev/bulkV2',
  //           {
  //               route: 'q',
  //               message: `Your OTP is ${otp}. Do not share this with anyone.`,
  //               language: 'english',
  //               numbers: phone,
  //           },
  //           {
  //               headers: {
  //                   'authorization': FAST2SMS_API_KEY,
  //                   'Content-Type': 'application/json',
  //               }
  //           }
  //       );
         await client.messages.create({
         body: `Your OTP is ${otp}. Do not share this with anyone.`,
         from: process.env.TWILIO_PHONE_NUMBER, // must be verified in your Twilio account
          to: `+91${phone}`,  // Indian number format
});

        res.json({ success: true, message: `OTP sent successfully:` });
    } 
    catch (error) {
    console.error('Error sending OTP:');

    if (error.response) {
        console.error('Status Code:', error.response.status);
        console.error('Response Data:', error.response.data);
    } else if (error.request) {
        console.error('No response received:', error.request);
    } else {
        console.error('Error message:', error.message);
    }

    res.status(500).json({ success: false, message: 'Failed to send OTP' });
}

};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.json({ success: false, message: "Phone and OTP are required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT otp_attempts, otp_attempt_count, otp_cooldown_until FROM users WHERE number = ?`,
      [phone]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Phone number not found" });
    }

    const user = rows[0];
    const storedOtp = user.otp_attempts;
    const currentTime = Date.now();

    // Cooldown check
    if (user.otp_cooldown_until && currentTime < user.otp_cooldown_until) {
      return res.json({
        success: false,
        cooldown: true,
        retryAfter: Math.ceil((user.otp_cooldown_until - currentTime) / 1000),
        message: "Too many attempts. Try again later.",
      });
    }

    if (!storedOtp) {
      return res.json({ success: false, message: "No OTP found. Please request a new one." });
    }

    // OTP matched
    // if (storedOtp?.toString().trim() === otp.trim()) {
    //  await db.query(
    //     `UPDATE users SET otp_attempts = NULL, otp_attempt_count = 0, otp_cooldown_until = NULL WHERE number = ?`,
    //     [phone]
    //   );
    //   return res.json({ success: true, message: "OTP verified successfully" });
    // }
    const isMatch = await bcrypt.compare(otp.trim(), storedOtp.trim());

if (isMatch) {
  await db.query(
    `UPDATE users SET otp_attempts = NULL, otp_attempt_count = 0, otp_cooldown_until = NULL WHERE number = ?`,
    [phone]
  );
  return res.json({ success: true, message: "OTP verified successfully" });
}

//  OTP didn't match → increase count
    const newAttemptCount = user.otp_attempt_count + 1;

    if (newAttemptCount >= 3) {
      const cooldownUntil = currentTime + 10 * 1000; // 10 seconds
      await db.query(
        `UPDATE users SET otp_attempt_count = 0, otp_cooldown_until = ? WHERE number = ?`,
        [cooldownUntil, phone]
      );
      return res.json({
        success: false,
        cooldown: true,
        retryAfter: 10,
        message: "Too many attempts. Try again after 10 seconds.",
      });
    } else {
      await db.query(
        `UPDATE users SET otp_attempt_count = ? WHERE number = ?`,
        [newAttemptCount, phone]
      );
    }

    return res.json({ success: false, message: "Invalid OTP" });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


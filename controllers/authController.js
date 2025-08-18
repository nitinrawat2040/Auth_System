const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//SignUp
exports.signUp = async (req, res) => {
  const {
    Fname,
    Lname,
    address,
    landmark,
    pincode,
    email,
    number,
    password,
    Confirm_password
  } = req.body;

  if (!Fname || !Lname || !address || !landmark || !pincode || !email || !number || !password || !Confirm_password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
  if (password !== Confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR number = ?',
      [email, number]
    );

    if (existingUser.length > 0) {
      return res.json({
        success: false,
        message: "User with this email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const sql = `INSERT INTO users (Fname, Lname, address, landmark, pincode, email, number, password) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.execute(sql, [Fname, Lname, address, landmark, pincode, email, number, hashedPassword]);
    res.status(201).json({ success: true, message: "User registered successfully" });
  }
  catch (err) {
    console.error("Hashing error:", err);
    res.status(500).json({ success: false, message: "Server error during sign up" });
  }
};

// Login 
exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Email/Phone and password are required." });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR number = ?',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found ." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email
      }
    });
  }
  catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Email OTP verification controller
exports.verifyEmailOtp = async (req, res) => {
  const { identifier, otp: enteredOtp } = req.body;

  if (!enteredOtp) {
    return res.status(400).json({ message: "OTP is required." });
  }

  try {
    // Check if user exists
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [identifier]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0];
    const now = new Date();
    const otpCreatedAt = new Date(user.otp_created_at);
    const timeDiff = (now - otpCreatedAt) / 1000; // in seconds

    if (timeDiff > 300) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }
    const isMatch = await bcrypt.compare(enteredOtp, user.email_otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Clear OTP after verification
    await db.execute("UPDATE users SET email_otp = NULL WHERE id = ?", [identifier]);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, number: user.number },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "OTP verified successfully.",
      token
    });

  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { phone, newPassword } = req.body;

  if (!phone || !newPassword) {
    return res.json({ success: false, message: "Phone and new password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.execute('UPDATE users SET password = ? WHERE number = ?', [hashedPassword, phone]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "Mobile number not found." });
    }

    return res.json({ success: true, message: "Password updated successfully." });
  }
  catch (error) {
    console.error("Error updating password:", error.message);
    return res.status(500).json({ success: false, message: "Server error while updating password." });
  }
};

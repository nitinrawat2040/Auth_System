const db = require('../database/db');

exports.signUp = (req, res) => {
    const {
        Fname,
        Lname,
        address,
        landmark,
        pincode,
        email,
        number,
        password
    } = req.body;

    // You can later add validations, email check, password hashing here

    const query = `INSERT INTO users (Fname, Lname, address, landmark, pincode, email, number, password) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [Fname, Lname, address, landmark, pincode, email, number, password], (err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.status(201).json({ success: true, message: "User registered successfully" });
    });
};

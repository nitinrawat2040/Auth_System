# OTP-Based Authentication System

This project is a basic **authentication system** that allows users to sign up and log in using their phone number with OTP (One-Time Password) verification.

## 💻 Features

- User Sign-Up with OTP verification
- Secure Login with mobile number
- Form validations (frontend + backend)
- Password encryption
- SQL Database integration
- Modular and clean folder structure

## 🛠️ Technologies Used

- HTML & CSS
- JavaScript (Vanilla)
- Node.js
- Express.js
- SQL (MySQL or PostgreSQL)
- API Integration for sending OTP (e.g., Fast2SMS)

## 📂 Project Structure

Project1/
├── public/
│ ├── index.html
│ └── styles.css
├── server.js
├── routes/
│ └── auth.js
├── controllers/
│ └── otpController.js
├── database/
│ └── db.js
├── .env
├── .gitignore
└── README.md

## 🚀 How to Run

1. Clone the repo:

   ```bash
   git clone https://github.com/nitinrawat2040/Project1.git
   cd Project1

   ```

2. Install dependencies:
   npm install

3. Set environment variables in .env:
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=yourpassword
   OTP_API_KEY=your_api_key

4. Run the app:
   node server.js

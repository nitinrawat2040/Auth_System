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
- JavaScript
- Node.js
- Express.js
- SQL 
- API Integration for sending OTP (Fast2SMS)

## 📂 Project Structure

Project1/
├── controllers/
│   ├── authController.js
│   └── otpController.js
├── database/
│   └── db.js
├── node_modules/
├── public/
│   ├── login.css
│   ├── login.html
│   ├── login1.css
│   └── login1.html
├── routes/
│   └── authRoutes.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js


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

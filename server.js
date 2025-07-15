require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

app.use(express.static("public"));

app.listen(5000, () => {
    console.log("Server started on port 5000");
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NoteCollab API is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
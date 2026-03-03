const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({ name, email, password });

        res.status(201).json({
            success: true,
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        console.error('❌ Register error:', err);
        res.status(500).json({ success: false, message: err.message || 'Registration failed' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
};

module.exports = {register, login};

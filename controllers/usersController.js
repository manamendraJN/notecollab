const User = require('../models/User');

// @desc    Search users by email (for collaborator lookup)
// @route   GET /api/users/search?email=...
const searchUsers = async (req, res) => {
    const { email } = req.query;

    if (!email || email.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Please provide at least 2 characters to search' });
    }

    const users = await User.find({
        email: { $regex: email.trim(), $options: 'i' },
        _id: { $ne: req.user._id },
    })
        .select('name email avatar')
        .limit(10);

    res.json({ success: true, users });
};

module.exports = { searchUsers};

const Note = require('../models/Note');
const User = require('../models/User');

// @desc    Create note
// @route   POST /api/notes
const createNote = async (req, res) => {
    const { title, content, tags, color, isPinned } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const note = await Note.create({
        title,
        content: content || '',
        tags: tags || [],
        color: color || '#ffffff',
        isPinned: isPinned || false,
        owner: req.user._id,
        lastEditedBy: req.user._id,
    });

    await note.populate('owner', 'name email avatar');

    res.status(201).json({ success: true, note });
};

module.exports = {
    createNote,
};

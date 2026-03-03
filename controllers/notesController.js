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

// @desc    Get all notes for current user (owned + collaborated)
// @route   GET /api/notes
const getNotes = async (req, res) => {
    const { search, tag, page = 1, limit = 12, pinned } = req.query;
    const userId = req.user._id;

    const query = {
        isDeleted: false,
        $or: [{ owner: userId }, { 'collaborators.user': userId }],
    };

    // Full-text search
    if (search && search.trim()) {
        query.$text = { $search: search.trim() };
    }

    if (tag) {
        query.tags = tag.toLowerCase();
    }

    if (pinned === 'true') {
        query.isPinned = true;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { isPinned: -1, updatedAt: -1 },
        populate: [
            { path: 'owner', select: 'name email avatar' },
            { path: 'collaborators.user', select: 'name email avatar' },
            { path: 'lastEditedBy', select: 'name email' },
        ],
        lean: true,
    };

    const result = await Note.paginate(query, options);

    res.json({
        success: true,
        notes: result.docs,
        totalPages: result.totalPages,
        currentPage: result.page,
        total: result.totalDocs,
    });
};

module.exports = {
    createNote,
    getNotes,
};


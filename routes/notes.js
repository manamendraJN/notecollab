const express = require('express');
const router = express.Router();
const {
    createNote,
    getNotes,
    getNoteById
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNoteById);

module.exports = router;

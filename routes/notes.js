const express = require('express');
const router = express.Router();
const {
    createNote,
    getNotes
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

router.route('/').get(getNotes).post(createNote);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    createNote,
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

router.route('/').post(createNote);

module.exports = router;

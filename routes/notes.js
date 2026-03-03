const express = require('express');
const router = express.Router();
const {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    addCollaborator,
    updateCollaborator,
    removeCollaborator
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);

router.post('/:id/collaborators', addCollaborator);
router.put('/:id/collaborators/:userId', updateCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);

module.exports = router;

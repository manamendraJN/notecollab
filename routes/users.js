const express = require('express');
const router = express.Router();
const { searchUsers, updateProfile } = require('../controllers/usersController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/search', searchUsers);
router.put('/me', updateProfile);

module.exports = router;

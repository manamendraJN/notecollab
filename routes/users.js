const express = require('express');
const router = express.Router();
const { searchUsers} = require('../controllers/usersController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/search', searchUsers);

module.exports = router;

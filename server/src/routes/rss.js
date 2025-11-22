const express = require('express');
const { getUserRssFeed } = require('../controllers/rssController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:username', authenticateToken, getUserRssFeed);

module.exports = router;
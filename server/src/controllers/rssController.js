// filepath: /server/src/controllers/rssController.js
const express = require('express');
const { User, Shiur } = require('../models');
const { formatRSSFeed } = require('../utils/rssUtils');

const router = express.Router();

// Endpoint to serve user-specific RSS feeds
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favorites = await Shiur.find({ _id: { $in: user.favorites } });
    const rssFeed = formatRSSFeed(favorites);

    res.set('Content-Type', 'application/rss+xml');
    res.send(rssFeed);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
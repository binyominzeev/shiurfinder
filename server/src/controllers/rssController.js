// filepath: /server/src/controllers/rssController.js
const express = require('express');
const User = require('../models/User');
const Shiur = require('../models/Shiur');
const { formatRSSFeed } = require('../utils/rssUtils');

const router = express.Router();

// Controller function for user-specific RSS feed
const getUserRssFeed = async (req, res) => {
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
};

module.exports = { getUserRssFeed };
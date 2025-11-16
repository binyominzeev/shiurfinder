// filepath: /server/src/routes/user.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserInterests,
  updateUserFavorites,
  followRabbi,
  unfollowRabbi,
  getUserFavoritesByParasha,
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.post('/interests', authenticateToken, updateUserInterests);
router.post('/favorites', authenticateToken, updateUserFavorites);
router.post('/follow', authenticateToken, followRabbi);
router.post('/unfollow', authenticateToken, unfollowRabbi);
router.get('/favorites-by-parasha', authenticateToken, getUserFavoritesByParasha);

module.exports = router;
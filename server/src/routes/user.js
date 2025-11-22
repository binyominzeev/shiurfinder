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
  addShiurNote, // implement in controller
  removeFavorite, // implement in controller
  bulkUpdateFavorites, // implement in controller
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.post('/interests', authenticateToken, updateUserInterests);
router.post('/favorites', authenticateToken, updateUserFavorites); // clarify: add one or replace all?
router.delete('/favorites/:shiurId', authenticateToken, removeFavorite);
router.post('/favorites/bulk', authenticateToken, bulkUpdateFavorites);
router.put('/shiur-note', authenticateToken, addShiurNote);
router.post('/follow', authenticateToken, followRabbi);
router.post('/unfollow', authenticateToken, unfollowRabbi);
router.get('/favorites-by-parasha', authenticateToken, getUserFavoritesByParasha);

module.exports = router;
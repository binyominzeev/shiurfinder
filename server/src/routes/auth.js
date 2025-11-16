// server/src/routes/auth.js
const express = require('express');
const { signup, login, resetPasswordRequest, resetPasswordConfirm } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-password', resetPasswordRequest);
router.post('/reset-password/confirm', resetPasswordConfirm);

module.exports = router;
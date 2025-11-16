// server/src/routes/admin.js
const express = require('express');
const { uploadShiurim, backupMongoDB } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/upload-shiurim', authenticateToken, uploadShiurim);
router.post('/backup-mongodb', authenticateToken, backupMongoDB);

module.exports = router;
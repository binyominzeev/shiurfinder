// server/src/routes/admin.js
const express = require('express');
const multer = require('multer');
const { uploadShiurim, backupMongoDB } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-shiurim', authenticateToken, upload.single('file'), uploadShiurim);
router.post('/backup-mongodb', authenticateToken, backupMongoDB);

module.exports = router;
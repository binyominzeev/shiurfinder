// filepath: /server/src/routes/shiur.js
const express = require('express');
const router = express.Router();
const shiurController = require('../controllers/shiurController');
const { authenticateToken } = require('../middleware/auth');

// Shiur routes
router.get('/', shiurController.getAllShiurim);
router.get('/:id', shiurController.getShiurById);
router.post('/', authenticateToken, shiurController.createShiur);
router.put('/:id', authenticateToken, shiurController.updateShiur);
router.delete('/:id', authenticateToken, shiurController.deleteShiur);

module.exports = router;
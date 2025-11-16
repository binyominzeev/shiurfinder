import express from 'express';
import { getUserRssFeed } from '../controllers/rssController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/:username', authenticateToken, getUserRssFeed);

export default router;
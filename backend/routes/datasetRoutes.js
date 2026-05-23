import express from 'express';
import { uploadDataset, uploadMiddleware } from '../controllers/datasetController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', authenticateToken, uploadMiddleware, uploadDataset);

export default router;

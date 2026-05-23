import express from 'express';
import { uploadDataset, uploadMiddleware } from '../controllers/datasetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', protect, uploadMiddleware, uploadDataset);

export default router;

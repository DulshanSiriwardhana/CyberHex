import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createExperiment,
  getExperiments,
  getExperiment,
  updateExperiment,
  deleteExperiment,
} from '../controllers/experimentControllers.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(getExperiments));

router.post('/', asyncHandler(createExperiment));

router.get('/:id', asyncHandler(getExperiment));

router.put('/:id', asyncHandler(updateExperiment));

router.delete('/:id', asyncHandler(deleteExperiment));

export default router;
// Experiment routes
import express from 'express';
import Experiment from '../models/Experiment.js';
import TrainingLog from '../models/TrainingLog.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's experiments
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const experiments = await Experiment.find({ userId: req.user.userId }).populate('modelId');
    res.json({ experiments });
  } catch (error) {
    next(error);
  }
});

// Create experiment
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const experiment = new Experiment({
      ...req.body,
      userId: req.user.userId
    });
    await experiment.save();
    res.status(201).json({ experiment });
  } catch (error) {
    next(error);
  }
});

// Get training logs for experiment
router.get('/:id/logs', authenticateToken, async (req, res, next) => {
  try {
    const logs = await TrainingLog.find({ experimentId: req.params.id }).sort({ timestamp: 1 });
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

// Add training log
router.post('/:id/logs', authenticateToken, async (req, res, next) => {
  try {
    const log = new TrainingLog({
      experimentId: req.params.id,
      ...req.body
    });
    await log.save();
    // Broadcast to WebSocket clients
    if (global.broadcast) {
      global.broadcast({ type: 'loss_update', experimentId: req.params.id, epoch: req.body.epoch, loss: req.body.loss });
    }
    res.status(201).json({ log });
  } catch (error) {
    next(error);
  }
});

export default router;
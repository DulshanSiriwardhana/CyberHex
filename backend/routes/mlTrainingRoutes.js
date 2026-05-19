import express from 'express';
import Experiment from '../models/Experiment.js';
import TrainingLog from '../models/TrainingLog.js';
import Model from '../models/Model.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { asyncHandler, NotFoundError, ConflictError } from '../middleware/errorHandler.js';
import { startTraining, stopTraining, getJobStatus, getAllActiveJobs } from '../services/mlService.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/experiments/:id/train', asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) throw new NotFoundError('Experiment not found');
  if (experiment.userId.toString() !== req.user.userId) throw new NotFoundError('Experiment not found');

  const existing = await getJobStatus(experiment._id.toString());
  if (existing && existing.status === 'running') {
    throw new ConflictError('Training already in progress for this experiment');
  }

  experiment.status = 'training';
  await experiment.save();

  try {
    const jobId = await startTraining(experiment);

    await TrainingLog.create({
      experimentId: experiment._id,
      userId: req.user.userId,
      status: 'started',
      config: experiment.config,
      startedAt: new Date(),
    });

    logger.info(`Training started for experiment ${experiment._id} by user ${req.user.userId}`);

    res.json({
      message: 'Training started',
      experimentId: experiment._id,
      jobId,
      status: 'training',
    });
  } catch (err) {
    experiment.status = 'failed';
    await experiment.save();
    throw err;
  }
}));

router.post('/experiments/:id/stop', asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) throw new NotFoundError('Experiment not found');
  if (experiment.userId.toString() !== req.user.userId) throw new NotFoundError('Experiment not found');

  const result = await stopTraining(experiment._id.toString());
  if (!result) throw new NotFoundError('No active training found for this experiment');

  experiment.status = 'stopped';
  await experiment.save();

  await TrainingLog.findOneAndUpdate(
    { experimentId: experiment._id, status: 'started' },
    { status: 'stopped', completedAt: new Date() },
    { sort: { startedAt: -1 } }
  );

  logger.info(`Training stopped for experiment ${experiment._id} by user ${req.user.userId}`);

  res.json({ message: 'Training stopped', experimentId: experiment._id, status: 'stopped' });
}));

router.get('/experiments/:id/status', asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) throw new NotFoundError('Experiment not found');

  const status = await getJobStatus(experiment._id.toString());
  const logs = await TrainingLog.find({ experimentId: experiment._id })
    .sort({ startedAt: -1 })
    .limit(5)
    .lean();

  if (!status) {
    return res.json({
      experimentId: experiment._id,
      status: experiment.status,
      results: experiment.results,
      trainingLogs: logs,
    });
  }

  res.json({
    experimentId: experiment._id,
    ...status,
    results: experiment.results,
    trainingLogs: logs,
  });
}));

router.get('/jobs/active', asyncHandler(async (req, res) => {
  const jobs = await getAllActiveJobs();
  res.json({ jobs });
}));

router.get('/experiments/:id/logs', asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) throw new NotFoundError('Experiment not found');

  const logs = await TrainingLog.find({ experimentId: experiment._id })
    .sort({ startedAt: -1 })
    .limit(20)
    .lean();

  res.json({ experimentId: experiment._id, logs });
}));

router.get('/experiments/:id/models', asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) throw new NotFoundError('Experiment not found');

  const models = await Model.find({ experimentId: experiment._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ experimentId: experiment._id, models });
}));

export default router;
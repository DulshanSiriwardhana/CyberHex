import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import Experiment from '../models/Experiment.js';
import TrainingLog from '../models/TrainingLog.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.use(authenticateToken);

export const startTraining = asyncHandler(async (req, res) => {
    const { experimentId } = req.params;
    const { parameters } = req.body;

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new ValidationError('Cannot start training for this experiment');
    }

    if (experiment.status === 'running') {
        throw new ValidationError('Experiment is already running');
    }

    experiment.status = 'running';
    experiment.startedAt = new Date();
    if (parameters) {
        experiment.config = { ...experiment.config, ...parameters };
    }
    await experiment.save();

    logger.info(`Training started for experiment ${experimentId}`);

    res.json({
        message: 'Training started successfully',
        experiment
    });
});

export const getTrainingStatus = asyncHandler(async (req, res) => {
    const { experimentId } = req.params;

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new ValidationError('Cannot access this experiment');
    }

    const recentLogs = await TrainingLog.find({ experimentId })
        .sort({ timestamp: -1 })
        .limit(10);

    res.json({
        message: 'Training status retrieved successfully',
        status: experiment.status,
        startedAt: experiment.startedAt,
        completedAt: experiment.completedAt,
        lastMetrics: experiment.lastMetrics,
        recentLogs: recentLogs.reverse()
    });
});

export const getTrainingLogs = asyncHandler(async (req, res) => {
    const { experimentId } = req.params;
    const { page = 1, limit = 50, format = 'json' } = req.query;
    const skip = (page - 1) * limit;

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new ValidationError('Cannot access this experiment');
    }

    const total = await TrainingLog.countDocuments({ experimentId });
    const logs = await TrainingLog.find({ experimentId })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ timestamp: 1 });

    if (format === 'csv') {
        const csv = [
            'timestamp,epoch,loss,accuracy',
            ...logs.map(log => `${log.timestamp},${log.epoch},${log.loss},${log.accuracy}`)
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="training_logs_${experimentId}.csv"`);
        return res.send(csv);
    }

    res.json({
        message: 'Training logs retrieved successfully',
        data: logs,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        }
    });
});

export const streamTrainingLogs = asyncHandler(async (req, res) => {
    const { experimentId } = req.params;

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new ValidationError('Cannot access this experiment');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate = () => {
        TrainingLog.find({ experimentId })
            .sort({ timestamp: -1 })
            .limit(1)
            .then(logs => {
                if (logs.length > 0) {
                    res.write(`data: ${JSON.stringify(logs[0])}\n\n`);
                }
            })
            .catch(err => {
                logger.error('SSE error:', err);
                res.end();
            });
    };

    sendUpdate();
    const interval = setInterval(sendUpdate, 5000);

    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

router.post('/:experimentId/start', startTraining);
router.get('/:experimentId/status', getTrainingStatus);
router.get('/:experimentId/logs', getTrainingLogs);
router.get('/:experimentId/stream', streamTrainingLogs);

export default router;

import express from 'express';
import Experiment from '../models/Experiment.js';
import TrainingLog from '../models/TrainingLog.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
    createExperiment,
    listExperiments,
    getExperimentById,
    updateExperiment,
    deleteExperiment,
    runExperiment,
    stopExperiment
} from '../controllers/experimentControllers.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(listExperiments));

router.post('/', asyncHandler(createExperiment));

router.get('/:id', asyncHandler(getExperimentById));

router.put('/:id', asyncHandler(updateExperiment));

router.delete('/:id', asyncHandler(deleteExperiment));

router.post('/:id/run', asyncHandler(runExperiment));

router.post('/:id/stop', asyncHandler(stopExperiment));

router.get('/:id/logs', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const experiment = await Experiment.findById(id);
    if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Cannot access this experiment' });
    }

    const total = await TrainingLog.countDocuments({ experimentId: id });
    const logs = await TrainingLog.find({ experimentId: id })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ timestamp: 1 });

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
}));

router.post('/:id/logs', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { epoch, loss, accuracy, metrics } = req.body;

    const experiment = await Experiment.findById(id);
    if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Cannot update this experiment' });
    }

    const log = new TrainingLog({
        experimentId: id,
        epoch,
        loss,
        accuracy,
        metrics,
        timestamp: new Date()
    });
    await log.save();

    experiment.lastMetrics = { epoch, loss, accuracy, metrics };
    experiment.updatedAt = new Date();
    await experiment.save();

    if (global.broadcast) {
        global.broadcast({
            type: 'training_update',
            experimentId: id,
            epoch,
            loss,
            accuracy,
            metrics
        });
    }

    logger.debug(`Training log created for experiment ${id}`);

    res.status(201).json({
        message: 'Training log created successfully',
        log
    });
}));

export default router;

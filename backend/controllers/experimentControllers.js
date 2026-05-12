import Experiment from '../models/Experiment.js';
import { asyncHandler, NotFoundError, ValidationError, AuthorizationError } from '../middleware/errorHandler.js';
import { validateData, experimentSchema, updateExperimentSchema } from '../utils/validators.js';
import logger from '../utils/logger.js';

export const createExperiment = asyncHandler(async (req, res) => {
    const validation = validateData(experimentSchema, req.body);
    if (!validation.valid) {
        throw new ValidationError('Experiment validation failed', validation.errors);
    }

    const { name, description, config } = validation.data;
    const experiment = new Experiment({
        name,
        description,
        config,
        userId: req.user.userId,
        status: 'draft'
    });

    await experiment.save();
    logger.info(`Experiment created: ${experiment._id} by user ${req.user.userId}`);

    res.status(201).json({
        message: 'Experiment created successfully',
        experiment
    });
});

export const listExperiments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId };
    if (status) query.status = status;

    const total = await Experiment.countDocuments(query);
    const experiments = await Experiment.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort);

    res.json({
        message: 'Experiments retrieved successfully',
        data: experiments,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        }
    });
});

export const getExperimentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const experiment = await Experiment.findById(id);

    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot access this experiment');
    }

    res.json({
        message: 'Experiment retrieved successfully',
        experiment
    });
});

export const updateExperiment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validation = validateData(updateExperimentSchema, req.body);

    if (!validation.valid) {
        throw new ValidationError('Experiment update validation failed', validation.errors);
    }

    const experiment = await Experiment.findById(id);
    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot update this experiment');
    }

    const { name, description, config } = validation.data;
    if (name) experiment.name = name;
    if (description !== undefined) experiment.description = description;
    if (config) experiment.config = { ...experiment.config, ...config };

    experiment.updatedAt = new Date();
    await experiment.save();
    logger.info(`Experiment updated: ${id} by user ${req.user.userId}`);

    res.json({
        message: 'Experiment updated successfully',
        experiment
    });
});

export const deleteExperiment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const experiment = await Experiment.findById(id);

    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot delete this experiment');
    }

    await Experiment.findByIdAndDelete(id);
    logger.info(`Experiment deleted: ${id} by user ${req.user.userId}`);

    res.json({ message: 'Experiment deleted successfully' });
});

export const runExperiment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const experiment = await Experiment.findById(id);

    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot run this experiment');
    }

    if (!experiment.config) {
        throw new ValidationError('Experiment must have configuration before running');
    }

    experiment.status = 'running';
    experiment.startedAt = new Date();
    await experiment.save();
    logger.info(`Experiment started: ${id} by user ${req.user.userId}`);

    res.json({
        message: 'Experiment started successfully',
        experiment
    });
});

export const stopExperiment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const experiment = await Experiment.findById(id);

    if (!experiment) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot stop this experiment');
    }

    if (experiment.status !== 'running') {
        throw new ValidationError('Experiment is not running');
    }

    experiment.status = 'stopped';
    experiment.completedAt = new Date();
    await experiment.save();
    logger.info(`Experiment stopped: ${id} by user ${req.user.userId}`);

    res.json({
        message: 'Experiment stopped successfully',
        experiment
    });
});

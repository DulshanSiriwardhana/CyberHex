import Model from '../models/Model.js';
import Experiment from '../models/Experiment.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler.js';

export const saveModelFromExperiment = asyncHandler(async (req, res) => {
    const { experimentId, name } = req.body;
    if (!experimentId) throw new ValidationError('experimentId is required');

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) throw new NotFoundError('Experiment not found');
    if (experiment.userId.toString() !== req.user.userId) {
        throw new NotFoundError('Experiment not found');
    }

    if (experiment.status !== 'completed') {
        throw new ValidationError('Only completed experiments can be saved as models');
    }

    if (!experiment.results || !experiment.results.modelPath) {
        throw new ValidationError('Experiment has no model artifacts');
    }

    const model = await Model.create({
        experimentId: experiment._id,
        userId: req.user.userId,
        name: name || `${experiment.name} (Saved)`,
        type: experiment.config.modelType,
        framework: experiment.config.engine || 'python',
        filePath: experiment.results.modelPath,
        config: experiment.config,
        metrics: {
            trainLoss: experiment.results.finalTrainLoss,
            valLoss: experiment.results.finalValLoss,
            accuracy: experiment.results.peakAccuracy,
        },
    });

    res.status(201).json({
        message: 'Model saved successfully',
        model,
    });
});

export const getModels = asyncHandler(async (req, res) => {
    const models = await Model.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ models });
});

export const deleteModel = asyncHandler(async (req, res) => {
    const model = await Model.findById(req.params.id);
    if (!model) throw new NotFoundError('Model not found');
    if (model.userId.toString() !== req.user.userId) {
        throw new NotFoundError('Model not found');
    }

    await model.deleteOne();
    res.json({ message: 'Model deleted' });
});

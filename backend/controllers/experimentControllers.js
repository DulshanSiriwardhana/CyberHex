import Experiment from '../models/Experiment.js';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.js';

export const createExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.create({
    ...req.body,
    userId: req.user.userId,
    status: 'draft',
  });

  res.status(201).json({
    message: 'Experiment created',
    experiment,
  });
});

export const getExperiments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const filter = { userId: req.user.userId };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [experiments, total] = await Promise.all([
    Experiment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-config -results')
      .lean(),
    Experiment.countDocuments(filter),
  ]);

  res.json({
    experiments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id).lean();
  if (!experiment) throw new NotFoundError('Experiment not found');
  if (experiment.userId.toString() !== req.user.userId) {
    throw new NotFoundError('Experiment not found');
  }

  res.json({ experiment });
});

export const updateExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) throw new NotFoundError('Experiment not found');
  if (experiment.userId.toString() !== req.user.userId) {
    throw new NotFoundError('Experiment not found');
  }

  const allowedFields = ['name', 'description', 'config'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      experiment[field] = req.body[field];
    }
  }

  await experiment.save();
  res.json({ message: 'Experiment updated', experiment });
});

export const deleteExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) throw new NotFoundError('Experiment not found');
  if (experiment.userId.toString() !== req.user.userId) {
    throw new NotFoundError('Experiment not found');
  }

  if (experiment.status === 'training') {
    return res.status(400).json({ error: 'Cannot delete experiment while training' });
  }

  await experiment.deleteOne();
  res.json({ message: 'Experiment deleted' });
});

export const updateExperimentResults = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) throw new NotFoundError('Experiment not found');

  experiment.results = req.body.results;
  experiment.status = req.body.status || experiment.status;
  await experiment.save();

  res.json({ message: 'Results updated', experiment });
});
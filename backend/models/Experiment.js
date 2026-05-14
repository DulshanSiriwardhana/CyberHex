import mongoose, { Schema } from 'mongoose';

const ExperimentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  description: {
    type: String,
    maxLength: 500,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'training', 'completed', 'failed', 'stopped'],
    default: 'draft',
  },
  config: {
    task: { type: String, enum: ['regression', 'classification'], default: 'regression' },
    modelType: { type: String, enum: ['neural_network', 'linear_regression', 'decision_tree', 'random_forest'], default: 'neural_network' },
    layers: { type: [Number], default: [64, 32, 1] },
    activations: { type: [String], default: ['relu', 'relu', 'linear'] },
    loss: { type: String, default: 'mse' },
    batchSize: { type: Number, default: 32 },
    epochs: { type: Number, default: 100 },
    learningRate: { type: Number, default: 0.001 },
    optimizer: { type: String, default: 'adam' },
    validationSplit: { type: Number, default: 0.2, min: 0, max: 0.5 },
    earlyStopping: { type: Boolean, default: true },
    patience: { type: Number, default: 10 },
    dataPath: { type: String, default: null },
    seed: { type: Number, default: 42 },
  },
  results: {
    bestTrainLoss: Number,
    bestValLoss: Number,
    finalTrainLoss: Number,
    finalValLoss: Number,
    epochs: [Number],
    trainLoss: [Number],
    valLoss: [Number],
    modelPath: String,
    completedAt: Date,
  },
}, {
  timestamps: true,
});

ExperimentSchema.index({ userId: 1, status: 1 });
ExperimentSchema.index({ createdAt: -1 });

export default mongoose.model('Experiment', ExperimentSchema);
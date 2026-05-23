import mongoose, { Schema } from 'mongoose';

/**
 * CyberHex Experiment Schema  v∞.0  — World #1 Ultra-Max-Pro
 *
 * Tracks full lifecycle of a training run including:
 *  - Advanced optimizer + regularization config
 *  - Per-epoch metrics (loss, val_loss, lr, accuracy, f1)
 *  - Ensemble checkpoint metadata
 *  - Dead-neuron detection ratio
 */

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
    modelType: {
      type: String,
      enum: ['neural_network', 'linear_regression', 'decision_tree', 'random_forest'],
      default: 'neural_network',
    },

    // ── Architecture ────────────────────────────────────────────────────────
    layers: { type: [Number], default: [128, 64, 32, 1] },
    activations: { type: [String], default: ['gelu', 'gelu', 'gelu', 'linear'] },

    // ── Training Hyperparameters ─────────────────────────────────────────────
    loss: { type: String, default: 'mse' },
    batchSize: { type: Number, default: 32 },
    epochs: { type: Number, default: 100 },
    learningRate: { type: Number, default: 0.001 },
    optimizer: {
      type: String,
      enum: ['adam', 'adamw', 'radam', 'lion', 'sgd', 'rmsprop', 'Adam', 'AdamW', 'RAdam', 'Lion', 'SGD', 'RMSProp'],
      default: 'adamw',
    },

    // ── Learning Rate Schedule ───────────────────────────────────────────────
    lrSchedule: { type: String, enum: ['none', 'step', 'cosine', 'cosine_warm'], default: 'cosine' },
    warmupEpochs: { type: Number, default: 5 },

    // ── Regularization ───────────────────────────────────────────────────────
    dropoutRate: { type: Number, default: 0.0, min: 0, max: 0.9 },
    useBatchNorm: { type: Boolean, default: false },
    gradientClip: { type: Number, default: 5.0 },
    labelSmoothing: { type: Number, default: 0.0, min: 0, max: 0.5 },
    weightDecay: { type: Number, default: 1e-4 },

    // ── Data / Split ─────────────────────────────────────────────────────────
    validationSplit: { type: Number, default: 0.2, min: 0, max: 0.5 },
    testSplit: { type: Number, default: 0.1, min: 0, max: 0.4 },
    earlyStopping: { type: Boolean, default: true },
    patience: { type: Number, default: 15 },

    dataPath: { type: String, default: null },
    customData: { type: String, default: null },
    datasetName: { type: String, default: 'cyber_intrusion' },
    selectedFeatures: { type: [String], default: [] },
    targetFeature: { type: String, default: '' },
    seed: { type: Number, default: 42 },
  },

  results: {
    // ── Final metrics ────────────────────────────────────────────────────────
    bestTrainLoss: Number,
    bestValLoss: Number,
    finalTrainLoss: Number,
    finalValLoss: Number,

    // ── Per-epoch series ─────────────────────────────────────────────────────
    epochs: [Number],
    trainLoss: [Number],
    valLoss: [Number],
    accuracy: [Number],
    f1: [Number],
    precision: [Number],
    recall: [Number],
    learningRates: [Number],

    // ── Model artifacts ──────────────────────────────────────────────────────
    modelPath: String,
    ensembleSize: { type: Number, default: 0 },

    // ── Diagnostics ──────────────────────────────────────────────────────────
    deadNeuronPct: Number,     // % of dead neurons at final epoch
    peakF1: Number,
    peakAccuracy: Number,

    completedAt: Date,
  },
}, {
  timestamps: true,
});

// ── Compound indexes for common query patterns ──────────────────────────────
ExperimentSchema.index({ userId: 1, status: 1 });
ExperimentSchema.index({ userId: 1, createdAt: -1 });
ExperimentSchema.index({ createdAt: -1 });

export default mongoose.model('Experiment', ExperimentSchema);

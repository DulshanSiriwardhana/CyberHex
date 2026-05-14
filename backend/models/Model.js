import mongoose, { Schema } from 'mongoose';

const ModelSchema = new Schema({
  experimentId: {
    type: Schema.Types.ObjectId,
    ref: 'Experiment',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['neural_network', 'linear_regression'],
    default: 'neural_network',
  },
  framework: {
    type: String,
    enum: ['python', 'cpp'],
    default: 'python',
  },
  filePath: {
    type: String,
    required: true,
  },
  config: {
    type: Schema.Types.Mixed,
  },
  metrics: {
    trainLoss: Number,
    valLoss: Number,
    accuracy: Number,
  },
  isBest: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

ModelSchema.index({ experimentId: 1, isBest: -1 });
ModelSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Model', ModelSchema);
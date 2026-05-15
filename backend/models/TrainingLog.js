import mongoose, { Schema } from 'mongoose';

const TrainingLogSchema = new Schema({
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
  status: {
    type: String,
    enum: ['started', 'completed', 'failed', 'stopped'],
    default: 'started',
  },
  config: {
    type: Schema.Types.Mixed,
  },
  metrics: {
    epochs: [Number],
    trainLoss: [Number],
    valLoss: [Number],
    bestTrainLoss: Number,
    bestValLoss: Number,
    finalTrainLoss: Number,
    finalValLoss: Number,
  },
  error: String,
  startedAt: Date,
  completedAt: Date,
}, {
  timestamps: true,
});

TrainingLogSchema.index({ experimentId: 1, startedAt: -1 });

export default mongoose.model('TrainingLog', TrainingLogSchema);
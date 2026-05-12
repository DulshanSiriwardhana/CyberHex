
import mongoose from 'mongoose';

const ExperimentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    hyperparameters: {
        learningRate: Number,
        epochs: Number,
        batchSize: Number,
        optimizer: String,
        lossFunction: String
    },
    status: {
        type: String,
        enum: ['running', 'completed', 'failed'],
        default: 'running'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    bestLoss: Number,
    bestEpoch: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Experiment', ExperimentSchema);
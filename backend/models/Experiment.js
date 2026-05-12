import mongoose from 'mongoose';

const ExperimentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model'
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    config: {
        modelType: {
            type: String,
            enum: ['neural_network', 'decision_tree', 'random_forest'],
            default: 'neural_network'
        },
        parameters: mongoose.Schema.Types.Mixed,
        dataPath: String
    },
    hyperparameters: {
        learningRate: Number,
        epochs: Number,
        batchSize: Number,
        optimizer: String,
        lossFunction: String
    },
    status: {
        type: String,
        enum: ['draft', 'running', 'completed', 'failed', 'stopped'],
        default: 'draft'
    },
    startedAt: Date,
    completedAt: Date,
    lastMetrics: {
        epoch: Number,
        loss: Number,
        accuracy: Number,
        metrics: mongoose.Schema.Types.Mixed
    },
    bestLoss: Number,
    bestEpoch: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Experiment', ExperimentSchema);

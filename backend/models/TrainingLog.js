
import mongoose from 'mongoose';

const TrainingLogSchema = new mongoose.Schema({
    experimentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Experiment',
        required: true
    },
    epoch: {
        type: Number,
        required: true
    },
    loss: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});


TrainingLogSchema.index({ experimentId: 1, timestamp: -1 });

export default mongoose.model('TrainingLog', TrainingLogSchema);
// Item 73: Model Schema to track User ML experiments
import mongoose from 'mongoose';

const ModelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    layers: [{
        type: {
            type: String,
            required: true
        },
        inputShape: Number,
        outputShape: Number,
        activation: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Model', ModelSchema);
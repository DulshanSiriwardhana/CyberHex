// Item 87: MongoDB connection with reconnection strategies and timeout
import mongoose from 'mongoose';
import logger from './logger.js';

const MONGO_OPTIONS = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

const DBinitialize = async () => {
    const uri = process.env.DB_URI;
    if (!uri) {
        logger.error('DB_URI not set in environment - database connection skipped');
        return;
    }

    mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
    mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected - attempting reconnect...');
        setTimeout(() => DBinitialize(), 5000);
    });

    try {
        await mongoose.connect(uri, MONGO_OPTIONS);
    } catch (err) {
        logger.error('MongoDB initial connection failed:', err);
        // Retry after 5s
        setTimeout(() => DBinitialize(), 5000);
    }
};

export default DBinitialize;
// Item 65: Global async error handler middleware
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const status = statusCode < 500 ? 'fail' : 'error';

    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });

    // Item 68: JSend-style structured HTTP response
    res.status(statusCode).json({
        status,
        message: statusCode < 500 ? err.message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

// Async wrapper to avoid try/catch in every controller
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// HTTP error factory
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

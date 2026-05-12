
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const status = statusCode < 500 ? 'fail' : 'error';

    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });

    
    res.status(statusCode).json({
        status,
        message: statusCode < 500 ? err.message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};


export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

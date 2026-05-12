import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let code = err.code || 'INTERNAL_ERROR';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = Object.values(err.errors)
            .map(e => e.message)
            .join(', ') || 'Validation failed';
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        code = 'INVALID_ID';
        message = `Invalid ${err.kind}: ${err.value}`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        code = 'DUPLICATE_FIELD';
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'INVALID_JWT';
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Token has expired';
    }

    if (err.name === 'ZodError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    }

    if (err.name === 'MongoServerError') {
        statusCode = 503;
        code = 'DATABASE_ERROR';
        message = 'Database error occurred';
    }

    const status = statusCode < 500 ? 'fail' : 'error';
    
    logger.error(`${req.method} ${req.originalUrl} - ${message}`, { 
        stack: err.stack,
        code,
        userId: req.user?.userId
    });

    res.status(statusCode).json({
        status,
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export class AppError extends Error {
    constructor(message, statusCode, code = 'APP_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTH_ERROR');
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'INSUFFICIENT_PERMISSIONS');
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT');
    }
}


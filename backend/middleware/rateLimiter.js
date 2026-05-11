// Item 64: Global rate limiter configuration
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { status: 'fail', message: 'Too many auth attempts, please try again later.' },
});

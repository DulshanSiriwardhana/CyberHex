// Item 61: App configuration - separated from server startup
// Items 63, 64, 65, 71, 72, 83: Helmet, rate-limit, CORS, error handler, versioned routes
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import experimentRoutes from './routes/experimentRoutes.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();

// Item 63: Security headers
app.use(helmet());

// Item 83: Restrict CORS to specific origins
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Item 64: Global rate limiter
app.use(rateLimiter);

// Item 71: Request logging
app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});

// Item 72: API versioning
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Item 65: Global async error handler (must be last)
app.use(errorHandler);
app.use(errorHandler);

export default app;

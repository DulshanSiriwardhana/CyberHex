import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import experimentRoutes from './routes/experimentRoutes.js';
import mlTrainingRoutes from './routes/mlTrainingRoutes.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();


app.use(helmet());


const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(rateLimiter);


app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});


app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/experiments', experimentRoutes);
app.use('/api/v1/ml', mlTrainingRoutes);


app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0', timestamp: new Date() }));
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0', timestamp: new Date() }));


app.use(errorHandler);

export default app;

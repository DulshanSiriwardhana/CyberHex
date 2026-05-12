// Item 71: Winston logger - routes to console and file
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        // Item 56: Console transport
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
        // Item 56: File transport for persistent logs
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

export default logger;

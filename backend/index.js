// Item 61: Entry point - delegates to app.js
// Keeps server startup logic separate from application logic
import { createServer } from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import DBinitialize from './utils/db_init.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

DBinitialize();

const server = createServer(app);

server.listen(PORT, () => {
  logger.info(`CyberHex backend running on port ${PORT}`);
});

// Item 145/136: Graceful shutdown
process.on('SIGTERM', () => {
  logger.warn('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});
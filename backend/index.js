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

// Item 51: WebSocket server using ws library
import { WebSocketServer } from 'ws';

// Item 54: Secure WebSocket (use wss in production)
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  ws.on('message', (message) => {
    logger.info('Received:', message.toString());
  });
  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
});

// Function to broadcast to all clients
global.broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};
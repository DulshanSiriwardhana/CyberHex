

import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import DBinitialize from './utils/db_init.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

DBinitialize();

const server = createServer(app);

server.listen(PORT, () => {
  logger.info(`CyberHex backend running on port ${PORT}`);
});


import { WebSocketServer } from 'ws';


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



global.broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
};
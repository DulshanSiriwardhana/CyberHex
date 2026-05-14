import './utils/env.js';

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

import { WebSocketServer } from 'ws';

const clients = new Map();

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost`);
  const experimentId = url.searchParams.get('experimentId');
  const clientId = url.searchParams.get('clientId') || `client-${Date.now()}`;

  if (experimentId) {
    if (!clients.has(experimentId)) clients.set(experimentId, new Set());
    clients.get(experimentId).add(ws);
    logger.info(`WebSocket client ${clientId} joined experiment ${experimentId}`);
  } else {
    logger.info(`WebSocket client connected: ${clientId}`);
  }

  ws.on('close', () => {
    if (experimentId) clients.get(experimentId)?.delete(ws);
    logger.info(`WebSocket client disconnected: ${clientId}`);
  });
});

global.broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
};

global.broadcastToExperiment = (experimentId, data) => {
  const room = clients.get(experimentId);
  if (!room) return;
  const payload = JSON.stringify(data);
  room.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
};

server.listen(PORT, () => {
  logger.info(`CyberHex backend running on port ${PORT}`);
});

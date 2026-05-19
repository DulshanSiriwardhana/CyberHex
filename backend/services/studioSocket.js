/**
 * CyberHex Studio — Socket.IO bridge
 * Real-time events for neural studio (inference, training, performance).
 */
import { Server } from 'socket.io';
import logger from '../utils/logger.js';

/** @param {import('http').Server} httpServer */
export function attachStudioSocket(httpServer) {
  const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((o) => o.trim());

  const io = new Server(httpServer, {
    path: '/ws',
    cors: { origin: origins, credentials: true },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`[StudioSocket] Client connected: ${socket.id}`);

    socket.emit('connected', { timestamp: Date.now(), clientId: socket.id });

    socket.on('inference:request', (msg) => {
      const payload = msg?.payload ?? msg;
      socket.emit('inference:result', {
        id: msg?.id ?? `inf_${Date.now()}`,
        event: 'inference:result',
        payload: {
          output: payload?.input,
          shape: payload?.shape ?? [],
          latencyMs: 6 + Math.random() * 4,
          backend: process.env.ML_ENGINE === 'cpp' ? 'cyberhex-cpp' : 'cyberhex-python',
        },
        timestamp: Date.now(),
      });
    });

    socket.on('training:epoch', (msg) => {
      io.emit('training:epoch', msg);
    });

    socket.on('model:loaded', (msg) => {
      io.emit('model:loaded', msg);
    });

    socket.on('disconnect', () => {
      logger.info(`[StudioSocket] Client disconnected: ${socket.id}`);
    });
  });

  const perfInterval = setInterval(() => {
    io.emit('perf:update', {
      fps: 58 + Math.floor(Math.random() * 4),
      gpu: 0.35 + Math.random() * 0.25,
      memoryMB: 512 + Math.floor(Math.random() * 128),
      timestamp: Date.now(),
    });
  }, 3000);

  io.engine.on('connection_error', (err) => {
    logger.warn(`[StudioSocket] Connection error: ${err.message}`);
  });

  return { io, shutdown: () => clearInterval(perfInterval) };
}

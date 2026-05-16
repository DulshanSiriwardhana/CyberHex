/**
 * CyberHex v3.0 — Health Diagnostics Routes
 *
 * Provides health check, readiness probe, and diagnostic endpoints
 * for Kubernetes liveness/readiness probes, load balancers, and
 * monitoring systems.
 *
 * @module routes/healthRoutes
 */

import express from 'express';
import mongoose from 'mongoose';
import os from 'os';
import { config } from '../utils/env.js';
import { logger } from '../utils/logger.js';
import { isRedisAvailable } from '../services/cacheService.js';

const router = express.Router();

// ──── Helpers ────────────────────────────────────────────────────

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return {
    total: Math.round(total / 1024 / 1024),
    used: Math.round(used / 1024 / 1024),
    free: Math.round(free / 1024 / 1024),
    usagePercent: Math.round((used / total) * 100),
  };
}

// ──── Simple Health Check (Liveness Probe) ───────────────────────
// Responds quickly — only verifies the process is alive.
router.get('/live', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ──── Readiness Probe ────────────────────────────────────────────
// Verifies that critical dependencies (DB, Redis) are healthy.
router.get('/ready', async (_req, res) => {
  const checks = {
    database: false,
    redis: false,
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      checks.database = true;
    }
  } catch {
    // database check failed
  }

  // Check Redis if configured
  try {
    checks.redis = isRedisAvailable();
  } catch {
    checks.redis = false;
  }

  const allReady = Object.values(checks).every(Boolean);
  const status = allReady ? 'ok' : 'degraded';

  res.status(allReady ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    checks,
  });
});

// ──── Full Diagnostics ───────────────────────────────────────────
// Internal endpoint (should be protected in production).
router.get('/diagnostics', (_req, res) => {
  const mem = getMemoryUsage();
  const cpuLoad = os.loadavg();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: {
      name: 'cyberhex-server',
      version: process.env.npm_package_version || '3.0.0',
      environment: config.NODE_ENV || 'development',
      nodeVersion: process.version,
      pid: process.pid,
      uptime: formatUptime(process.uptime()),
      uptimeSeconds: Math.round(process.uptime()),
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: mem,
      loadAverage: {
        '1min': cpuLoad[0],
        '5min': cpuLoad[1],
        '15min': cpuLoad[2],
      },
    },
    dependencies: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: isRedisAvailable() ? 'connected' : 'unavailable',
      databaseName: mongoose.connection.name || 'N/A',
    },
    process: {
      memoryUsage: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
      },
    },
  });
});

export default router;
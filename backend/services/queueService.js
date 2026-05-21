/**
 * CyberHex v3.0 — Redis-backed Asynchronous Task Queue
 *
 * Decouples heavy training child-processes from the main Express API Gateway.
 * Supports graceful fallback to local in-process execution when Redis is down.
 *
 * @module services/queueService
 */

import { createClient } from 'redis';
import { env } from '../utils/env.js';
import logger from '../utils/logger.js';
import { saveJobSnapshot } from './jobStore.js';

export const QUEUE_KEY = 'ml:jobs_queue';
export const UPDATE_CHANNEL = 'ml:updates:channel';

let redisClient = null;
let subClient = null;

/**
 * Returns a connected Redis client for queue actions.
 */
async function getQueueClient() {
  if (!env.REDIS_URL || process.env.REDIS_DISABLED === '1') return null;
  if (redisClient) return redisClient;

  try {
    redisClient = createClient({ url: env.REDIS_URL });
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    logger.warn(`Redis queue client unavailable: ${err.message}`);
    redisClient = null;
    return null;
  }
}

/**
 * Enqueues an ML training job to Redis queue.
 * @param {object} experiment - The mongoose experiment object
 */
export async function enqueueJob(experiment) {
  const client = await getQueueClient();
  const jobId = experiment._id.toString();

  const payload = {
    experimentId: jobId,
    experiment: experiment.toObject ? experiment.toObject() : experiment,
  };

  logger.info(`[QueueService] Enqueuing job ${jobId.slice(-6)} to Redis`);

  // Set state in JobStore as queued
  await saveJobSnapshot(jobId, {
    experimentId: jobId,
    status: 'queued',
    metrics: {
      epochs: [],
      train_loss: [],
      val_loss: [],
      best_val_loss: Infinity,
      best_train_loss: Infinity,
    },
    startedAt: new Date(),
    engine: experiment.config?.engine || 'imperative',
  });

  if (client) {
    await client.lPush(QUEUE_KEY, JSON.stringify(payload));
  } else {
    throw new Error('Redis server is not available to enqueue jobs');
  }
}

/**
 * Subscribes to worker real-time pub/sub updates and broadcasts them to active web sockets.
 */
export async function initPubSub() {
  if (!env.REDIS_URL || process.env.REDIS_DISABLED === '1') {
    logger.warn('[QueueService] Redis disabled or missing URL, pub/sub updates inactive');
    return;
  }

  try {
    subClient = createClient({ url: env.REDIS_URL });
    await subClient.connect();

    logger.info('[QueueService] Subscribed to Redis pub/sub channel for worker metrics');

    await subClient.subscribe(UPDATE_CHANNEL, (message) => {
      try {
        const { type, experimentId, data } = JSON.parse(message);
        if (global.broadcastToExperiment) {
          global.broadcastToExperiment(experimentId, {
            type,
            experimentId,
            ...data,
          });
        }
      } catch (err) {
        logger.error(`[QueueService] Error parsing pub/sub message: ${err.message}`);
      }
    });
  } catch (err) {
    logger.warn(`[QueueService] Redis pub/sub subscription failed: ${err.message}`);
  }
}

export default {
  enqueueJob,
  initPubSub,
};

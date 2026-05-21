/**
 * CyberHex v3.0 — Asynchronous ML Training Queue Worker
 *
 * Dedicated background worker that pulls training tasks from Redis queue,
 * spawns the C++ or Python child process, monitors metrics in real time,
 * and publishes events to Redis Pub/Sub to inform the gateway API.
 *
 * Run with: node backend/services/worker.js
 */

import { createClient } from 'redis';
import mongoose from 'mongoose';
import { env } from '../utils/env.js';
import logger from '../utils/logger.js';
import DBinitialize from '../utils/db_init.js';
import { spawnTraining } from './trainingRunner.js';
import { saveJobSnapshot } from './jobStore.js';
import {
  buildCppConfig,
  buildPythonConfig,
  resolveTrainingCommand,
  finalizeExperiment,
  ensureOutputDir,
} from './mlService.js';
import { QUEUE_KEY, UPDATE_CHANNEL } from './queueService.js';

let redisClient = null;
let pubClient = null;
let commandSubClient = null;

let activeChildProcess = null;
let activeJobId = null;
let activeJob = null;

/**
 * Handle stdout line metric parsing and broadcast to gateway via Redis Pub/Sub.
 */
async function processWorkerOutputLine(job, line) {
  if (!line.trim()) return;
  const jobId = job.experimentId;

  try {
    const parsed = JSON.parse(line);
    if (parsed.type === 'epoch') {
      job.metrics.epochs.push(parsed.epoch);
      job.metrics.train_loss.push(parsed.train_loss);
      job.metrics.val_loss.push(parsed.val_loss ?? null);
      if (parsed.val_loss != null && parsed.val_loss < job.metrics.best_val_loss) {
        job.metrics.best_val_loss = parsed.val_loss;
      }
      if (parsed.train_loss != null && parsed.train_loss < job.metrics.best_train_loss) {
        job.metrics.best_train_loss = parsed.train_loss;
      }

      // Persist status in Redis so REST api can query the snapshot
      await saveJobSnapshot(jobId, {
        experimentId: jobId,
        status: job.status,
        metrics: job.metrics,
        startedAt: job.startedAt,
        engine: job.engine,
      });

      // Publish update to API Gateway over Redis Pub/Sub
      await pubClient.publish(
        UPDATE_CHANNEL,
        JSON.stringify({
          type: 'training_metric',
          experimentId: jobId,
          data: parsed,
        })
      );
    } else if (parsed.type === 'training_complete') {
      job.status = 'completed';
      job.metrics.final_train_loss = parsed.final_train_loss;
      job.metrics.final_val_loss = parsed.final_val_loss;
      job.metrics.model_path = parsed.model_path;
    } else if (parsed.type === 'log') {
      logger.info(`[Worker-ML] [${jobId.slice(-6)}]: ${parsed.message}`);
    }
  } catch {
    logger.warn(`[Worker-ML] [${jobId.slice(-6)}] non-JSON stdout: ${line.slice(0, 200)}`);
  }
}

/**
 * Process active stdout streams without missing fragments.
 */
async function drainStdoutBuffer(job) {
  const lines = job.buffer.split('\n');
  job.buffer = lines.pop() ?? '';
  for (const line of lines) {
    await processWorkerOutputLine(job, line);
  }
}

/**
 * Setup process monitoring for spawned training command.
 */
function runTrainingProcess(job, command, args, options) {
  return new Promise((resolve) => {
    const jobId = job.experimentId;
    const childProcess = spawnTraining(command, args, options);

    activeChildProcess = childProcess;
    activeJobId = jobId;

    childProcess.stdout.on('data', async (data) => {
      job.buffer += data.toString();
      await drainStdoutBuffer(job);
    });

    childProcess.stderr.on('data', (data) => {
      logger.error(`[Worker-ML] [${jobId.slice(-6)}] stderr: ${data.toString().trim()}`);
    });

    childProcess.on('close', async (code) => {
      await drainStdoutBuffer(job);
      if (job.buffer.trim()) {
        await processWorkerOutputLine(job, job.buffer.trim());
        job.buffer = '';
      }

      if (job.status === 'running') {
        job.status = code === 0 ? 'completed' : 'failed';
      }

      logger.info(`[Worker-ML] Job ${jobId.slice(-6)} ended with code ${code}`);
      
      // Save state to Redis
      await saveJobSnapshot(jobId, {
        experimentId: jobId,
        status: job.status,
        metrics: job.metrics,
        startedAt: job.startedAt,
        engine: job.engine,
      });

      // Synchronize back to MongoDB
      await finalizeExperiment(jobId, job);

      // Publish final update
      await pubClient.publish(
        UPDATE_CHANNEL,
        JSON.stringify({
          type: 'training_complete',
          experimentId: jobId,
          data: {
            status: job.status,
            metrics: job.metrics,
            exitCode: code,
          },
        })
      );

      activeChildProcess = null;
      activeJobId = null;
      resolve();
    });

    childProcess.on('error', async (err) => {
      job.status = 'failed';
      logger.error(`[Worker-ML] Job ${jobId.slice(-6)} failed to spawn: ${err.message}`);
      
      await saveJobSnapshot(jobId, {
        experimentId: jobId,
        status: 'failed',
        metrics: job.metrics,
        startedAt: job.startedAt,
        engine: job.engine,
      });

      await finalizeExperiment(jobId, job);

      await pubClient.publish(
        UPDATE_CHANNEL,
        JSON.stringify({
          type: 'training_complete',
          experimentId: jobId,
          data: {
            status: 'failed',
            error: err.message,
          },
        })
      );

      activeChildProcess = null;
      activeJobId = null;
      resolve();
    });
  });
}

/**
 * Main worker loop.
 */
async function startWorker() {
  // 1. Initialize MongoDB
  await DBinitialize();

  // 2. Setup Redis Clients
  const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
  logger.info(`[Worker] Connecting to Redis at ${redisUrl}...`);

  redisClient = createClient({ url: redisUrl });
  pubClient = createClient({ url: redisUrl });
  commandSubClient = createClient({ url: redisUrl });

  await Promise.all([
    redisClient.connect(),
    pubClient.connect(),
    commandSubClient.connect(),
  ]);

  logger.info('[Worker] Successfully connected to Redis queues and command buses');

  // 3. Listen to stop commands
  await commandSubClient.subscribe('ml:commands:channel', async (message) => {
    try {
      const { command, experimentId } = JSON.parse(message);
      if (command === 'stop' && activeChildProcess && activeJobId === experimentId) {
        logger.info(`[Worker] Received remote STOP command for active job ${experimentId.slice(-6)}`);
        
        activeJob.status = 'stopped';
        activeChildProcess.kill('SIGTERM');
      }
    } catch (err) {
      logger.error(`[Worker] Error processing control bus message: ${err.message}`);
    }
  });

  // Ensure outputs folder exists
  ensureOutputDir();

  logger.info('[Worker] Background queue worker is active. Listening for jobs...');

  // 4. Polling loop
  while (true) {
    try {
      // Blocking pop from right of the queue with 10s timeout
      const result = await redisClient.brPop(QUEUE_KEY, 10);
      if (!result) continue; // Timeout, repeat loop

      const { key, element } = result;
      const { experimentId, experiment } = JSON.parse(element);

      logger.info(`[Worker] Picked up job ${experimentId.slice(-6)} from queue`);

      const useCpp = process.env.ML_ENGINE === 'cpp';
      const config = useCpp ? buildCppConfig(experiment) : buildPythonConfig(experiment);
      const { command, args, cwd, env: processEnv, engine } = resolveTrainingCommand(useCpp, config);

      activeJob = {
        experimentId,
        metrics: {
          epochs: [],
          train_loss: [],
          val_loss: [],
          best_val_loss: Infinity,
          best_train_loss: Infinity,
        },
        status: 'running',
        startedAt: new Date(),
        buffer: '',
        engine,
      };

      // Set running status in JobStore Redis
      await saveJobSnapshot(experimentId, {
        experimentId,
        status: 'running',
        metrics: activeJob.metrics,
        startedAt: activeJob.startedAt,
        engine,
      });

      // Run training process to completion (blocks this loop till done)
      await runTrainingProcess(activeJob, command, args, { env: processEnv, cwd });

    } catch (err) {
      logger.error(`[Worker] Error during worker task cycle: ${err.message}`);
      // Sleep for a second on error to avoid tight error looping
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Start worker process
startWorker().catch((err) => {
  logger.error(`[Worker] FATAL startup error: ${err.message}`);
  process.exit(1);
});

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

const activeJobs = new Map();

function buildCppConfig(experiment) {
  const cfg = experiment.config || {};
  return {
    task: cfg.task || 'regression',
    layers: cfg.layers || [64, 32, 1],
    activations: cfg.activations || ['relu', 'relu', 'linear'],
    loss: cfg.loss || 'mse',
    batchSize: cfg.batchSize || 32,
    epochs: cfg.epochs || 100,
    learningRate: cfg.learningRate || 0.001,
    optimizer: cfg.optimizer || 'adam',
    validationSplit: cfg.validationSplit || 0.2,
    earlyStopping: cfg.earlyStopping ?? true,
    patience: cfg.patience || 10,
    dataPath: cfg.dataPath || null,
    seed: cfg.seed || 42,
  };
}

function buildPythonConfig(experiment) {
  const cfg = experiment.config || {};
  return {
    model_type: cfg.modelType || 'neural_network',
    task: cfg.task || 'regression',
    layers: cfg.layers || [64, 32, 1],
    batch_size: cfg.batchSize || 32,
    epochs: cfg.epochs || 100,
    learning_rate: cfg.learningRate || 0.001,
    optimizer: cfg.optimizer || 'adam',
    data_path: cfg.dataPath || null,
    seed: cfg.seed || 42,
  };
}

function ensureOutputDir() {
  const dir = path.join(projectRoot, 'ML', 'models', 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function startTraining(experiment) {
  if (activeJobs.has(experiment._id.toString())) {
    throw new Error('Training already running for this experiment');
  }

  ensureOutputDir();
  const jobId = experiment._id.toString();
  const useCpp = process.env.ML_ENGINE === 'cpp';

  let childProcess;
  let config;

  if (useCpp) {
    const cppBinary = path.join(projectRoot, 'ML', 'models', 'cpp-modules', 'build', 'cyberhex_ml');
    config = buildCppConfig(experiment);
    childProcess = spawn(cppBinary, [], {
      env: { ...process.env, CYBERHEX_CONFIG: JSON.stringify(config) },
      cwd: path.join(projectRoot, 'ML', 'models', 'cpp-modules'),
    });
  } else {
    const pythonScript = path.join(projectRoot, 'ML', 'models', 'python-modules', 'train.py');
    config = buildPythonConfig(experiment);
    childProcess = spawn('python3', [pythonScript], {
      env: { ...process.env, CYBERHEX_CONFIG: JSON.stringify(config) },
      cwd: path.join(projectRoot, 'ML', 'models', 'python-modules'),
    });
  }

  const job = {
    process: childProcess,
    experimentId: jobId,
    metrics: { epochs: [], train_loss: [], val_loss: [], best_val_loss: Infinity },
    status: 'running',
    startedAt: new Date(),
    buffer: '',
  };

  activeJobs.set(jobId, job);

  childProcess.stdout.on('data', (data) => {
    job.buffer += data.toString();
    const lines = job.buffer.split('\n');
    job.buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.type === 'epoch') {
          job.metrics.epochs.push(parsed.epoch);
          job.metrics.train_loss.push(parsed.train_loss);
          job.metrics.val_loss.push(parsed.val_loss || null);
          if (parsed.val_loss && parsed.val_loss < job.metrics.best_val_loss) {
            job.metrics.best_val_loss = parsed.val_loss;
          }
          if (global.broadcastToExperiment) {
            global.broadcastToExperiment(jobId, {
              type: 'training_metric',
              experimentId: jobId,
              ...parsed,
            });
          }
        } else if (parsed.type === 'training_complete') {
          job.status = 'completed';
          job.metrics.final_train_loss = parsed.final_train_loss;
          job.metrics.final_val_loss = parsed.final_val_loss;
          job.metrics.model_path = parsed.model_path;
          if (global.broadcastToExperiment) {
            global.broadcastToExperiment(jobId, {
              type: 'training_complete',
              experimentId: jobId,
              metrics: job.metrics,
            });
          }
        } else if (parsed.type === 'log') {
          logger.info(`ML [${jobId.slice(-6)}]: ${parsed.message}`);
        }
      } catch (e) {
        logger.warn(`ML [${jobId.slice(-6)}] non-JSON output: ${line.slice(0, 200)}`);
      }
    }
  });

  childProcess.stderr.on('data', (data) => {
    logger.error(`ML [${jobId.slice(-6)}] stderr: ${data.toString().trim()}`);
  });

  childProcess.on('close', (code) => {
    if (job.status === 'running') {
      job.status = code === 0 ? 'completed' : 'failed';
      if (global.broadcastToExperiment) {
        global.broadcastToExperiment(jobId, {
          type: 'training_complete',
          experimentId: jobId,
          status: job.status,
          metrics: job.metrics,
          exitCode: code,
        });
      }
    }
    activeJobs.delete(jobId);
    logger.info(`ML job ${jobId.slice(-6)} finished with code ${code}`);
  });

  childProcess.on('error', (err) => {
    job.status = 'failed';
    activeJobs.delete(jobId);
    logger.error(`ML job ${jobId.slice(-6)} error: ${err.message}`);
    if (global.broadcastToExperiment) {
      global.broadcastToExperiment(jobId, {
        type: 'training_complete',
        experimentId: jobId,
        status: 'failed',
        error: err.message,
      });
    }
  });

  return jobId;
}

export function getJobStatus(jobId) {
  const job = activeJobs.get(jobId);
  if (!job) return null;
  return {
    experimentId: job.experimentId,
    status: job.status,
    metrics: job.metrics,
    startedAt: job.startedAt,
  };
}

export function stopTraining(jobId) {
  const job = activeJobs.get(jobId);
  if (!job) return null;
  job.process.kill('SIGTERM');
  activeJobs.delete(jobId);
  return { experimentId: job.experimentId, status: 'stopped' };
}

export function getAllActiveJobs() {
  const jobs = [];
  for (const [id, job] of activeJobs) {
    jobs.push({
      experimentId: id,
      status: job.status,
      startedAt: job.startedAt,
      currentEpoch: job.metrics.epochs.length,
    });
  }
  return jobs;
}
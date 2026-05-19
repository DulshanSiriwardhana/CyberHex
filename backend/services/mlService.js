import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Experiment from '../models/Experiment.js';
import TrainingLog from '../models/TrainingLog.js';
import logger from '../utils/logger.js';
import { spawnTraining } from './trainingRunner.js';
import {
  saveJobSnapshot,
  getJobSnapshot,
  deleteJobSnapshot,
  listJobSnapshots,
} from './jobStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

/** @type {Map<string, { process: import('child_process').ChildProcess, experimentId: string, metrics: object, status: string, startedAt: Date, buffer: string, engine: string }>} */
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
    engine: cfg.engine || 'imperative',
    device: cfg.device || 'cpu',
    mixedPrecision: cfg.mixedPrecision ?? false,
    architecture: cfg.architecture || cfg.modelType || 'mlp',
    dModel: cfg.dModel || 64,
    numHeads: cfg.numHeads || 4,
    transformerLayers: cfg.transformerLayers || 2,
    ffnDim: cfg.ffnDim || 256,
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

function serializeJob(job) {
  return {
    experimentId: job.experimentId,
    status: job.status,
    metrics: job.metrics,
    startedAt: job.startedAt,
    engine: job.engine,
  };
}

async function persistJob(job) {
  await saveJobSnapshot(job.experimentId, serializeJob(job));
}

async function finalizeExperiment(experimentId, job) {
  try {
    const experiment = await Experiment.findById(experimentId);
    if (!experiment) return;

    const terminalStatus =
      job.status === 'completed' ? 'completed' : job.status === 'stopped' ? 'stopped' : 'failed';

    experiment.status = terminalStatus;
    experiment.results = {
      bestTrainLoss: job.metrics.best_train_loss ?? job.metrics.final_train_loss,
      bestValLoss: job.metrics.best_val_loss,
      finalTrainLoss: job.metrics.final_train_loss,
      finalValLoss: job.metrics.final_val_loss,
      epochs: job.metrics.epochs,
      trainLoss: job.metrics.train_loss,
      valLoss: job.metrics.val_loss,
      modelPath: job.metrics.model_path,
      completedAt: new Date(),
    };
    await experiment.save();

    await TrainingLog.findOneAndUpdate(
      { experimentId, status: 'started' },
      {
        status: terminalStatus,
        completedAt: new Date(),
        metrics: job.metrics,
        modelPath: job.metrics.model_path,
      },
      { sort: { startedAt: -1 } }
    );
  } catch (err) {
    logger.error(`Failed to finalize experiment ${experimentId}: ${err.message}`);
  }
}

function resolveTrainingCommand(useCpp, config) {
  if (process.env.ML_TRAINING_SCRIPT) {
    return {
      command: 'node',
      args: [process.env.ML_TRAINING_SCRIPT],
      cwd: projectRoot,
      env: { ...process.env, CYBERHEX_CONFIG: JSON.stringify(config) },
      engine: 'test',
    };
  }

  if (useCpp) {
    const cppBinary = path.join(projectRoot, 'ML', 'models', 'cpp-modules', 'build', 'cyberhex_ml');
    return {
      command: cppBinary,
      args: [],
      cwd: path.join(projectRoot, 'ML', 'models', 'cpp-modules'),
      env: {
        ...process.env,
        CYBERHEX_CONFIG: JSON.stringify(config),
        CYBERHEX_PROJECT_ROOT: projectRoot,
      },
      engine: 'cpp',
    };
  }

  const pythonScript =
    process.env.ML_TRAINING_SCRIPT_PATH ||
    path.join(projectRoot, 'ML', 'models', 'python-modules', 'train.py');

  return {
    command: process.env.PYTHON_EXECUTABLE || 'python3',
    args: [pythonScript],
    cwd: path.join(projectRoot, 'ML', 'models', 'python-modules'),
    env: { ...process.env, CYBERHEX_CONFIG: JSON.stringify(config) },
    engine: 'python',
  };
}

function processOutputLine(job, jobId, line) {
  if (!line.trim()) return;
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
      void persistJob(job);
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
    } else if (parsed.type === 'log') {
      logger.info(`ML [${jobId.slice(-6)}]: ${parsed.message}`);
    }
  } catch {
    logger.warn(`ML [${jobId.slice(-6)}] non-JSON output: ${line.slice(0, 200)}`);
  }
}

function drainStdoutBuffer(job, jobId) {
  const lines = job.buffer.split('\n');
  job.buffer = lines.pop() ?? '';
  for (const line of lines) {
    processOutputLine(job, jobId, line);
  }
}

function attachProcessHandlers(job, childProcess) {
  const jobId = job.experimentId;

  childProcess.stdout.on('data', (data) => {
    job.buffer += data.toString();
    drainStdoutBuffer(job, jobId);
  });

  childProcess.stderr.on('data', (data) => {
    logger.error(`ML [${jobId.slice(-6)}] stderr: ${data.toString().trim()}`);
  });

  childProcess.on('close', async (code) => {
    drainStdoutBuffer(job, jobId);
    if (job.buffer.trim()) {
      processOutputLine(job, jobId, job.buffer.trim());
      job.buffer = '';
    }

    if (job.status === 'running') {
      job.status = code === 0 ? 'completed' : 'failed';
    }

    await persistJob(job);
    if (job.status === 'completed' || job.status === 'failed') {
      await finalizeExperiment(jobId, job);
    }

    if (global.broadcastToExperiment) {
      global.broadcastToExperiment(jobId, {
        type: 'training_complete',
        experimentId: jobId,
        status: job.status,
        metrics: job.metrics,
        exitCode: code,
      });
    }

    activeJobs.delete(jobId);
    logger.info(`ML job ${jobId.slice(-6)} finished with code ${code}`);
  });

  childProcess.on('error', (err) => {
    job.status = 'failed';
    void persistJob(job);
    void finalizeExperiment(jobId, job);
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
}

export async function startTraining(experiment) {
  const jobId = experiment._id.toString();

  const existingLocal = activeJobs.get(jobId);
  const existingRemote = await getJobSnapshot(jobId);
  if (
    (existingLocal && existingLocal.status === 'running') ||
    (existingRemote && existingRemote.status === 'running')
  ) {
    throw new Error('Training already running for this experiment');
  }

  ensureOutputDir();
  const useCpp = process.env.ML_ENGINE === 'cpp';
  const config = useCpp ? buildCppConfig(experiment) : buildPythonConfig(experiment);
  const { command, args, cwd, env, engine } = resolveTrainingCommand(useCpp, config);

  const childProcess = spawnTraining(command, args, { env, cwd });

  const job = {
    process: childProcess,
    experimentId: jobId,
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

  activeJobs.set(jobId, job);
  await persistJob(job);
  attachProcessHandlers(job, childProcess);

  return jobId;
}

export async function getJobStatus(jobId) {
  const local = activeJobs.get(jobId);
  if (local) return serializeJob(local);
  return getJobSnapshot(jobId);
}

export async function stopTraining(jobId) {
  const job = activeJobs.get(jobId);
  if (!job) {
    const snapshot = await getJobSnapshot(jobId);
    if (!snapshot || snapshot.status !== 'running') return null;
    snapshot.status = 'stopped';
    await saveJobSnapshot(jobId, snapshot);
    await finalizeExperiment(jobId, { status: 'stopped', metrics: snapshot.metrics || {} });
    return { experimentId: jobId, status: 'stopped' };
  }

  job.status = 'stopped';
  job.process.kill('SIGTERM');
  await persistJob(job);
  await finalizeExperiment(jobId, job);
  activeJobs.delete(jobId);
  return { experimentId: job.experimentId, status: 'stopped' };
}

export async function getAllActiveJobs() {
  const jobs = [];
  for (const [, job] of activeJobs) {
    jobs.push({
      experimentId: job.experimentId,
      status: job.status,
      startedAt: job.startedAt,
      currentEpoch: job.metrics.epochs.length,
      engine: job.engine,
    });
  }
  const snapshots = await listJobSnapshots();
  for (const snap of snapshots) {
    if (snap.status === 'running' && !activeJobs.has(snap.experimentId)) {
      jobs.push({
        experimentId: snap.experimentId,
        status: snap.status,
        startedAt: snap.startedAt,
        currentEpoch: snap.metrics?.epochs?.length ?? 0,
        engine: snap.engine,
        stale: true,
      });
    }
  }
  return jobs;
}

/** Test helper — clear in-memory runners without touching Redis. */
export function _resetActiveJobsForTests() {
  for (const [, job] of activeJobs) {
    try {
      job.process.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  }
  activeJobs.clear();
}

export async function _clearJobStoreForTests() {
  _resetActiveJobsForTests();
  const { clearAllJobSnapshots } = await import('./jobStore.js');
  await clearAllJobSnapshots();
}

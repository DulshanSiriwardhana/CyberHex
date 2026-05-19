/**
 * CyberHex ML Engine REST API — model registry and real inference.
 */
import express from 'express';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { runInference } from '../services/inferenceService.js';
import { exportOnnx } from '../services/exportService.js';
import { cacheGet, cacheSet, cacheDel } from '../services/cacheService.js';
import logger from '../utils/logger.js';

const router = express.Router();
const MODEL_CACHE_PREFIX = 'engine:model:';

async function getLoadedModel(id) {
  return cacheGet(`${MODEL_CACHE_PREFIX}${id}`);
}

async function setLoadedModel(record) {
  await cacheSet(`${MODEL_CACHE_PREFIX}${record.id}`, record, 0);
}

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    engine: process.env.ML_ENGINE ?? 'python',
    inference: process.env.ML_INFER_ENGINE ?? 'auto',
    features: ['python-numpy', 'cpp-mlp', 'onnx-export'],
    distributed: ['file-allreduce', 'mpi-optional'],
    timestamp: new Date().toISOString(),
  });
});

router.get('/models', asyncHandler(async (_req, res) => {
  res.json({
    message: 'Use GET /models/:id for a loaded model',
    hint: 'POST /models/load to register a model path',
  });
}));

router.get('/models/:id', asyncHandler(async (req, res) => {
  const model = await getLoadedModel(req.params.id);
  if (!model) throw new NotFoundError(`Model not loaded: ${req.params.id}`);
  res.json({ model });
}));

router.post('/models/load', asyncHandler(async (req, res) => {
  const { id, format, url, backend, modelPath } = req.body ?? {};
  if (!id) throw new ValidationError('Model id is required');
  if (!modelPath && !url) {
    throw new ValidationError('modelPath or url is required');
  }

  const record = {
    id,
    format: format ?? 'npz',
    url: url ?? '',
    modelPath: modelPath || url,
    backend: backend ?? 'python-numpy',
    loadedAt: Date.now(),
  };

  await setLoadedModel(record);
  logger.info(`[Engine] Model loaded: ${id} -> ${record.modelPath}`);
  res.json({ success: true, modelId: id, status: 'ready', model: record });
}));

router.post('/models/unload', asyncHandler(async (req, res) => {
  const { modelId } = req.body ?? {};
  if (!modelId) throw new ValidationError('modelId is required');
  await cacheDel(`${MODEL_CACHE_PREFIX}${modelId}`);
  logger.info(`[Engine] Model unloaded: ${modelId}`);
  res.json({ success: true, modelId });
}));

router.post('/models/export', asyncHandler(async (req, res) => {
  const { weightsPrefix, onnxPath, task } = req.body ?? {};
  if (!weightsPrefix) throw new ValidationError('weightsPrefix is required');

  const result = await exportOnnx({ weightsPrefix, onnxPath, task });
  res.json(result);
}));

router.post('/inference', asyncHandler(async (req, res) => {
  const { modelId, features, task } = req.body ?? {};

  let modelPath = req.body?.modelPath;
  if (modelId) {
    const loaded = await getLoadedModel(modelId);
    if (!loaded) throw new NotFoundError(`Model not loaded: ${modelId}`);
    modelPath = loaded.modelPath;
  }

  if (!modelPath) {
    throw new ValidationError('modelId (loaded) or modelPath is required');
  }
  if (!features || !Array.isArray(features)) {
    throw new ValidationError('features array is required');
  }

  const result = await runInference({
    modelPath,
    features,
    task: task ?? 'regression',
  });

  res.json({
    success: true,
    modelId: modelId ?? null,
    ...result,
  });
}));

export default router;

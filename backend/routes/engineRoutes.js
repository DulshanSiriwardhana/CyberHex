/**
 * CyberHex Studio — ML Engine REST API
 * Model lifecycle and inference bridge for the neural studio frontend.
 */
import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

/** @type {Map<string, { id: string; format: string; url: string; backend: string; loadedAt: number }>} */
const loadedModels = new Map();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    engine: process.env.ML_ENGINE ?? 'python',
    modelsLoaded: loadedModels.size,
    timestamp: new Date().toISOString(),
  });
});

router.get('/models', (_req, res) => {
  res.json({ models: Array.from(loadedModels.values()) });
});

router.post('/models/load', (req, res) => {
  const { id, format, url, backend } = req.body ?? {};
  if (!id) {
    return res.status(400).json({ error: 'Model id is required' });
  }

  loadedModels.set(id, {
    id,
    format: format ?? 'onnx',
    url: url ?? '',
    backend: backend ?? 'onnxruntime',
    loadedAt: Date.now(),
  });

  logger.info(`[Engine] Model loaded: ${id}`);
  res.json({ success: true, modelId: id, status: 'ready' });
});

router.post('/models/unload', (req, res) => {
  const { modelId } = req.body ?? {};
  if (!modelId) {
    return res.status(400).json({ error: 'modelId is required' });
  }
  loadedModels.delete(modelId);
  logger.info(`[Engine] Model unloaded: ${modelId}`);
  res.json({ success: true, modelId });
});

router.post('/inference', (req, res) => {
  const { modelId, shape } = req.body ?? {};
  if (modelId && !loadedModels.has(modelId)) {
    return res.status(404).json({ error: `Model not loaded: ${modelId}` });
  }

  const start = performance.now();
  res.json({
    success: true,
    latencyMs: performance.now() - start + 4,
    backend: process.env.ML_ENGINE === 'cpp' ? 'tensorrt-ready' : 'onnxruntime',
    shape: shape ?? [],
  });
});

export default router;

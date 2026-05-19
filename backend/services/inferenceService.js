/**
 * Model inference — ONNX Runtime, C++ MLP weights, or Python NumPy (.npz).
 * @module services/inferenceService
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawnTraining } from './trainingRunner.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

const INFER_SCRIPT = path.join(projectRoot, 'ML', 'models', 'python-modules', 'infer.py');
const INFER_ONNX_SCRIPT = path.join(projectRoot, 'ML', 'scripts', 'infer_onnx.py');
const INFER_CPP = path.join(projectRoot, 'ML', 'models', 'cpp-modules', 'build', 'cyberhex_infer');

function resolveWeightsPrefix(modelPath) {
  let prefix = modelPath;
  if (prefix.endsWith('_weights')) {
    prefix = prefix.slice(0, -'_weights'.length);
  }
  if (fs.existsSync(prefix) && fs.statSync(prefix).isDirectory()) {
    return prefix;
  }
  return null;
}

function resolveOnnxPath(modelPath) {
  if (modelPath.endsWith('.onnx') && fs.existsSync(modelPath)) {
    return modelPath;
  }
  const prefix = resolveWeightsPrefix(modelPath);
  if (!prefix) return null;
  const candidate = path.join(prefix, 'model.onnx');
  return fs.existsSync(candidate) ? candidate : null;
}

function shouldUseOnnxInfer(modelPath) {
  const engine = process.env.ML_INFER_ENGINE ?? 'auto';
  if (engine === 'onnx') return Boolean(resolveOnnxPath(modelPath));
  if (engine === 'cpp' || engine === 'python') return false;
  return Boolean(resolveOnnxPath(modelPath));
}

function shouldUseCppInfer(modelPath) {
  const engine = process.env.ML_INFER_ENGINE ?? 'auto';
  if (engine === 'python' || engine === 'onnx') return false;
  if (engine === 'cpp') return true;

  const prefix = resolveWeightsPrefix(modelPath);
  if (!prefix) return false;
  return (
    fs.existsSync(path.join(prefix, 'layer_0.json')) ||
    fs.existsSync(path.join(prefix, 'layer_0_weights.bin'))
  );
}

function parseInferStdout(stdout, defaultBackend) {
  const line = stdout.trim().split('\n').pop();
  const parsed = JSON.parse(line);
  if (parsed.error) throw new Error(parsed.error);
  return {
    success: true,
    predictions: parsed.predictions,
    shape: parsed.shape,
    backend: parsed.backend || defaultBackend,
  };
}

function runOnnxInference({ modelPath, features, task }) {
  return new Promise((resolve, reject) => {
    const onnxPath = resolveOnnxPath(modelPath);
    if (!onnxPath) {
      return reject(new Error(`No ONNX model found for ${modelPath}`));
    }

    const start = performance.now();
    const python = process.env.PYTHON_EXECUTABLE || 'python3';
    const config = { model_path: modelPath, onnx_path: onnxPath, features, task };
    const child = spawnTraining(python, [INFER_ONNX_SCRIPT], {
      env: { ...process.env, CYBERHEX_INFER_CONFIG: JSON.stringify(config) },
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += c.toString(); });
    child.stderr.on('data', (c) => { stderr += c.toString(); });
    child.on('close', (code) => {
      const latencyMs = performance.now() - start;
      if (code !== 0) {
        return reject(new Error(stderr.trim() || `ONNX infer exit ${code}`));
      }
      try {
        resolve({ ...parseInferStdout(stdout, 'onnxruntime'), latencyMs: Math.round(latencyMs * 100) / 100 });
      } catch (err) {
        reject(err);
      }
    });
    child.on('error', reject);
  });
}

function runCppInference({ modelPath, features, task }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(INFER_CPP)) {
      return reject(new Error('cyberhex_infer not built; run cmake in ML/models/cpp-modules'));
    }

    const start = performance.now();
    const config = { model_path: modelPath, features, task };
    const child = spawnTraining(INFER_CPP, [], {
      env: { ...process.env, CYBERHEX_INFER_CONFIG: JSON.stringify(config) },
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += c.toString(); });
    child.stderr.on('data', (c) => { stderr += c.toString(); });
    child.on('close', (code) => {
      const latencyMs = performance.now() - start;
      if (code !== 0) {
        return reject(new Error(stderr.trim() || `C++ infer exit ${code}`));
      }
      try {
        resolve({ ...parseInferStdout(stdout, 'cpp'), latencyMs: Math.round(latencyMs * 100) / 100 });
      } catch (err) {
        reject(err);
      }
    });
    child.on('error', reject);
  });
}

function runPythonInference({ modelPath, features, task }) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const config = { model_path: modelPath, features, task };
    const python = process.env.PYTHON_EXECUTABLE || 'python3';

    const child = spawnTraining(python, [INFER_SCRIPT], {
      env: { ...process.env, CYBERHEX_INFER_CONFIG: JSON.stringify(config) },
      cwd: path.dirname(INFER_SCRIPT),
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    child.on('close', (code) => {
      const latencyMs = performance.now() - start;
      if (code !== 0) {
        logger.error(`Inference failed: ${stderr.slice(0, 500)}`);
        return reject(new Error(stderr.trim() || `Inference exited with code ${code}`));
      }
      try {
        resolve({
          ...parseInferStdout(stdout, 'python-numpy'),
          latencyMs: Math.round(latencyMs * 100) / 100,
        });
      } catch (err) {
        reject(err);
      }
    });
    child.on('error', reject);
  });
}

/**
 * Run inference on a saved model.
 * @param {{ modelPath: string, features: number[][], task?: string }} params
 */
export function runInference({ modelPath, features, task = 'regression' }) {
  if (!modelPath) {
    return Promise.reject(new Error('modelPath is required'));
  }

  const prefix = resolveWeightsPrefix(modelPath);
  const npzExists = fs.existsSync(modelPath) && modelPath.endsWith('.npz');
  const onnxPath = resolveOnnxPath(modelPath);

  if (shouldUseOnnxInfer(modelPath)) {
    return runOnnxInference({ modelPath: onnxPath ?? modelPath, features, task });
  }

  if (prefix && shouldUseCppInfer(modelPath) && !npzExists) {
    return runCppInference({ modelPath, features, task });
  }

  if (!fs.existsSync(modelPath) && !prefix && !onnxPath) {
    return Promise.reject(new Error(`Model not found: ${modelPath}`));
  }

  return runPythonInference({ modelPath, features, task });
}

export default { runInference };

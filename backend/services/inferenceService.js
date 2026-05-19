/**
<<<<<<< HEAD
<<<<<<< HEAD
 * Model inference via Python NumPy runner (weights from train.py .npz).
=======
 * Model inference — Python NumPy (.npz) or C++ binary/json weights.
>>>>>>> v3.0
=======
 * Model inference — Python NumPy (.npz) or C++ binary/json weights.
>>>>>>> master
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
const INFER_CPP = path.join(projectRoot, 'ML', 'models', 'cpp-modules', 'build', 'cyberhex_infer');
>>>>>>> master

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

function shouldUseCppInfer(modelPath) {
  if (process.env.ML_INFER_ENGINE === 'python') return false;
  if (process.env.ML_INFER_ENGINE === 'cpp') return true;

  const prefix = resolveWeightsPrefix(modelPath);
  if (!prefix) return false;
  return (
    fs.existsSync(path.join(prefix, 'layer_0.json')) ||
    fs.existsSync(path.join(prefix, 'layer_0_weights.bin'))
  );
}

function runCppInference({ modelPath, features, task }) {
  return new Promise((resolve, reject) => {
<<<<<<< HEAD
    if (!modelPath || !fs.existsSync(modelPath)) {
      return reject(new Error(`Model file not found: ${modelPath}`));
=======
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

function shouldUseCppInfer(modelPath) {
  if (process.env.ML_INFER_ENGINE === 'python') return false;
  if (process.env.ML_INFER_ENGINE === 'cpp') return true;

  const prefix = resolveWeightsPrefix(modelPath);
  if (!prefix) return false;
  return (
    fs.existsSync(path.join(prefix, 'layer_0.json')) ||
    fs.existsSync(path.join(prefix, 'layer_0_weights.bin'))
  );
}

function runCppInference({ modelPath, features, task }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(INFER_CPP)) {
      return reject(new Error('cyberhex_infer not built; run cmake in ML/models/cpp-modules'));
>>>>>>> v3.0
=======
    if (!fs.existsSync(INFER_CPP)) {
      return reject(new Error('cyberhex_infer not built; run cmake in ML/models/cpp-modules'));
>>>>>>> master
    }

    const start = performance.now();
    const config = { model_path: modelPath, features, task };
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> master
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
      const line = stdout.trim().split('\n').pop();
      try {
        const parsed = JSON.parse(line);
        if (parsed.error) return reject(new Error(parsed.error));
        resolve({
          success: true,
          predictions: parsed.predictions,
          shape: parsed.shape,
          backend: parsed.backend || 'cpp',
          latencyMs: Math.round(latencyMs * 100) / 100,
        });
      } catch {
        reject(new Error(`Invalid C++ inference output: ${line?.slice(0, 200)}`));
      }
    });
    child.on('error', reject);
  });
}

function runPythonInference({ modelPath, features, task }) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const config = { model_path: modelPath, features, task };
<<<<<<< HEAD
>>>>>>> v3.0
=======
>>>>>>> master
    const python = process.env.PYTHON_EXECUTABLE || 'python3';

    const child = spawnTraining(python, [INFER_SCRIPT], {
      env: { ...process.env, CYBERHEX_INFER_CONFIG: JSON.stringify(config) },
      cwd: path.dirname(INFER_SCRIPT),
    });

    let stdout = '';
    let stderr = '';
<<<<<<< HEAD
<<<<<<< HEAD

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
=======
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
>>>>>>> v3.0
=======
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
>>>>>>> master

    child.on('close', (code) => {
      const latencyMs = performance.now() - start;
      if (code !== 0) {
        logger.error(`Inference failed: ${stderr.slice(0, 500)}`);
        return reject(new Error(stderr.trim() || `Inference exited with code ${code}`));
      }

      const line = stdout.trim().split('\n').pop();
      try {
        const parsed = JSON.parse(line);
        if (parsed.error) return reject(new Error(parsed.error));
        resolve({
          success: true,
          predictions: parsed.predictions,
          shape: parsed.shape,
          backend: parsed.backend || 'python-numpy',
          latencyMs: Math.round(latencyMs * 100) / 100,
        });
<<<<<<< HEAD
<<<<<<< HEAD
      } catch (err) {
        reject(new Error(`Invalid inference output: ${line?.slice(0, 200)}`));
      }
    });

=======
      } catch {
        reject(new Error(`Invalid inference output: ${line?.slice(0, 200)}`));
      }
    });
>>>>>>> v3.0
=======
      } catch {
        reject(new Error(`Invalid inference output: ${line?.slice(0, 200)}`));
      }
    });
>>>>>>> master
    child.on('error', reject);
  });
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> master
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
  const cppDir = prefix && shouldUseCppInfer(modelPath);

  if (cppDir && !npzExists) {
    return runCppInference({ modelPath, features, task });
  }

  if (!fs.existsSync(modelPath) && !cppDir) {
    return Promise.reject(new Error(`Model not found: ${modelPath}`));
  }

  return runPythonInference({ modelPath, features, task });
}

<<<<<<< HEAD
>>>>>>> v3.0
=======
>>>>>>> master
export default { runInference };

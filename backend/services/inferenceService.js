/**
 * Model inference via Python NumPy runner (weights from train.py .npz).
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

/**
 * Run inference on a saved model.
 * @param {{ modelPath: string, features: number[][], task?: string }} params
 * @returns {Promise<{ success: boolean, predictions: number[][], shape: number[], latencyMs: number, backend: string }>}
 */
export function runInference({ modelPath, features, task = 'regression' }) {
  return new Promise((resolve, reject) => {
    if (!modelPath || !fs.existsSync(modelPath)) {
      return reject(new Error(`Model file not found: ${modelPath}`));
    }

    const start = performance.now();
    const config = { model_path: modelPath, features, task };
    const python = process.env.PYTHON_EXECUTABLE || 'python3';

    const child = spawnTraining(python, [INFER_SCRIPT], {
      env: { ...process.env, CYBERHEX_INFER_CONFIG: JSON.stringify(config) },
      cwd: path.dirname(INFER_SCRIPT),
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

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
      } catch (err) {
        reject(new Error(`Invalid inference output: ${line?.slice(0, 200)}`));
      }
    });

    child.on('error', reject);
  });
}

export default { runInference };

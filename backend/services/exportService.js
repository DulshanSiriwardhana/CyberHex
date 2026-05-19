/**
 * ONNX export: C++ manifest + Python onnx builder.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawnTraining } from './trainingRunner.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

const EXPORT_BIN = path.join(projectRoot, 'ML/models/cpp-modules/build/cyberhex_export');
const EXPORT_SCRIPT = path.join(projectRoot, 'ML/scripts/export_onnx.py');

function runProcess(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawnTraining(cmd, args, { env: { ...process.env, ...env } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += c.toString(); });
    child.stderr.on('data', (c) => { stderr += c.toString(); });
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr.trim() || `Exit ${code}`));
      }
      const line = stdout.trim().split('\n').pop();
      try {
        resolve(JSON.parse(line));
      } catch {
        resolve({ raw: line });
      }
    });
    child.on('error', reject);
  });
}

/**
 * @param {{ weightsPrefix: string, onnxPath?: string, task?: string }} params
 */
export async function exportOnnx({ weightsPrefix, onnxPath, task = 'regression' }) {
  if (!weightsPrefix || !fs.existsSync(weightsPrefix)) {
    throw new Error(`Weights prefix not found: ${weightsPrefix}`);
  }

  const config = { weightsPrefix, onnxPath, task };
  let manifestPath = path.join(weightsPrefix, 'export_manifest.json');

  if (fs.existsSync(EXPORT_BIN)) {
    const manifestResult = await runProcess(EXPORT_BIN, [], {
      CYBERHEX_EXPORT_CONFIG: JSON.stringify(config),
    });
    if (manifestResult.manifest_path) {
      manifestPath = manifestResult.manifest_path;
    }
  } else if (!fs.existsSync(manifestPath)) {
    throw new Error('cyberhex_export binary not built; run cmake in ML/models/cpp-modules');
  }

  const outPath = onnxPath || path.join(weightsPrefix, 'model.onnx');
  const python = process.env.PYTHON_EXECUTABLE || 'python3';
  const onnxResult = await runProcess(python, [EXPORT_SCRIPT], {
    CYBERHEX_EXPORT_CONFIG: JSON.stringify({
      manifest_path: manifestPath,
      onnx_path: outPath,
    }),
  });

  logger.info(`[Export] ONNX written: ${onnxResult.onnx_path || outPath}`);
  return {
    success: true,
    manifestPath,
    onnxPath: onnxResult.onnx_path || outPath,
    backend: onnxResult.backend || 'onnx-python',
  };
}

export default { exportOnnx };

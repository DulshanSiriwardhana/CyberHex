import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import request from 'supertest';
import app from '../app.js';

const hasNumpy = await (async () => {
  try {
    const { spawn } = await import('child_process');
    return new Promise((resolve) => {
      const p = spawn('python3', ['-c', 'import numpy']);
      p.on('close', (code) => resolve(code === 0));
      p.on('error', () => resolve(false));
    });
  } catch {
    return false;
  }
})();

const describeIfNumpy = hasNumpy ? describe : describe.skip;

describeIfNumpy('Engine inference API', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, '../..');
  const trainScript = path.join(projectRoot, 'ML/models/python-modules/train.py');
  let modelPath;

  beforeAll(async () => {
    const { spawn } = await import('child_process');
    const config = JSON.stringify({ epochs: 1, batch_size: 32, layers: [5, 8, 1] });

    await new Promise((resolve, reject) => {
      const child = spawn('python3', [trainScript], {
        env: { ...process.env, CYBERHEX_CONFIG: config },
        cwd: path.dirname(trainScript),
      });
      let out = '';
      child.stdout.on('data', (d) => {
        out += d.toString();
      });
      child.on('close', (code) => {
        if (code !== 0) return reject(new Error('train.py failed'));
        const lines = out.trim().split('\n');
        const last = JSON.parse(lines[lines.length - 1]);
        modelPath = last.model_path;
        resolve();
      });
    });
  }, 60000);

  it('runs inference on a trained model', async () => {
    const loadRes = await request(app).post('/api/v1/engine/models/load').send({
      id: 'test-model',
      modelPath,
    });
    expect(loadRes.statusCode).toBe(200);

    const inferRes = await request(app).post('/api/v1/engine/inference').send({
      modelId: 'test-model',
      features: [[0.1, 0.2, 0.3, 0.4, 0.5]],
      task: 'regression',
    });

    expect(inferRes.statusCode).toBe(200);
    expect(inferRes.body.success).toBe(true);
    expect(inferRes.body.predictions).toBeDefined();
    expect(inferRes.body.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

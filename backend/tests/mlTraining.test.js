import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../app.js';
import Experiment from '../models/Experiment.js';
import { createTestUser, authHeader } from './helpers/testAuth.js';
import { _clearJobStoreForTests } from '../services/mlService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fakeTrainer = path.join(__dirname, 'fixtures', 'fake_trainer.mjs');

describe('ML Training API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    process.env.ML_TRAINING_SCRIPT = fakeTrainer;
    process.env.ML_ENGINE = 'python';
    const { accessToken, user } = await createTestUser();
    token = accessToken;
    userId = user._id.toString();
  });

  afterEach(async () => {
    await _clearJobStoreForTests();
    await Experiment.deleteMany({ userId });
  });

  afterAll(() => {
    delete process.env.ML_TRAINING_SCRIPT;
  });

  it('creates an experiment and starts training with metrics', async () => {
    const createRes = await request(app)
      .post('/api/v1/experiments')
      .set(authHeader(token))
      .send({
        name: 'Integration Test Run',
        config: { epochs: 2, batchSize: 8, layers: [5, 8, 1] },
      });

    expect(createRes.statusCode).toBe(201);
    const experimentId = createRes.body.experiment._id;

    const trainRes = await request(app)
      .post(`/api/v1/ml/experiments/${experimentId}/train`)
      .set(authHeader(token));

    expect(trainRes.statusCode).toBe(200);
    expect(trainRes.body.status).toBe('training');

    let experiment = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 100));
      experiment = await Experiment.findById(experimentId);
      if (experiment?.status === 'completed') break;
    }

    const statusRes = await request(app)
      .get(`/api/v1/ml/experiments/${experimentId}/status`)
      .set(authHeader(token));

    expect(statusRes.statusCode).toBe(200);
    expect(experiment.status).toBe('completed');
    expect(experiment.results?.epochs?.length).toBeGreaterThanOrEqual(1);
    if (statusRes.body.metrics?.epochs) {
      expect(statusRes.body.metrics.epochs.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('rejects duplicate training while running', async () => {
    const createRes = await request(app)
      .post('/api/v1/experiments')
      .set(authHeader(token))
      .send({ name: 'Dup Test', config: { epochs: 5 } });

    const experimentId = createRes.body.experiment._id;

    await request(app)
      .post(`/api/v1/ml/experiments/${experimentId}/train`)
      .set(authHeader(token));

    const dupRes = await request(app)
      .post(`/api/v1/ml/experiments/${experimentId}/train`)
      .set(authHeader(token));

    expect(dupRes.statusCode).toBe(409);
  });
});

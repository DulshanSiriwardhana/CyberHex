# CyberHex v5 — Phase 1 Platform Layer

## Redis job store

Training job metadata is persisted via `backend/services/jobStore.js`:

- Key: `ml:job:{experimentId}`
- TTL: 24 hours
- Falls back to in-memory when Redis is unavailable (same pattern as `cacheService`)

Active child processes remain in `mlService` local `Map`; Redis holds serializable status and metrics for recovery and multi-instance readiness.

## Training runner seam

`backend/services/trainingRunner.js` wraps `child_process.spawn` for unit/integration testing.

Test override: `ML_TRAINING_SCRIPT=/path/to/fake_trainer.mjs`

## Experiment auto-finalize

On `training_complete` or process exit, `mlService` updates:

- `Experiment.status` and `Experiment.results`
- Latest `TrainingLog` entry

## Real inference

| Component | Path |
|-----------|------|
| Python CLI | `ML/models/python-modules/infer.py` |
| Service | `backend/services/inferenceService.js` |
| API | `POST /api/v1/engine/inference` |

Load a model:

```http
POST /api/v1/engine/models/load
{ "id": "my-model", "modelPath": "/path/to/model_123.npz" }
```

Run inference:

```http
POST /api/v1/engine/inference
{ "modelId": "my-model", "features": [[0.1, 0.2, 0.3, 0.4, 0.5]], "task": "regression" }
```

## Docker Compose

- `redis` service on port 6379
- Backend `REDIS_URL=redis://redis:6379`
- `ML` volume mounted for training outputs
- Backend image includes `python3` + `numpy`

## Environment

| Variable | Purpose |
|----------|---------|
| `REDIS_URL` | Job + engine model registry cache |
| `ML_ENGINE` | `python` (default) or `cpp` |
| `ML_TRAINING_SCRIPT` | Override trainer binary (tests) |
| `PYTHON_EXECUTABLE` | Python path for train/infer |

## Tests

- `backend/tests/mlTraining.test.js` — experiment → train → status
- `backend/tests/inference.test.js` — train + infer (requires numpy)
- `backend/tests/helpers/testAuth.js` — OTP-bypass test users

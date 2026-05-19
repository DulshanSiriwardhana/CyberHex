# CyberHex Training Protocol (v1)

**Schema ID:** `cyberhex.train.v1`  
**Transport:** `CYBERHEX_CONFIG` environment variable (JSON object)  
**Process I/O:** newline-delimited JSON on stdout

## Configuration

The backend (`backend/services/mlService.js`) builds config via `buildCppConfig()` / `buildPythonConfig()`. Engines must accept:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `task` | string | `regression` | `regression` or `classification` |
| `layers` | int[] | `[64,32,1]` | Hidden topology; input dim adjusted at runtime |
| `activations` | string[] | `relu`… | Per dense block (`linear` = identity) |
| `loss` | string | `mse` | `mse`, `mae`, `bce`, `cce`, … |
| `batchSize` | int | `32` | Also accepts `batch_size` |
| `epochs` | int | `100` | |
| `learningRate` | float | `0.001` | Also `learning_rate` |
| `optimizer` | string | `adam` | `sgd`, `adam`, `rmsprop`, … |
| `validationSplit` | float | `0.2` | Hold-out fraction inside `Model::fit` |
| `earlyStopping` | bool | `true` | |
| `patience` | int | `10` | |
| `dataPath` / `data_path` | string | null | CSV path (features + label column) |
| `seed` | int | `42` | Synthetic data only |

## Stdout messages

### Epoch progress

```json
{"type":"epoch","epoch":1,"train_loss":0.42,"val_loss":0.38}
```

### Log line

```json
{"type":"log","message":"Generated synthetic regression data (1000 x 5)"}
```

### Completion

```json
{"type":"training_complete","final_train_loss":0.12,"final_val_loss":0.15,"model_path":"/path/to/model_12345_weights"}
```

## Binaries

| Binary | Purpose |
|--------|---------|
| `build/cyberhex_ml` | Production trainer (`ML_ENGINE=cpp`) |
| `build/app` | Local examples / dev |
| `build/unit_tests` | Catch2 suite |

## Environment

| Variable | Set by | Purpose |
|----------|--------|---------|
| `CYBERHEX_CONFIG` | Backend | Job JSON |
| `CYBERHEX_PROJECT_ROOT` | Backend | Resolve `ML/models/outputs` |
| `ML_ENGINE` | Docker / ops | `python` (default) or `cpp` |

## Architecture

```
Experiment API → mlService.js → spawn(cyberhex_ml)
                     ↓ stdout JSON lines
              WebSocket broadcast → client charts
```

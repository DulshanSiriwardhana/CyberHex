# CyberHex v5 — Phase 6: Production GPU & Platform Integration

## Overview

Phase 6 hardens the runtime for production use: real CUDA GEMM, graph ONNX export, ONNX Runtime inference, and dashboard integration.

```
Train → weights/ + export_manifest.json
     → export_onnx.py → model.onnx
     → infer_onnx.py (ONNX Runtime) | cyberhex_infer (C++)

Dashboard: Experiment detail → Export ONNX | Run Inference
```

## CUDA (`CYBERHEX_ENABLE_CUDA`)

- `cuda/matmul.cu` — device GEMM kernel (`16×16` thread blocks)
- `cyberhex_cuda_runtime_available()` — probes `cudaGetDeviceCount`
- `Device::cuda_available()` reflects real hardware (not compile-time only)
- Fallback: host stub when `nvcc` is missing

```bash
cmake -B build -DCYBERHEX_ENABLE_CUDA=ON
cmake --build build
```

Request CUDA training: `"device": "cuda"` in `CYBERHEX_CONFIG`.

## ONNX export (graph + imperative)

| Manifest `kind` | Weights |
|-----------------|---------|
| (default) MLP | `layer_*.json` |
| `graph_mlp` | `param_*.bin` |

`write_any_export_manifest()` picks the correct format.  
`ML/scripts/export_onnx.py` builds ONNX for both.

## ONNX Runtime inference

Priority when `ML_INFER_ENGINE=auto`:

1. `model.onnx` beside weights → `infer_onnx.py`
2. C++ layer JSON/binary → `cyberhex_infer`
3. Python `.npz` → `infer.py`

Force backend: `ML_INFER_ENGINE=onnx|cpp|python`.

## Client integration

- `engineApi` in `client/src/lib/api.ts`
- Experiment detail page: **Export ONNX**, **Run Inference** (uses `results.modelPath` from training)

## API

| Endpoint | Action |
|----------|--------|
| `GET /api/v1/engine/health` | Engine capabilities |
| `POST /api/v1/engine/inference` | Run inference |
| `POST /api/v1/engine/models/export` | Build ONNX |

## Tests

```bash
cd ML/models/cpp-modules/build
ctest
./unit_tests "[onnx]"
./unit_tests "[onnx][graph]"
```

Optional CUDA smoke (requires GPU + CUDA build):

```bash
./unit_tests "[cuda]"
```

# CyberHex v5 — Phase 5: Interop (ONNX, C++ inference, collectives)

## Overview

Phase 5 makes trained models portable and multi-process ready:

```
Train (cyberhex_ml) → weights/ → cyberhex_infer (C++ API)
                      ↘ export_manifest → export_onnx.py → model.onnx

Distributed: CYBERHEX_DIST_DIR (file allreduce) | MPI (optional build)
```

## ONNX export (`cyberhex.onnx.v1`)

1. Training with `"exportOnnx": true` writes `export_manifest.json` beside layer JSON weights.
2. `POST /api/engine/models/export` or `cyberhex_export` + `ML/scripts/export_onnx.py`.

```bash
CYBERHEX_EXPORT_CONFIG='{"weightsPrefix":"/path/model_123","onnxPath":"/path/model.onnx"}' \
  ./build/cyberhex_export

pip install onnx
CYBERHEX_EXPORT_CONFIG='{"manifest_path":"/path/export_manifest.json"}' \
  python3 ML/scripts/export_onnx.py
```

## C++ inference (`cyberhex.infer.v1`)

Binary (`layer_N_weights.bin`) or JSON (`layer_N.json`) MLP prefixes.

```bash
CYBERHEX_INFER_CONFIG='{"model_path":"/path/model_123","features":[[1,2,3,4,5]],"task":"regression"}' \
  ./build/cyberhex_infer
```

Backend auto-selects C++ when `layer_0.json` or `layer_0_weights.bin` exists (`ML_INFER_ENGINE=cpp|python|auto`).

## Distributed collectives (`cyberhex.dist.v1`)

| Backend | Enable |
|---------|--------|
| LOCAL | Default: `grad /= world_size` |
| FILE | `CYBERHEX_DIST_DIR=/shared/grads` + launch N processes with ranks |
| MPI | `cmake -DCYBERHEX_USE_MPI=ON` + `mpirun -n 4 ./cyberhex_ml` |

File backend: each rank writes `step_{t}/param_{p}/rank_{r}.bin`, barrier, sum, mean.

## Binaries

| Target | Role |
|--------|------|
| `cyberhex_ml` | Training |
| `cyberhex_infer` | MLP inference |
| `cyberhex_export` | ONNX manifest |
| `cyberhex_bench` | Matmul benchmark |

## CMake options

```bash
cmake -B build -DCYBERHEX_ENABLE_CUDA=ON -DCYBERHEX_USE_MPI=ON
```

## Tests

```bash
cd ML/models/cpp-modules/build
ctest
./unit_tests "[onnx]"
./unit_tests "[distributed]"
```

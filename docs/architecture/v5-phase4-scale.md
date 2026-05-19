# CyberHex v5 — Phase 4: Scale (CUDA dispatch, graph training, transformer, distributed)

## Overview

Phase 4 connects the Phase 3 graph runtime to production training, adds transformer blocks, device-aware GEMM dispatch, and a minimal distributed gradient protocol.

```
CYBERHEX_CONFIG → cyberhex_ml
    ├─ engine: imperative → Model::fit (default)
    ├─ engine: graph      → GraphTrainer::fit
    └─ architecture: transformer → TransformerEncoderBlock stack

dispatch_matmul(Device) → CPU (OpenMP dot) | CUDA (CYBERHEX_CUDA build)
```

## Training config (`cyberhex.train.v1` extensions)

| Field | Values | Default |
|-------|--------|---------|
| `engine` | `imperative`, `graph` | `imperative` |
| `device` | `cpu`, `cuda` | `cpu` |
| `mixedPrecision` | bool | `false` |
| `architecture` | `mlp`, `transformer` | `mlp` |
| `dModel`, `numHeads`, `transformerLayers`, `ffnDim` | ints | 64, 4, 2, 256 |

Backend `buildCppConfig()` forwards these fields when `ML_ENGINE=cpp`.

## Graph production path

```json
{
  "engine": "graph",
  "epochs": 50,
  "layers": [10, 64, 1],
  "activations": ["relu", "linear"],
  "mixedPrecision": false
}
```

Weights saved under `ML/models/outputs/graph_<pid>/param_*.bin`.

## Transformer

`TransformerEncoderBlock`: multi-head self-attention + layer norm + GELU FFN + layer norm.

```json
{
  "architecture": "transformer",
  "dModel": 32,
  "numHeads": 4,
  "transformerLayers": 2,
  "ffnDim": 64,
  "epochs": 20
}
```

Input columns are padded/truncated to `dModel` when needed.

## CUDA

```bash
cmake -B build -DCYBERHEX_ENABLE_CUDA=ON
cmake --build build
```

Without `CYBERHEX_CUDA`, requesting `device: cuda` throws at runtime (no silent CPU fallback).

Env override: `CYBERHEX_DEVICE=cuda|cpu`.

## Distributed (`cyberhex.dist.v1`)

| Env | Meaning |
|-----|---------|
| `CYBERHEX_RANK` | Process rank (0-based) |
| `CYBERHEX_WORLD_SIZE` | World size |

Phase 4 applies in-process mean scaling of gradients (`grad /= world_size`). Multi-node collectives are Phase 5.

## Modules

| File | Purpose |
|------|---------|
| `ops_dispatch.h/cpp` | Device-aware GEMM |
| `cuda_matmul_stub.cpp` | CUDA build entry (host stub; replace with `.cu` kernels) |
| `transformer.h/cpp` | MHSA + encoder block |
| `distributed.h/cpp` | Rank context + allreduce mean |
| `graph.h` (extended) | `fit()`, `save_weights()`, distributed `train_step` |

## Tests

```bash
cd ML/models/cpp-modules
cmake -B build && cmake --build build
ctest
./build/unit_tests "[transformer]"
./build/unit_tests "[graph]"
```

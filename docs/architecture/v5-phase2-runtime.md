# CyberHex v5 — Phase 2 Runtime

## Tensor ABI (`include/tensor.h`)

- `TensorView<T>` — non-owning sub-matrix window into `Matrix<T>`
- `broadcast_add(a, b)` — NumPy-style broadcasting for 2D tensors (row/column/scalar)

## New layers

| Layer | Header | Input layout |
|-------|--------|--------------|
| `Conv2D` | `conv2d.h` | `(batch, in_c·H·W)` NHWC-flattened |
| `LayerNormalization` | `activations.h` | `(batch, features)` per-row normalize |

Conv2D uses im2col + matrix multiply (correctness-first, optimizable later).

## Weight I/O

- `Model::save_weights_binary(prefix)` / `Model::load_weights(prefix)`
- Binary format: `[rows, cols, data]` per tensor file
- JSON load via `load_dense_json` for layers saved with `save_weights`
- `Dense::set_parameters(W, B)` for programmatic load

## Benchmarks

```bash
cd ML/models/cpp-modules
cmake -B build && cmake --build build --target cyberhex_bench
./build/cyberhex_bench 1024 10   # JSON: mean_ms, gflops

python3 ML/scripts/benchmark.py 1024
```

## Numerical tests (`[numerical]` tag)

- Softmax stability (large logits)
- Finite-difference gradients: MSE, MAE, Huber, BCE, CCE
- Model `check_gradients` on small MLP
- Weight load round-trip (binary)

## Build targets

| Target | Purpose |
|--------|---------|
| `libcyberhex` | Shared runtime |
| `cyberhex_ml` | Training CLI |
| `cyberhex_bench` | Matmul GFLOPS |
| `unit_tests` | Catch2 suite |
| `app` | Examples |

# CyberHex v5 — Phase 3: Graph, Autodiff, Fusion, Precision

## Architecture

```
Input → [FusedLinearReLU | MatMul+Bias+ReLU]* → MatMul+Bias → Loss
              ↑ ComputationGraph (reverse-mode AD)
              ↑ Device: CPU (CUDA stub)
              ↑ Optional FP16 parameter cache
```

Imperative `Model` (Phase 0–2) remains unchanged. `ComputationGraph` is the research/runtime path.

## Components

| Module | Purpose |
|--------|---------|
| `device.h` | `Device::cpu()` / `cuda()` stub; `cuda_available()` |
| `precision.h` | `Float16`, `matrix_to_fp16`, mixed-precision param cache |
| `graph.h` | Static graph, `forward` / `backward`, `GraphTrainer` |
| `fused_ops.h` | `fused_linear_relu_forward/backward` |

## Graph API

```cpp
ComputationGraph g;
NodeId x = g.add_input();
NodeId W = g.add_parameter(in, out, InitType::HE);
NodeId b = g.add_parameter(1, out);
g.mutable_node(b).weight.fill(0.0);
NodeId h = g.add_fused_linear_relu(x, W, b);
g.bind_input(x, X);
Matrix<double> Y = g.forward(h);
g.backward(h, loss_grad);
```

## GraphTrainer

```cpp
GraphTrainer trainer;
trainer.set_mixed_precision(true);  // FP16 weights, FP64 compute
NodeId out = trainer.build_mlp({2, 16, 16, 1}, {"relu", "relu", "linear"});
AdamOptimizer opt(0.01);
trainer.train_step(X, y, std::make_unique<MSELoss>(), opt, out);
```

## Operator fusion

`FusedLinearReLU` fuses `MatMul + BiasAdd + ReLU` into one forward/backward pass (fewer temporaries, better cache locality). Hidden layers use fusion when activation is ReLU; output layer stays unfused.

## Mixed precision

- Parameters optionally stored as IEEE binary16 in `MixedPrecisionState`
- Forward promotes to `double` for numerics
- After `optimizer.update`, weights re-quantized to FP16

## CUDA (Phase 4)

`Device::cuda()` is declared; without `CYBERHEX_CUDA` all ops execute on CPU. No silent fallback when CUDA is explicitly requested and unavailable.

## Tests

Tags: `[graph]`, `[fusion]`, `[autodiff]`, `[precision]`, `[device]`

```bash
./build/unit_tests "[graph]"
```

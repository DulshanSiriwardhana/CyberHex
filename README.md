# CyberHex — C++ Machine Learning Engine + Real-Time Visualization

> **Project Status: Actively Under Development**
>
> This repository represents the **current state of an ongoing project.**
> Features, structure, and performance are continuously evolving.

---

CyberHex is a **high-performance C++ machine learning framework** built from scratch, featuring:

- A custom matrix engine (no STL vectors)
- Dynamic multi-layer neural networks
- Forward and backward propagation
- Real-time training visualization via WebSockets
- A React-based live dashboard

This project explores **low-level ML engineering and system design** — similar in spirit to a lightweight, C++-native **TensorFlow + TensorBoard**.

---

## Current Features

### Core ML Engine

- Custom `Matrix` implementation using raw `double**` pointers
- Dense (fully connected) layers
- Activation layers:
  - ReLU
  - Sigmoid
  - Softmax *(in progress)*
- Forward propagation
- Backpropagation with manually derived gradients

---

### Neural Network System

- Dynamic layer stacking
- Multi-layer deep networks
- Modular `Layer` abstraction

---

### Training Pipeline

- MSE loss function
- Epoch-based training loop
- Best-model tracking
- Optional loss logging to CSV

---

### Real-Time Visualization *(Experimental)*

- Native C++ WebSocket server
- Live training data streaming
- React + TypeScript frontend

---

## Architecture

```
CyberHex/
│
├── include/                          # Core interfaces & headers
│   ├── matrix.h                      # Custom Matrix (double**)
│   ├── layer.h                       # Base Layer (virtual forward/backward)
│   ├── dense.h                       # Dense (fully connected) layer
│   ├── activations.h                 # ReLU, Sigmoid, Softmax (partial)
│   └── model.h                       # Model (layer container + training loop)
│
├── src/                              # Implementations
│   ├── matrix.cpp                    # Memory management + ops (dot, transpose, apply)
│   ├── dense.cpp                     # Forward pass + backpropagation (weights, bias)
│   ├── activations.cpp               # Activation forward/backward
│   └── model.cpp                     # Training loop + loss + model saving
│
├── core_math/                        # Supporting math utilities
│   ├── basic_maths.cpp
│   ├── higher_maths.cpp
│   ├── stat.cpp
│   └── machine_learning_algorithms.cpp
│
├── data_structures/                  # Custom data structures
│   └── data_structures.cpp
│
├── main.cpp                          # Entry point (training experiments)
│
├── server.cpp                        # C++ WebSocket server (real-time streaming, optional)
│
├── models/
│   └── best_model/                   # Saved weights, biases, and loss history
│       ├── layer_0_weights.txt
│       ├── layer_0_bias.txt
│       ├── ...
│       └── epoch_losses.csv
│
└── frontend/                         # React dashboard
    ├── components/
    │   └── LineChart.tsx             # Loss visualization component
    ├── App.tsx                       # Loads CSV / WebSocket data
    └── types/                        # TypeScript type definitions
```

---

## Author & Ownership

This project is fully designed, developed, and maintained by:

**Dulshan Siriwardhana**

- GitHub: [github.com/DulshanSiriwardhana](https://github.com/DulshanSiriwardhana)
- Portfolio: [dulshansiriwardhana.live](http://dulshansiriwardhana.live)
- LinkedIn: [linkedin.com/in/dulshansiriwardhana](https://www.linkedin.com/in/dulshansiriwardhana)

> I am the sole owner and author of CyberHex. All core systems — including the matrix engine,
> neural network architecture, training pipeline, and real-time visualization — are built
> entirely from scratch as part of this project.

---

## License

This project is licensed under the **Apache License 2.0**.
See the [LICENSE](./LICENSE) file for details.

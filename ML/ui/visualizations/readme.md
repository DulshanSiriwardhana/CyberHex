# CyberHex — C++ Machine Learning Engine + Real-Time Visualization

> **Project Status: Actively Under Development**
>
> This repository represents the **current state of an ongoing project**.  
> Features, structure, and performance are continuously evolving.

---

CyberHex is a **high-performance C++ machine learning framework** built from scratch, featuring:

- Custom matrix engine (no STL vectors)
- Dynamic multi-layer neural networks
- Forward & backward propagation
- Real-time training visualization via WebSockets
- React-based live dashboard

This project explores **low-level ML engineering + system design**, similar to a lightweight **TensorFlow + TensorBoard (C++ native)**.

---

# Current Features

## 🔹 Core ML Engine
- Custom `Matrix` implementation (`double**`)
- Dense (Fully Connected) layers
- Activation layers:
  - ReLU
  - Sigmoid
  - Softmax (in progress)
- Forward propagation
- Backpropagation (manual gradients)

---

## 🔹 Neural Network System
- Dynamic layer stacking
- Multi-layer deep networks
- Modular `Layer` abstraction

---

## 🔹 Training Pipeline
- MSE loss (currently used)
- Epoch-based training
- Best model tracking
- Optional loss logging (CSV)

---

## 🔹 Real-Time Visualization (Experimental)
- Native C++ WebSocket server
- Live training data streaming
- React + TypeScript frontend

---

# Current Architecture

CyberHex/
│
├── include/                     # Core interfaces & headers
│   ├── matrix.h                # Custom Matrix (double**)
│   ├── layer.h                 # Base Layer (virtual forward/backward)
│   ├── dense.h                 # Dense (Fully Connected) layer
│   ├── activations.h           # ReLU, Sigmoid, Softmax (partial)
│   ├── model.h                 # Model (layer container + training)
│
├── src/                         # Implementations
│   ├── matrix.cpp              # Memory management + ops (dot, transpose, apply)
│   ├── dense.cpp               # Forward + Backprop (weights, bias)
│   ├── activations.cpp         # Activation forward/backward
│   ├── model.cpp               # Training loop + loss + saving
│
├── core math/                   # Supporting utilities
│   ├── basic_maths.cpp
│   ├── higher_maths.cpp
│   ├── stat.cpp
│   ├── machine_learning_algorithms.cpp
│
├── data_structures/             # Custom DS (used in other experiments)
│   ├── data_structures.cpp
│
├── main.cpp                     # Entry point (training experiments)
│
├── server.cpp (optional)     # C++ WebSocket server (real-time streaming)
│
├── models/
│   └── best_model/              # Saved weights + biases + losses
│       ├── layer_0_weights.txt
│       ├── layer_0_bias.txt
│       ├── ...
│       └── epoch_losses.csv
│
└── frontend/ (React)
    ├── components/
    │   └── LineChart.tsx        # Visualization component
    ├── App.tsx                 # Loads CSV / WebSocket data
    └── types/                  # Chart typing

# 👨Author & Ownership

This project is fully designed, developed, and maintained by:

**Dulshan Siriwardhana**

- GitHub: https://github.com/DulshanSiriwardhana  
- Portfolio: dulshansiriwardhana.live  
- LinkedIn: https://www.linkedin.com/in/dulshansiriwardhana

> I am the sole owner and author of CyberHex.  
> All core systems — including the matrix engine, neural network architecture, training pipeline, and real-time visualization — are built from scratch as part of this project.
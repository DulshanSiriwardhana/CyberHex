#!/usr/bin/env python3
"""
CyberHex Benchmark: Compare C++ vs Python ML performance.
Run: python3 benchmark.py
"""

import numpy as np
import time
import subprocess
import os

def benchmark_numpy_dot(size=1024):
    """Benchmark NumPy matrix multiplication vs CyberHex C++"""
    print(f"\n{'='*60}")
    print(f"Matrix Dot Product Benchmark ({size}x{size})")
    print(f"{'='*60}")

    # NumPy benchmark
    a = np.random.randn(size, size).astype(np.float64)
    b = np.random.randn(size, size).astype(np.float64)

    # Warmup
    for _ in range(3):
        np.dot(a, b)

    times = []
    for _ in range(10):
        start = time.perf_counter()
        np.dot(a, b)
        times.append(time.perf_counter() - start)

    np_mean = np.mean(times)
    np_std = np.std(times)
    print(f"NumPy:    {np_mean*1000:.1f}ms ± {np_std*1000:.1f}ms")

    # TODO: Run CyberHex C++ benchmark via the unit tests
    print(f"CyberHex: Run './build/unit_tests [benchmark]' to compare")

    gflops = (2 * size**3) / (np_mean * 1e9)
    print(f"NumPy GFLOPS: {gflops:.1f}")

def benchmark_xor_training():
    """Benchmark XOR training with Python vs CyberHex"""
    print(f"\n{'='*60}")
    print(f"XOR Training Benchmark")
    print(f"{'='*60}")

    import torch
    import torch.nn as nn
    import torch.optim as optim

    # PyTorch model
    class XORNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(2, 16),
                nn.ReLU(),
                nn.Linear(16, 16),
                nn.ReLU(),
                nn.Linear(16, 1),
                nn.Sigmoid()
            )

        def forward(self, x):
            return self.net(x)

    X = torch.tensor([[0.,0],[0,1],[1,0],[1,1]])
    y = torch.tensor([[0.],[1.],[1.],[0.]])

    model = XORNet()
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    # Warmup
    for _ in range(10):
        optimizer.zero_grad()
        out = model(X)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()

    # Benchmark
    times = []
    for _ in range(5):
        start = time.perf_counter()
        for _ in range(100):
            optimizer.zero_grad()
            out = model(X)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
        times.append(time.perf_counter() - start)

    mean_time = np.mean(times)
    print(f"PyTorch (100 epochs): {mean_time*1000:.1f}ms")
    print(f"CyberHex: Run './build/app 1' to compare")

def benchmark_regression():
    """Benchmark regression training"""
    print(f"\n{'='*60}")
    print(f"Regression Benchmark (500 samples, 2 features)")
    print(f"{'='*60}")

    import torch
    import torch.nn as nn
    import torch.optim as optim

    np.random.seed(42)
    X_np = np.random.uniform(-1, 1, (500, 2))
    y_np = np.sin(3*X_np[:,0]) * np.cos(5*X_np[:,1]) + 0.3*np.sin(10*(X_np[:,0]+X_np[:,1]))
    y_np = y_np.reshape(-1, 1)

    X = torch.tensor(X_np, dtype=torch.float32)
    y = torch.tensor(y_np, dtype=torch.float32)

    class RegNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(2, 64),
                nn.Tanh(),
                nn.Linear(64, 64),
                nn.Tanh(),
                nn.Linear(64, 1)
            )

        def forward(self, x):
            return self.net(x)

    model = RegNet()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    times = []
    for _ in range(3):
        start = time.perf_counter()
        for _ in range(100):
            optimizer.zero_grad()
            out = model(X)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
        times.append(time.perf_counter() - start)

    mean_time = np.mean(times)
    print(f"PyTorch (100 epochs): {mean_time*1000:.1f}ms")
    print(f"CyberHex: Run './build/app 2' to compare")

if __name__ == "__main__":
    print("="*60)
    print("CyberHex ML Framework - Python vs C++ Benchmark")
    print("="*60)
    print("\nNote: Install PyTorch for Python benchmarks:")
    print("  pip install torch numpy")

    try:
        import torch
        benchmark_xor_training()
        benchmark_regression()
    except ImportError:
        print("\nPyTorch not installed. Skipping PyTorch benchmarks.")
        print("Install with: pip install torch")

    benchmark_numpy_dot(1024)

    print("\n" + "="*60)
    print("To run CyberHex C++ benchmarks:")
    print("  cd ML/models/cpp-modules && mkdir -p build && cd build")
    print("  cmake .. && make -j")
    print("  ./app         # Run all examples")
    print("  ./unit_tests  # Run unit tests")
    print("="*60)
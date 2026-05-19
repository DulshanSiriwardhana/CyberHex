#!/usr/bin/env python3
"""
CyberHex Benchmark: Compare C++ engine vs NumPy/PyTorch.
Run: python3 ML/scripts/benchmark.py
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CPP_BUILD = ROOT / "models" / "cpp-modules" / "build"
BENCH_BIN = CPP_BUILD / "cyberhex_bench"


def run_cpp_matmul_benchmark(n=1024, repeats=10):
    if not BENCH_BIN.exists():
        print(f"CyberHex bench binary not found at {BENCH_BIN}")
        print("Build with: cd ML/models/cpp-modules && cmake -B build && cmake --build build --target cyberhex_bench")
        return None

    result = subprocess.run(
        [str(BENCH_BIN), str(n), str(repeats)],
        capture_output=True,
        text=True,
        check=True,
    )
    line = result.stdout.strip().splitlines()[-1]
    return json.loads(line)


def benchmark_numpy_dot(size=1024, repeats=10):
    print(f"\n{'=' * 60}")
    print(f"Matrix Dot Product Benchmark ({size}x{size})")
    print(f"{'=' * 60}")

    a = np.random.randn(size, size).astype(np.float64)
    b = np.random.randn(size, size).astype(np.float64)

    for _ in range(3):
        np.dot(a, b)

    times = []
    for _ in range(repeats):
        start = time.perf_counter()
        np.dot(a, b)
        times.append(time.perf_counter() - start)

    np_mean = float(np.mean(times))
    np_std = float(np.std(times))
    np_gflops = (2 * size**3) / (np_mean * 1e9)

    print(f"NumPy:    {np_mean * 1000:.2f}ms ± {np_std * 1000:.2f}ms  ({np_gflops:.2f} GFLOPS)")

    cpp = run_cpp_matmul_benchmark(size, repeats)
    if cpp:
        print(
            f"CyberHex: {cpp['mean_ms']:.2f}ms  ({cpp['gflops']:.2f} GFLOPS)  "
            f"[{cpp['repeats']} repeats]"
        )
        if np_gflops > 0:
            print(f"Speedup (CyberHex/NumPy GFLOPS): {cpp['gflops'] / np_gflops:.2f}x")

    return np_mean


def benchmark_xor_training():
    print(f"\n{'=' * 60}")
    print("XOR Training Benchmark (PyTorch reference)")
    print(f"{'=' * 60}")

    try:
        import torch
        import torch.nn as nn
        import torch.optim as optim
    except ImportError:
        print("PyTorch not installed — skip")
        return

    class XORNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(2, 16),
                nn.ReLU(),
                nn.Linear(16, 16),
                nn.ReLU(),
                nn.Linear(16, 1),
                nn.Sigmoid(),
            )

        def forward(self, x):
            return self.net(x)

    X = torch.tensor([[0.0, 0], [0, 1], [1, 0], [1, 1]])
    y = torch.tensor([[0.0], [1.0], [1.0], [0.0]])

    model = XORNet()
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    for _ in range(10):
        optimizer.zero_grad()
        loss = criterion(model(X), y)
        loss.backward()
        optimizer.step()

    times = []
    for _ in range(5):
        start = time.perf_counter()
        for _ in range(100):
            optimizer.zero_grad()
            loss = criterion(model(X), y)
            loss.backward()
            optimizer.step()
        times.append(time.perf_counter() - start)

    print(f"PyTorch (100 epochs): {np.mean(times) * 1000:.1f}ms")
    print("CyberHex C++: run ./build/app for XOR example comparison")


if __name__ == "__main__":
    print("=" * 60)
    print("CyberHex ML Framework — Phase 2 Benchmarks")
    print("=" * 60)

    size = int(sys.argv[1]) if len(sys.argv) > 1 else 1024
    benchmark_numpy_dot(size)
    benchmark_xor_training()

    print("\n" + "=" * 60)
    print("Build C++ benchmarks:")
    print("  cd ML/models/cpp-modules && cmake -B build && cmake --build build")
    print("  ./build/cyberhex_bench 1024 10")
    print("  ./build/unit_tests '[numerical]'")
    print("=" * 60)

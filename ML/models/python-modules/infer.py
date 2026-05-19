#!/usr/bin/env python3
"""CyberHex inference CLI — loads .npz weights from train.py and predicts."""
import json
import os
import sys

import numpy as np


def load_model(model_path):
    data = np.load(model_path)
    weights = []
    biases = []
    i = 0
    while f"weight_{i}" in data:
        weights.append(data[f"weight_{i}"])
        biases.append(data[f"bias_{i}"])
        i += 1
    return weights, biases


def forward(weights, biases, X, task="regression"):
    act = X
    for i, (w, b) in enumerate(zip(weights, biases)):
        z = np.dot(act, w) + b
        if i == len(weights) - 1:
            if task == "classification":
                exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
                act = exp_z / np.sum(exp_z, axis=1, keepdims=True)
            else:
                act = z
        else:
            act = np.maximum(0, z)
    return act


def main():
    raw = os.environ.get("CYBERHEX_INFER_CONFIG", "{}")
    cfg = json.loads(raw)
    model_path = cfg.get("model_path")
    features = cfg.get("features", [])

    if not model_path or not os.path.exists(model_path):
        print(json.dumps({"error": f"Model not found: {model_path}"}), flush=True)
        sys.exit(1)

    X = np.array(features, dtype=np.float64)
    if X.ndim == 1:
        X = X.reshape(1, -1)

    weights, biases = load_model(model_path)
    task = cfg.get("task", "regression")
    pred = forward(weights, biases, X, task)

    print(
        json.dumps(
            {
                "success": True,
                "predictions": pred.tolist(),
                "shape": list(pred.shape),
                "backend": "python-numpy",
            }
        ),
        flush=True,
    )


if __name__ == "__main__":
    main()

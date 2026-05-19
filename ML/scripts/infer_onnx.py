#!/usr/bin/env python3
"""ONNX Runtime inference for CyberHex exported models (cyberhex.infer.v1)."""
import json
import os
import sys

import numpy as np


def resolve_onnx_path(model_path):
    if model_path.endswith(".onnx") and os.path.isfile(model_path):
        return model_path
    prefix = model_path
    if prefix.endswith("_weights"):
        prefix = prefix[: -len("_weights")]
    candidate = os.path.join(prefix, "model.onnx")
    if os.path.isfile(candidate):
        return candidate
    return None


def run_inference(onnx_path, features, task="regression"):
    try:
        import onnxruntime as ort
    except ImportError:
        return {"error": "Install onnxruntime: pip install onnxruntime"}

    sess = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
    input_name = sess.get_inputs()[0].name
    x = np.array(features, dtype=np.float64)
    if x.ndim == 1:
        x = x.reshape(1, -1)

    outputs = sess.run(None, {input_name: x})
    pred = outputs[0]
    if task == "classification" and pred.shape[-1] > 1:
        pred = np.argmax(pred, axis=-1).reshape(-1, 1)

    return {
        "success": True,
        "backend": "onnxruntime",
        "shape": list(pred.shape),
        "predictions": pred.tolist(),
    }


def main():
    raw = os.environ.get("CYBERHEX_INFER_CONFIG", "{}")
    cfg = json.loads(raw)
    model_path = cfg.get("model_path") or cfg.get("modelPath", "")
    features = cfg.get("features", [])
    task = cfg.get("task", "regression")

    onnx_path = cfg.get("onnx_path") or cfg.get("onnxPath") or resolve_onnx_path(model_path)
    if not onnx_path:
        print(json.dumps({"error": f"No model.onnx found for {model_path}"}))
        sys.exit(1)

    result = run_inference(onnx_path, features, task)
    print(json.dumps(result), flush=True)
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()

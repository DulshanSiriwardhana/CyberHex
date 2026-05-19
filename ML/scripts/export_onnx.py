#!/usr/bin/env python3
"""Build ONNX from CyberHex MLP manifest (cyberhex.onnx.v1)."""
import json
import os
import sys

import numpy as np


def load_layer_json(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    w = np.array(data["weights"], dtype=np.float64)
    b = np.array(data["bias"], dtype=np.float64).reshape(1, -1)
    return w, b


def build_onnx(manifest_path, onnx_path):
    try:
        import onnx
        from onnx import TensorProto, helper
    except ImportError:
        return {"error": "Install onnx: pip install onnx"}

    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)

    layers = manifest.get("layers", [])
    if not layers:
        return {"error": "manifest has no layers"}

    graph_nodes = []
    graph_inputs = []
    graph_outputs = []
    initializers = []

    w0, b0 = load_layer_json(layers[0])
    input_name = "input"
    graph_inputs.append(
        helper.make_tensor_value_info(
            input_name, TensorProto.DOUBLE, [None, w0.shape[0]]
        )
    )

    prev = input_name
    for i, layer_path in enumerate(layers):
        w, b = load_layer_json(layer_path)
        w_name = f"W{i}"
        b_name = f"B{i}"
        initializers.append(
            helper.make_tensor(w_name, TensorProto.DOUBLE, list(w.shape), w.flatten().tolist())
        )
        initializers.append(
            helper.make_tensor(b_name, TensorProto.DOUBLE, list(b.shape), b.flatten().tolist())
        )

        gemm_out = f"gemm_{i}"
        graph_nodes.append(
            helper.make_node(
                "Gemm",
                inputs=[prev, w_name, b_name],
                outputs=[gemm_out],
                name=gemm_out,
                alpha=1.0,
                beta=1.0,
                transB=0,
            )
        )

        if i + 1 < len(layers):
            relu_out = f"relu_{i}"
            graph_nodes.append(
                helper.make_node("Relu", inputs=[gemm_out], outputs=[relu_out], name=relu_out)
            )
            prev = relu_out
        else:
            prev = gemm_out

    graph_outputs.append(
        helper.make_tensor_value_info(prev, TensorProto.DOUBLE, [None, w.shape[1]])
    )

    graph = helper.make_graph(
        graph_nodes, "CyberHexMLP", graph_inputs, graph_outputs, initializers
    )
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 13)])
    onnx.save(model, onnx_path)
    return {"success": True, "onnx_path": onnx_path, "backend": "onnx-python"}


def main():
    raw = os.environ.get("CYBERHEX_EXPORT_CONFIG", "{}")
    cfg = json.loads(raw)
    manifest = cfg.get("manifest_path") or cfg.get("manifestPath")
    onnx_path = cfg.get("onnx_path") or cfg.get("onnxPath")

    if not manifest:
        prefix = cfg.get("weights_prefix") or cfg.get("weightsPrefix", "")
        manifest = os.path.join(prefix, "export_manifest.json")

    if not onnx_path and manifest:
        onnx_path = os.path.join(os.path.dirname(manifest), "model.onnx")

    if not manifest or not os.path.exists(manifest):
        print(json.dumps({"error": f"manifest not found: {manifest}"}))
        sys.exit(1)

    result = build_onnx(manifest, onnx_path)
    print(json.dumps(result), flush=True)
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()

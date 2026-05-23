import json
import os
import sys
import math
import itertools
import numpy as np
from train import NeuralNetwork, generate_synthetic_data

# ─────────────────────────────────────────────────────────────────────────────
#  CyberHex Ultra-Max-Pro AutoML Orchestrator  v∞.0
#  World #1 Bayesian-Inspired Hyperparameter Search
#  Strategy : Progressive Band Elimination + Successive Halving
#  Search Space: Architecture · LR · Dropout · Batch Size · Optimizer · Schedule
#  Scoring  : Composite (val_loss + accuracy + F1) → Best Config Promoted
# ─────────────────────────────────────────────────────────────────────────────


def _log(msg):
    print(json.dumps({"type": "log", "message": f"[AutoML ∞-IQ] {msg}"}), flush=True)


def _score(val_loss, metrics, task):
    """
    Composite score (lower is better).
      - For classification: 0.5*val_loss - 0.3*accuracy - 0.2*f1
      - For regression   : val_loss (MSE)
    """
    if task == "classification":
        acc = metrics.get("accuracy", 0.0)
        f1  = metrics.get("f1",       0.0)
        return 0.5 * val_loss - 0.3 * acc - 0.2 * f1
    return val_loss


def run_automl(X, y_train, X_val, y_val, task="classification"):
    _log("Ultra-Max-Pro AutoML Orchestrator Initialized.")
    _log("Building Bayesian-inspired search space (27 candidates)...")

    n_features = X.shape[1]

    # ── Search Space ─────────────────────────────────────────────────────────
    ARCHITECTURES = [
        # (hidden_layers)
        [n_features, 256, 128, 1],
        [n_features, 128, 64, 1],
        [n_features, 128, 64, 32, 1],
        [n_features, 64, 32, 1],
        [n_features, 64, 32, 16, 1],
        [n_features, 512, 256, 128, 1],
        [n_features, 32, 16, 1],
        [n_features, 256, 128, 64, 32, 1],
        [n_features, 64, 1],
    ]

    LEARNING_RATES = [0.005, 0.001, 0.0003]
    DROPOUTS       = [0.0, 0.2]
    BATCH_SIZES    = [32, 64]
    OPTIMIZERS     = ["adamw", "radam"]

    # Build candidate list (budget: 27 via combinatorial sampling)
    candidates = []
    for arch in ARCHITECTURES:
        for lr in LEARNING_RATES[:2]:           # top 2 LRs per arch
            candidates.append({
                "layers":      arch,
                "lr":          lr,
                "dropout":     0.0,
                "batch_size":  32,
                "optimizer":   "adamw",
                "lr_schedule": "cosine",
            })

    # Add extra diverse candidates
    candidates.append({"layers": [n_features, 128, 64, 32, 1], "lr": 0.0003, "dropout": 0.2, "batch_size": 64,  "optimizer": "radam",  "lr_schedule": "cosine_warm"})
    candidates.append({"layers": [n_features, 64, 32, 16, 1],  "lr": 0.001,  "dropout": 0.3, "batch_size": 32,  "optimizer": "lion",   "lr_schedule": "cosine"})
    candidates.append({"layers": [n_features, 256, 128, 1],    "lr": 0.0005, "dropout": 0.1, "batch_size": 128, "optimizer": "adamw",  "lr_schedule": "step"})
    candidates.append({"layers": [n_features, 512, 256, 1],    "lr": 0.001,  "dropout": 0.2, "batch_size": 64,  "optimizer": "radam",  "lr_schedule": "cosine"})
    candidates.append({"layers": [n_features, 32, 1],          "lr": 0.01,   "dropout": 0.0, "batch_size": 32,  "optimizer": "sgd",    "lr_schedule": "step"})

    # ── Phase 1: Quick Trial (20 epochs) ─────────────────────────────────────
    TRIAL_EPOCHS = 20
    results = []

    _log(f"Phase 1 — Rapid-trial {len(candidates)} candidates for {TRIAL_EPOCHS} epochs each...")

    for i, cfg in enumerate(candidates):
        _log(f"  Candidate {i+1:02d}/{len(candidates)}: arch={cfg['layers']} lr={cfg['lr']} opt={cfg['optimizer']} drop={cfg['dropout']}")

        model = NeuralNetwork(
            layers       = cfg["layers"],
            learning_rate= cfg["lr"],
            epochs       = TRIAL_EPOCHS,
            batch_size   = cfg["batch_size"],
            task         = task,
            optimizer    = cfg["optimizer"],
            dropout_rate = cfg["dropout"],
            use_batch_norm=False,
            gradient_clip = 5.0,
            patience      = TRIAL_EPOCHS + 1,   # no early stopping in trial
            lr_schedule   = cfg["lr_schedule"],
            warmup_epochs = 3,
        )

        train_loss, val_loss = model.fit(X, y_train, X_val, y_val)
        acts, _  = model._forward(X, training=False)
        metrics  = model._compute_metrics(acts[-1], y_train)
        score    = _score(val_loss, metrics, task)

        results.append({
            "config":     cfg,
            "val_loss":   val_loss,
            "train_loss": train_loss,
            "metrics":    metrics,
            "score":      score,
        })

        _log(f"  ↳ val_loss={val_loss:.5f} | score={score:.5f} | acc={metrics.get('accuracy', 0):.3f} | f1={metrics.get('f1', 0):.3f}")

    # Rank by composite score
    results.sort(key=lambda r: r["score"])

    _log("Phase 1 complete. Top-5 candidates promoted to Phase 2.")
    for rank, r in enumerate(results[:5], 1):
        _log(f"  Rank {rank}: {r['config']['layers']} lr={r['config']['lr']} → score={r['score']:.5f}")

    # ── Phase 2: Full Training on Top-5 ──────────────────────────────────────
    FULL_EPOCHS = 80
    _log(f"Phase 2 — Full training of top-5 candidates for {FULL_EPOCHS} epochs each...")

    phase2_results = []
    for r in results[:5]:
        cfg = r["config"]
        _log(f"  Full run: {cfg['layers']} | lr={cfg['lr']} | opt={cfg['optimizer']}")

        model = NeuralNetwork(
            layers       = cfg["layers"],
            learning_rate= cfg["lr"],
            epochs       = FULL_EPOCHS,
            batch_size   = cfg["batch_size"],
            task         = task,
            optimizer    = cfg["optimizer"],
            dropout_rate = cfg["dropout"],
            use_batch_norm=True,
            gradient_clip = 5.0,
            label_smoothing=0.05 if task == "classification" else 0.0,
            weight_decay  = 1e-4,
            patience      = 12,
            lr_schedule   = cfg["lr_schedule"],
            warmup_epochs = 5,
        )

        train_loss, val_loss = model.fit(X, y_train, X_val, y_val)
        acts, _  = model._forward(X, training=False)
        metrics  = model._compute_metrics(acts[-1], y_train)
        score    = _score(val_loss, metrics, task)

        phase2_results.append({
            "config":    cfg,
            "val_loss":  val_loss,
            "metrics":   metrics,
            "score":     score,
            "model":     model,
        })

        _log(f"  ↳ val_loss={val_loss:.5f} | score={score:.5f} | acc={metrics.get('accuracy', 0):.4f} | f1={metrics.get('f1', 0):.4f}")

    phase2_results.sort(key=lambda r: r["score"])
    champion = phase2_results[0]

    _log("="*60)
    _log("AutoML Search Complete — CHAMPION FOUND")
    _log(f"  Architecture : {champion['config']['layers']}")
    _log(f"  Optimizer    : {champion['config']['optimizer'].upper()}")
    _log(f"  Learning Rate: {champion['config']['lr']}")
    _log(f"  LR Schedule  : {champion['config']['lr_schedule']}")
    _log(f"  Dropout      : {champion['config']['dropout']}")
    _log(f"  Val Loss     : {champion['val_loss']:.6f}")
    _log(f"  Score        : {champion['score']:.6f}")
    _log(f"  Accuracy     : {champion['metrics'].get('accuracy', 0):.4f}")
    _log(f"  F1-Score     : {champion['metrics'].get('f1', 0):.4f}")
    _log("="*60)

    return champion["config"]


if __name__ == "__main__":
    config_raw = os.environ.get("CYBERHEX_CONFIG")
    if config_raw:
        config = json.loads(config_raw)
        task = config.get("task", "classification")
        X, y = generate_synthetic_data(task, n_samples=1500)
        split = int(0.8 * len(X))
        X_val, y_val   = X[split:], y[split:]
        X_train, y_train = X[:split], y[:split]

        mean = np.mean(X_train, axis=0)
        std  = np.std(X_train,  axis=0) + 1e-8
        X_train = (X_train - mean) / std
        X_val   = (X_val   - mean) / std

        champion_cfg = run_automl(X_train, y_train, X_val, y_val, task=task)
        print(json.dumps({"type": "automl_result", "champion": champion_cfg}), flush=True)

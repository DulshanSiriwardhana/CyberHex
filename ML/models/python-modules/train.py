import json
import os
import sys
import math
import random
import numpy as np

class LinearRegression:
    def __init__(self, learning_rate=0.001, epochs=100, batch_size=32):
        self.lr = learning_rate
        self.epochs = epochs
        self.batch_size = batch_size
        self.weights = None
        self.bias = 0.0

    def fit(self, X, y, X_val=None, y_val=None):
        n_samples, n_features = X.shape
        self.weights = np.random.randn(n_features) * 0.01
        self.bias = 0.0

        for epoch in range(self.epochs):
            indices = np.random.permutation(n_samples)
            X_shuffled = X[indices]
            y_shuffled = y[indices]

            for start in range(0, n_samples, self.batch_size):
                end = min(start + self.batch_size, n_samples)
                X_batch = X_shuffled[start:end]
                y_batch = y_shuffled[start:end]

                y_pred = np.dot(X_batch, self.weights) + self.bias
                dw = (2 / len(X_batch)) * np.dot(X_batch.T, (y_pred - y_batch))
                db = (2 / len(X_batch)) * np.sum(y_pred - y_batch)
                self.weights -= self.lr * dw
                self.bias -= self.lr * db

            train_loss = np.mean((np.dot(X, self.weights) + self.bias - y) ** 2)
            val_loss = None
            if X_val is not None and y_val is not None:
                val_loss = np.mean((np.dot(X_val, self.weights) + self.bias - y_val) ** 2)

            payload = {"type": "epoch", "epoch": epoch + 1, "train_loss": float(train_loss)}
            if val_loss is not None:
                payload["val_loss"] = float(val_loss)
            print(json.dumps(payload), flush=True)

        return train_loss, (val_loss if val_loss is not None else train_loss)

    def predict(self, X):
        return np.dot(X, self.weights) + self.bias


class NeuralNetwork:
    def __init__(self, layers, learning_rate=0.001, epochs=100, batch_size=32, task='regression', optimizer='adam'):
        self.layers = layers
        self.lr = learning_rate
        self.epochs = epochs
        self.batch_size = batch_size
        self.task = task
        self.optimizer = optimizer
        self.weights = []
        self.biases = []
        self._build()

    def _build(self):
        random.seed(42)
        np.random.seed(42)
        for i in range(len(self.layers) - 1):
            fan_in = self.layers[i]
            fan_out = self.layers[i + 1]
            limit = math.sqrt(6.0 / (fan_in + fan_out))
            self.weights.append(np.random.uniform(-limit, limit, (fan_in, fan_out)))
            self.biases.append(np.zeros(fan_out))

    def _forward(self, X):
        activations = [X]
        zs = []
        for i in range(len(self.weights)):
            z = np.dot(activations[-1], self.weights[i]) + self.biases[i]
            zs.append(z)
            if i == len(self.weights) - 1:
                if self.task == 'classification':
                    exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
                    a = exp_z / np.sum(exp_z, axis=1, keepdims=True)
                else:
                    a = z
            else:
                a = np.maximum(0, z)
            activations.append(a)
        return activations, zs

    def _compute_loss(self, y_pred, y_true):
        if self.task == 'classification':
            y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)
            return -np.mean(np.sum(y_true * np.log(y_pred), axis=1))
        return np.mean((y_pred - y_true.reshape(-1, 1)) ** 2)

    def _backward(self, activations, zs, X, y):
        grads_w = [np.zeros_like(w) for w in self.weights]
        grads_b = [np.zeros_like(b) for b in self.biases]
        m = X.shape[0]

        delta = activations[-1] - y.reshape(-1, 1)
        if self.task == 'classification':
            delta = activations[-1] - y

        for i in reversed(range(len(self.weights))):
            grads_w[i] = np.dot(activations[i].T, delta) / m
            grads_b[i] = np.sum(delta, axis=0) / m
            if i > 0:
                delta = np.dot(delta, self.weights[i].T) * (activations[i] > 0)

        return grads_w, grads_b

    def fit(self, X, y, X_val=None, y_val=None):
        if self.task == 'classification':
            num_classes = self.layers[-1]
            y_onehot = np.zeros((y.shape[0], num_classes))
            y_onehot[np.arange(y.shape[0]), y.astype(int)] = 1
            y = y_onehot

        n_samples = X.shape[0]
        for epoch in range(self.epochs):
            indices = np.random.permutation(n_samples)
            X_shuffled = X[indices]
            y_shuffled = y[indices]

            for start in range(0, n_samples, self.batch_size):
                end = min(start + self.batch_size, n_samples)
                X_batch = X_shuffled[start:end]
                y_batch = y_shuffled[start:end]

                activations, zs = self._forward(X_batch)
                grads_w, grads_b = self._backward(activations, zs, X_batch, y_batch)

                for j in range(len(self.weights)):
                    self.weights[j] -= self.lr * grads_w[j]
                    self.biases[j] -= self.lr * grads_b[j]

            act_all, _ = self._forward(X)
            train_loss = float(self._compute_loss(act_all[-1], y))

            val_loss = None
            if X_val is not None and y_val is not None:
                if self.task == 'classification':
                    yv_onehot = np.zeros((y_val.shape[0], num_classes))
                    yv_onehot[np.arange(y_val.shape[0]), y_val.astype(int)] = 1
                    yv = yv_onehot
                else:
                    yv = y_val
                act_val, _ = self._forward(X_val)
                val_loss = float(self._compute_loss(act_val[-1], yv))

            payload = {"type": "epoch", "epoch": epoch + 1, "train_loss": train_loss}
            if val_loss is not None:
                payload["val_loss"] = val_loss
            print(json.dumps(payload), flush=True)

        act_final, _ = self._forward(X)
        final_train_loss = float(self._compute_loss(act_final[-1], y))
        final_val_loss = None
        if X_val is not None and y_val is not None:
            if self.task == 'classification':
                yv_f = yv
            else:
                yv_f = y_val
            act_fv, _ = self._forward(X_val)
            final_val_loss = float(self._compute_loss(act_fv[-1], yv_f))

        return final_train_loss, (final_val_loss if final_val_loss is not None else final_train_loss)

    def predict(self, X):
        act, _ = self._forward(X)
        return act[-1]


def generate_synthetic_data(task, n_samples=1000):
    np.random.seed(42)
    if task == 'regression':
        X = np.random.randn(n_samples, 5)
        true_weights = np.array([1.5, -2.0, 0.5, 3.0, -1.0])
        y = np.dot(X, true_weights) + np.random.randn(n_samples) * 0.3
        return X, y
    elif task == 'classification':
        n_classes = 3
        X = np.random.randn(n_samples, 10)
        true_weights = np.random.randn(10, n_classes)
        logits = np.dot(X, true_weights)
        y = np.argmax(logits, axis=1)
        return X, y
    return None, None


def main():
    config_raw = os.environ.get('CYBERHEX_CONFIG', '{}')
    config = json.loads(config_raw)

    print(json.dumps({"type": "log", "message": f"Starting training with config: {json.dumps(config)}"}), flush=True)

    X, y = None, None
    data_path = config.get('data_path')
    if data_path and os.path.exists(data_path):
        try:
            data = np.loadtxt(data_path, delimiter=',', skiprows=1)
            X = data[:, :-1]
            y = data[:, -1]
        except Exception as e:
            print(json.dumps({"type": "log", "message": f"Failed to load data: {e}, using synthetic"}), flush=True)

    if X is None:
        task = config.get('task', 'regression')
        X, y = generate_synthetic_data(task)
        print(json.dumps({"type": "log", "message": f"Generated synthetic {task} data: {X.shape}"}), flush=True)

    split_idx = int(0.8 * len(X))
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]

    model_type = config.get('model_type', 'neural_network')
    epochs = config.get('epochs', 100)
    lr = config.get('learning_rate', 0.001)
    batch_size = config.get('batch_size', 32)
    task = config.get('task', 'regression')

    outputs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'outputs')
    os.makedirs(outputs_dir, exist_ok=True)

    if model_type == 'linear_regression':
        model = LinearRegression(learning_rate=lr, epochs=epochs, batch_size=batch_size)
    else:
        layers = config.get('layers', [X_train.shape[1], 64, 32, 1])
        if layers[0] != X_train.shape[1]:
            layers = [X_train.shape[1]] + layers
        if task == 'classification':
            num_classes = len(np.unique(y))
            if layers[-1] != num_classes:
                layers[-1] = num_classes
        model = NeuralNetwork(layers=layers, learning_rate=lr, epochs=epochs, batch_size=batch_size, task=task)

    train_loss, val_loss = model.fit(X_train, y_train, X_val, y_val)

    model_path = os.path.join(outputs_dir, f'model_{os.getpid()}.npz')
    if model_type == 'neural_network':
        save_dict = {}
        for i, (w, b) in enumerate(zip(model.weights, model.biases)):
            save_dict[f'weight_{i}'] = w
            save_dict[f'bias_{i}'] = b
        np.savez(model_path, **save_dict)

    print(json.dumps({
        "type": "training_complete",
        "final_train_loss": float(train_loss),
        "final_val_loss": float(val_loss),
        "model_path": model_path,
        "config": config
    }), flush=True)


if __name__ == '__main__':
    main()
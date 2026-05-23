import json
import os
import sys
import math
import random
import numpy as np

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

class MultiHeadAttention:
    def __init__(self, d_model, num_heads):
        self.d_model = d_model
        self.num_heads = num_heads
        self.head_dim = d_model // num_heads
        assert d_model % num_heads == 0

        self.w_q = np.random.randn(d_model, d_model) * 0.01
        self.w_k = np.random.randn(d_model, d_model) * 0.01
        self.w_v = np.random.randn(d_model, d_model) * 0.01
        self.w_o = np.random.randn(d_model, d_model) * 0.01

    def forward(self, x):
        batch_size, seq_len, d_model = x.shape
        q = np.dot(x, self.w_q).reshape(batch_size, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        k = np.dot(x, self.w_k).reshape(batch_size, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        v = np.dot(x, self.w_v).reshape(batch_size, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)

        scores = np.matmul(q, k.transpose(0, 1, 3, 2)) / math.sqrt(self.head_dim)
        attn = softmax(scores)
        context = np.matmul(attn, v).transpose(0, 2, 1, 3).reshape(batch_size, seq_len, d_model)
        return np.dot(context, self.w_o)

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
    def __init__(self, layers, learning_rate=0.001, epochs=100, batch_size=32, task='regression', optimizer='adam', activations=None):
        self.layers = layers
        self.lr = learning_rate
        self.epochs = epochs
        self.batch_size = batch_size
        self.task = task
        self.optimizer = optimizer
        self.weights = []
        self.biases = []
        self.activations_config = activations

        # Ensure we have enough activations; if not, default them
        if not self.activations_config or len(self.activations_config) < len(layers) - 1:
            default_hidden = 'relu'
            default_output = 'softmax' if task == 'classification' else 'linear'
            num_needed = len(layers) - 1
            if not self.activations_config:
                self.activations_config = [default_hidden] * (num_needed - 1) + [default_output]
            else:
                self.activations_config = self.activations_config + [default_hidden] * (num_needed - len(self.activations_config))

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

    def _activate(self, z, method):
        method = method.lower()
        if method == 'relu':
            return np.maximum(0, z)
        if method == 'sigmoid':
            return 1 / (1 + np.exp(-np.clip(z, -500, 500)))
        if method == 'tanh':
            return np.tanh(z)
        if method == 'softmax':
            exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
            return exp_z / np.sum(exp_z, axis=1, keepdims=True)
        return z

    def _activate_derivative(self, a, method):
        method = method.lower()
        if method == 'relu':
            return (a > 0).astype(float)
        if method == 'sigmoid':
            return a * (1 - a)
        if method == 'tanh':
            return 1 - a**2
        return np.ones_like(a)

    def _forward(self, X):
        activations = [X]
        zs = []
        for i in range(len(self.weights)):
            z = np.dot(activations[-1], self.weights[i]) + self.biases[i]
            zs.append(z)
            a = self._activate(z, self.activations_config[i])
            activations.append(a)
        return activations, zs

    def _compute_loss(self, y_pred, y_true):
        if self.task == 'classification':
            y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)
            if y_pred.shape[1] == 1:
                # Binary Cross Entropy
                return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
            # Categorical Cross Entropy
            return -np.mean(np.sum(y_true * np.log(y_pred), axis=1))
        return np.mean((y_pred - y_true.reshape(-1, 1)) ** 2)

    def _backward(self, activations, zs, X, y):
        grads_w = [np.zeros_like(w) for w in self.weights]
        grads_b = [np.zeros_like(b) for b in self.biases]
        m = X.shape[0]

        # Output layer delta
        # For softmax + categorical cross-entropy or sigmoid + binary cross-entropy or linear + MSE, delta is (a - y)
        last_act = self.activations_config[-1].lower()
        if (last_act == 'softmax') or (last_act == 'sigmoid') or (last_act == 'linear'):
            target = y if (self.task == 'classification' and y.ndim > 1) else y.reshape(-1, 1)
            delta = activations[-1] - target
        else:
            # General case for other output activations
            target = y if (self.task == 'classification' and y.ndim > 1) else y.reshape(-1, 1)
            error = activations[-1] - target
            delta = error * self._activate_derivative(activations[-1], last_act)

        for i in reversed(range(len(self.weights))):
            grads_w[i] = np.dot(activations[i].T, delta) / m
            grads_b[i] = np.sum(delta, axis=0) / m
            if i > 0:
                delta = np.dot(delta, self.weights[i].T) * self._activate_derivative(activations[i], self.activations_config[i-1])

        return grads_w, grads_b

    def fit(self, X, y, X_val=None, y_val=None):
        if self.task == 'classification' and self.layers[-1] > 1:
            num_classes = self.layers[-1]
            y_onehot = np.zeros((y.shape[0], num_classes))
            y_onehot[np.arange(y.shape[0]), y.astype(int)] = 1
            y = y_onehot
        elif self.task == 'classification' and self.layers[-1] == 1:
            y = y.reshape(-1, 1)

        # Adam state
        ms_w = [np.zeros_like(w) for w in self.weights]
        vs_w = [np.zeros_like(w) for w in self.weights]
        ms_b = [np.zeros_like(b) for b in self.biases]
        vs_b = [np.zeros_like(b) for b in self.biases]
        beta1, beta2, epsilon = 0.9, 0.999, 1e-8
        t = 0
        l2_lambda = 0.01

        # Pro features: Early Stopping & Best Model
        best_val_loss = float('inf')
        best_weights = [w.copy() for w in self.weights]
        best_biases = [b.copy() for b in self.biases]
        patience_counter = 0
        patience = 10

        n_samples = X.shape[0]
        current_lr = self.lr

        for epoch in range(self.epochs):
            # LR Decay: Pro optimization
            current_lr = self.lr * (1.0 / (1.0 + 0.01 * epoch))

            indices = np.random.permutation(n_samples)
            X_shuffled = X[indices]
            y_shuffled = y[indices]

            for start in range(0, n_samples, self.batch_size):
                end = min(start + self.batch_size, n_samples)
                X_batch = X_shuffled[start:end]
                y_batch = y_shuffled[start:end]

                activations, zs = self._forward(X_batch)
                grads_w, grads_b = self._backward(activations, zs, X_batch, y_batch)

                t += 1
                for j in range(len(self.weights)):
                    # L2 Regularization
                    grads_w[j] += l2_lambda * self.weights[j]

                    if self.optimizer.lower() == 'adam':
                        ms_w[j] = beta1 * ms_w[j] + (1 - beta1) * grads_w[j]
                        vs_w[j] = beta2 * vs_w[j] + (1 - beta2) * (grads_w[j]**2)
                        ms_b[j] = beta1 * ms_b[j] + (1 - beta1) * grads_b[j]
                        vs_b[j] = beta2 * vs_b[j] + (1 - beta2) * (grads_b[j]**2)

                        m_hat_w = ms_w[j] / (1 - beta1**t)
                        v_hat_w = vs_w[j] / (1 - beta2**t)
                        m_hat_b = ms_b[j] / (1 - beta1**t)
                        v_hat_b = vs_b[j] / (1 - beta2**t)

                        self.weights[j] -= current_lr * m_hat_w / (np.sqrt(v_hat_w) + epsilon)
                        self.biases[j] -= current_lr * m_hat_b / (np.sqrt(v_hat_b) + epsilon)
                    else:
                        self.weights[j] -= current_lr * grads_w[j]
                        self.biases[j] -= current_lr * grads_b[j]

            # Validation and Metrics
            act_all, _ = self._forward(X)
            train_loss = float(self._compute_loss(act_all[-1], y))

            val_loss = None
            if X_val is not None and y_val is not None:
                # Prepare y_val matching fit's internal state
                if self.task == 'classification' and self.layers[-1] > 1:
                    yv = np.zeros((y_val.shape[0], self.layers[-1]))
                    yv[np.arange(y_val.shape[0]), y_val.astype(int)] = 1
                elif self.task == 'classification' and self.layers[-1] == 1:
                    yv = y_val.reshape(-1, 1)
                else:
                    yv = y_val

                act_val, _ = self._forward(X_val)
                val_loss = float(self._compute_loss(act_val[-1], yv))

                # Early Stopping Logic: Pro Level
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    best_weights = [w.copy() for w in self.weights]
                    best_biases = [b.copy() for b in self.biases]
                    patience_counter = 0
                else:
                    patience_counter += 1

                if patience_counter >= patience:
                    print(json.dumps({"type": "log", "message": f"Early stopping at epoch {epoch+1}"}), flush=True)
                    break

            # Metrics Payload
            payload = {"type": "epoch", "epoch": epoch + 1, "train_loss": train_loss, "lr": current_lr}
            if val_loss is not None: payload["val_loss"] = val_loss

            if self.task == 'classification':
                preds = (act_all[-1] > 0.5).astype(int) if self.layers[-1] == 1 else np.argmax(act_all[-1], axis=1).reshape(-1, 1)
                target_labels = y if y.ndim > 1 else y.reshape(-1, 1)
                acc = float(np.mean(preds == target_labels))
                payload["accuracy"] = acc

            print(json.dumps(payload), flush=True)

        # Restore Best Model
        self.weights = best_weights
        self.biases = best_biases
        return best_val_loss if X_val is not None else train_loss, best_val_loss if X_val is not None else train_loss

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

class DataGenerator:
    def __init__(self, data_path, task='regression', batch_size=32):
        self.data_path = data_path
        self.task = task
        self.batch_size = batch_size
        self.ext = os.path.splitext(data_path)[1].lower()
        self.file_size = os.path.getsize(data_path)

    def _load_csv_batch(self):

        import csv
        with open(self.data_path, 'r') as f:
            reader = csv.reader(f)
            next(reader)
            batch_x, batch_y = [], []
            for row in reader:
                try:
                    vals = [float(x) for x in row]
                    batch_x.append(vals[:-1])
                    batch_y.append(vals[-1])
                    if len(batch_x) == self.batch_size:
                        yield np.array(batch_x), np.array(batch_y)
                        batch_x, batch_y = [], []
                except: continue
            if batch_x:
                yield np.array(batch_x), np.array(batch_y)

    def _load_image_batch(self):

        print(json.dumps({"type": "log", "message": "Procesing image/binary data stream..."}), flush=True)

        with open(self.data_path, 'rb') as f:
            while True:
                chunk = f.read(self.batch_size * 1024)
                if not chunk: break
                data = np.frombuffer(chunk, dtype=np.uint8)

                n = len(data) // 1024
                if n == 0: break
                x = data[:n*1024].reshape(n, 1024) / 255.0
                y = np.random.randint(0, 2, n) if self.task == 'classification' else np.random.rand(n)
                yield x, y

    def flow(self):
        if self.ext == '.csv':
            return self._load_csv_batch()
        else:
            return self._load_image_batch()

def main():
    config_raw = os.environ.get('CYBERHEX_CONFIG', '{}')
    config = json.loads(config_raw)

    print(json.dumps({"type": "log", "message": f"Starting multi-modal training pipeline. Config: {json.dumps(config)}"}), flush=True)

    data_path = config.get('data_path')
    task = config.get('task', 'regression')
    batch_size = config.get('batch_size', 32)

    X_train, y_train = None, None
    X_val, y_val = None, None

    if data_path and os.path.exists(data_path):
        size_mb = os.path.getsize(data_path) / (1024**2)
        if size_mb > 500:
             print(json.dumps({"type": "log", "message": f"Very large dataset detected ({size_mb:.2f} MB). The current engine will load a 500MB sample."}), flush=True)
             gen = DataGenerator(data_path, task, batch_size=10000)
             # Basic sampling for very large files
             X_collect, y_collect = [], []
             gen_flow = gen.flow()
             for _ in range(50): # Take up to 500k samples
                 try:
                     bx, by = next(gen_flow)
                     X_collect.append(bx)
                     y_collect.append(by)
                 except StopIteration: break
             X_train = np.concatenate(X_collect, axis=0)
             y_train = np.concatenate(y_collect, axis=0)
        else:
            try:
                print(json.dumps({"type": "log", "message": f"Loading dataset ({size_mb:.2f} MB) into memory..."}), flush=True)
                if data_path.endswith('.csv'):
                    # Use a more memory-efficient way to load CSV if possible
                    # but stick to numpy as per project style
                    data = np.genfromtxt(data_path, delimiter=',', skip_header=1)
                    X_train = data[:, :-1]
                    y_train = data[:, -1]
                else:
                    with open(data_path, 'rb') as f:
                        data = np.frombuffer(f.read(), dtype=np.uint8)
                        n = len(data) // 1024
                        X_train = data[:n*1024].reshape(n, 1024) / 255.0
                        y_train = np.random.randint(0, 2, n)
            except Exception as e:
                print(json.dumps({"type": "log", "message": f"Data load failed: {e}"}), flush=True)

    if X_train is None:
        X_train, y_train = generate_synthetic_data(task)
        print(json.dumps({"type": "log", "message": f"Using synthetic {task} data: {X_train.shape}"}), flush=True)

    if X_val is None:
        split_idx = int(0.8 * len(X_train))
        X_val = X_train[split_idx:]
        y_val = y_train[split_idx:]
        X_train = X_train[:split_idx]
        y_train = y_train[:split_idx]

    # Feature Scaling: Essential for Neural Networks
    print(json.dumps({"type": "log", "message": "Applying feature scaling (StandardScaler)..."}), flush=True)
    mean = np.mean(X_train, axis=0)
    std = np.std(X_train, axis=0) + 1e-8
    X_train = (X_train - mean) / std
    if X_val is not None:
        X_val = (X_val - mean) / std

    model_type = config.get('model_type', 'neural_network')
    epochs = config.get('epochs', 100)
    lr = config.get('learning_rate', 0.001)
    batch_size = config.get('batch_size', 32)

    outputs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'outputs')
    os.makedirs(outputs_dir, exist_ok=True)

    if model_type == 'linear_regression':
        model = LinearRegression(learning_rate=lr, epochs=epochs, batch_size=batch_size)
    else:
        layers = config.get('layers', [X_train.shape[1], 64, 32, 1])
        activations = config.get('activations', [])
        if layers[0] != X_train.shape[1]:
            layers = [X_train.shape[1]] + layers
            # If we added an input layer, we might need an activation for the transition
            # but builder usually sends activations for all transitions including the last one.
        if task == 'classification':
            num_classes = len(np.unique(y_train))
            if layers[-1] == 1 and num_classes == 2:
                # Binary classification, keep as 1 node
                pass
            elif layers[-1] != num_classes:
                layers[-1] = num_classes
        model = NeuralNetwork(layers=layers, learning_rate=lr, epochs=epochs, batch_size=batch_size, task=task, activations=activations)

    train_loss, val_loss = model.fit(X_train, y_train, X_val, y_val)

    model_path = os.path.join(outputs_dir, f'model_{os.getpid()}.npz')
    if model_type == 'neural_network':
        save_dict = {}
        for i, (w, b) in enumerate(zip(model.weights, model.biases)):
            save_dict[f'weight_{i}'] = w
            save_dict[f'bias_{i}'] = b
        np.savez(model_path, **save_dict)
    elif model_type == 'linear_regression':
        np.savez(model_path, weights=model.weights, bias=model.bias)
    else:
        model_path = None

    print(json.dumps({
        "type": "training_complete",
        "final_train_loss": float(train_loss),
        "final_val_loss": float(val_loss),
        "model_path": model_path,
        "config": config
    }), flush=True)

if __name__ == '__main__':
    main()

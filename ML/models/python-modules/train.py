import json
import os
import sys
import math
import random
import numpy as np









def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)



def gelu(x):
    
    return 0.5 * x * (1.0 + np.tanh(math.sqrt(2.0 / math.pi) * (x + 0.044715 * x**3)))

def gelu_derivative(a, x):
    
    eps = 1e-5
    return (gelu(x + eps) - gelu(x - eps)) / (2 * eps)

def swish(x):
    return x * (1 / (1 + np.exp(-np.clip(x, -500, 500))))

def mish(x):
    return x * np.tanh(np.log(1 + np.exp(np.clip(x, -20, 20))))



class BatchNorm:
    
    def __init__(self, n_features, eps=1e-5, momentum=0.1):
        self.eps = eps
        self.momentum = momentum
        self.gamma = np.ones(n_features)
        self.beta = np.zeros(n_features)
        self.running_mean = np.zeros(n_features)
        self.running_var = np.ones(n_features)
        
        self._cache = None

    def forward(self, x, training=True):
        if training:
            mu = x.mean(axis=0)
            var = x.var(axis=0)
            x_hat = (x - mu) / np.sqrt(var + self.eps)
            self._cache = (x, x_hat, mu, var)
            self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mu
            self.running_var  = (1 - self.momentum) * self.running_var  + self.momentum * var
        else:
            x_hat = (x - self.running_mean) / np.sqrt(self.running_var + self.eps)
        return self.gamma * x_hat + self.beta

    def backward(self, dout):
        x, x_hat, mu, var = self._cache
        m = x.shape[0]
        dgamma = np.sum(dout * x_hat, axis=0)
        dbeta  = np.sum(dout, axis=0)
        dx_hat = dout * self.gamma
        dvar   = np.sum(dx_hat * (x - mu) * -0.5 * (var + self.eps)**(-1.5), axis=0)
        dmu    = np.sum(dx_hat * -1 / np.sqrt(var + self.eps), axis=0) + dvar * np.mean(-2 * (x - mu), axis=0)
        dx     = dx_hat / np.sqrt(var + self.eps) + dvar * 2 * (x - mu) / m + dmu / m
        return dx, dgamma, dbeta



class Dropout:
    def __init__(self, rate=0.5):
        self.rate = rate
        self._mask = None

    def forward(self, x, training=True):
        if not training or self.rate == 0:
            return x
        self._mask = (np.random.rand(*x.shape) > self.rate).astype(float) / (1 - self.rate)
        return x * self._mask

    def backward(self, dout):
        return dout * self._mask if self._mask is not None else dout



class MultiHeadAttention:
    def __init__(self, d_model, num_heads):
        self.d_model = d_model
        self.num_heads = num_heads
        self.head_dim = d_model // num_heads
        assert d_model % num_heads == 0
        scale = math.sqrt(2.0 / (d_model + d_model))
        self.w_q = np.random.randn(d_model, d_model) * scale
        self.w_k = np.random.randn(d_model, d_model) * scale
        self.w_v = np.random.randn(d_model, d_model) * scale
        self.w_o = np.random.randn(d_model, d_model) * scale

    def forward(self, x):
        B, T, D = x.shape
        q = np.dot(x, self.w_q).reshape(B, T, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        k = np.dot(x, self.w_k).reshape(B, T, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        v = np.dot(x, self.w_v).reshape(B, T, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        scores = np.matmul(q, k.transpose(0, 1, 3, 2)) / math.sqrt(self.head_dim)
        attn   = softmax(scores)
        ctx    = np.matmul(attn, v).transpose(0, 2, 1, 3).reshape(B, T, D)
        return np.dot(ctx, self.w_o)



class LinearRegression:
    def __init__(self, learning_rate=0.001, epochs=100, batch_size=32):
        self.lr = learning_rate
        self.epochs = epochs
        self.batch_size = batch_size
        self.weights = None
        self.bias = 0.0

    def fit(self, X, y, X_val=None, y_val=None):
        n, f = X.shape
        self.weights = np.random.randn(f) * 0.01
        self.bias = 0.0

        for epoch in range(self.epochs):
            idx = np.random.permutation(n)
            for s in range(0, n, self.batch_size):
                Xb = X[idx[s:s+self.batch_size]]
                yb = y[idx[s:s+self.batch_size]]
                yp = np.dot(Xb, self.weights) + self.bias
                dw = (2/len(Xb)) * np.dot(Xb.T, yp - yb)
                db = (2/len(Xb)) * np.sum(yp - yb)
                self.weights -= self.lr * dw
                self.bias    -= self.lr * db

            train_loss = float(np.mean((np.dot(X, self.weights) + self.bias - y)**2))
            val_loss = None
            if X_val is not None and y_val is not None:
                val_loss = float(np.mean((np.dot(X_val, self.weights) + self.bias - y_val)**2))

            payload = {"type": "epoch", "epoch": epoch + 1, "train_loss": train_loss}
            if val_loss is not None:
                payload["val_loss"] = val_loss
            print(json.dumps(payload), flush=True)

        return train_loss, (val_loss if val_loss is not None else train_loss)

    def predict(self, X):
        return np.dot(X, self.weights) + self.bias



class NeuralNetwork:
    

    def __init__(
        self,
        layers,
        learning_rate=0.001,
        epochs=100,
        batch_size=32,
        task="regression",
        optimizer="adamw",
        activations=None,
        dropout_rate=0.0,
        use_batch_norm=False,
        gradient_clip=5.0,
        label_smoothing=0.0,
        weight_decay=1e-4,
        patience=15,
        early_stopping=True,
        lr_schedule="cosine",   
        warmup_epochs=5,
    ):
        self.layers = layers
        self.lr = learning_rate
        self.epochs = epochs
        self.batch_size = batch_size
        self.task = task
        self.optimizer = optimizer.lower()
        self.dropout_rate = dropout_rate
        self.use_batch_norm = use_batch_norm
        self.gradient_clip = gradient_clip
        self.label_smoothing = label_smoothing
        self.weight_decay = weight_decay
        self.patience = patience
        self.early_stopping = early_stopping
        self.lr_schedule = lr_schedule
        self.warmup_epochs = warmup_epochs
        self.activations_config = activations

        
        
        
        n_transitions = len(layers) - 1
        if not self.activations_config or len(self.activations_config) < n_transitions:
            default_hidden = "gelu"
            default_output = "softmax" if task == "classification" else "linear"
            if not self.activations_config:
                self.activations_config = [default_hidden] * (n_transitions - 1) + [default_output]
            else:
                need = n_transitions - len(self.activations_config)
                self.activations_config = self.activations_config + [default_hidden] * need

        self._build()

    

    def _build(self):
        np.random.seed(42)
        self.weights = []
        self.biases  = []
        self.bn_layers    = []
        self.dropout_layers = []

        for i in range(len(self.layers) - 1):
            fi, fo = self.layers[i], self.layers[i + 1]
            act = self.activations_config[i].lower() if i < len(self.activations_config) else "relu"

            
            if act in ("relu", "leaky_relu"):
                w = np.random.randn(fi, fo) * math.sqrt(2.0 / fi)
            elif act in ("gelu", "swish", "mish"):
                w = np.random.randn(fi, fo) * math.sqrt(2.0 / fi)
            else:
                limit = math.sqrt(6.0 / (fi + fo))
                w = np.random.uniform(-limit, limit, (fi, fo))

            self.weights.append(w)
            self.biases.append(np.zeros(fo))

            
            if self.use_batch_norm and i < len(self.layers) - 2:
                self.bn_layers.append(BatchNorm(fo))
            else:
                self.bn_layers.append(None)

            
            if self.dropout_rate > 0 and i < len(self.layers) - 2:
                self.dropout_layers.append(Dropout(self.dropout_rate))
            else:
                self.dropout_layers.append(None)

        
        self._ensemble = []   

    

    def _activate(self, z, method, training=True, index=0, pre_z=None):
        m = method.lower()
        if m == "relu":        return np.maximum(0, z)
        if m == "leaky_relu":  return np.where(z > 0, z, 0.01 * z)
        if m == "gelu":        return gelu(z)
        if m == "swish":       return swish(z)
        if m == "mish":        return mish(z)
        if m == "sigmoid":     return 1 / (1 + np.exp(-np.clip(z, -500, 500)))
        if m == "tanh":        return np.tanh(z)
        if m == "softmax":
            e = np.exp(z - np.max(z, axis=1, keepdims=True))
            return e / np.sum(e, axis=1, keepdims=True)
        return z  

    def _activate_derivative(self, a, z, method):
        m = method.lower()
        if m == "relu":        return (a > 0).astype(float)
        if m == "leaky_relu":  return np.where(a > 0, 1.0, 0.01)
        if m == "gelu":        return gelu_derivative(a, z)
        if m == "swish":       sig = 1/(1+np.exp(-np.clip(z,-500,500))); return sig + z*sig*(1-sig)
        if m == "mish":
            sp = np.log(1 + np.exp(np.clip(z, -20, 20)))
            return np.tanh(sp) + z * (1 - np.tanh(sp)**2) * (1 / (1 + np.exp(-np.clip(z, -500, 500))))
        if m == "sigmoid":     return a * (1 - a)
        if m == "tanh":        return 1 - a**2
        return np.ones_like(a)

    

    def _forward(self, X, training=True):
        activations = [X]
        pre_activations = [None]   
        for i in range(len(self.weights)):
            z = np.dot(activations[-1], self.weights[i]) + self.biases[i]
            pre_activations.append(z)

            a = self._activate(z, self.activations_config[i])

            
            if self.bn_layers[i] is not None:
                a = self.bn_layers[i].forward(a, training=training)

            
            if self.dropout_layers[i] is not None:
                a = self.dropout_layers[i].forward(a, training=training)

            activations.append(a)
        return activations, pre_activations

    

    def _compute_loss(self, y_pred, y_true):
        if self.task == "classification":
            y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)

            
            if self.label_smoothing > 0 and y_true.ndim > 1:
                K = y_true.shape[1]
                y_true = y_true * (1 - self.label_smoothing) + self.label_smoothing / K

            if y_pred.shape[-1] == 1:
                return float(-np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred)))
            return float(-np.mean(np.sum(y_true * np.log(y_pred), axis=1)))
        return float(np.mean((y_pred - y_true.reshape(-1, 1))**2))

    

    def _backward(self, activations, pre_activations, X, y):
        grads_w = [np.zeros_like(w) for w in self.weights]
        grads_b = [np.zeros_like(b) for b in self.biases]
        m = X.shape[0]

        last_act = self.activations_config[-1].lower()
        if last_act in ("softmax", "sigmoid", "linear"):
            target = y if (self.task == "classification" and y.ndim > 1) else y.reshape(-1, 1)
            delta  = activations[-1] - target
        else:
            target = y if (self.task == "classification" and y.ndim > 1) else y.reshape(-1, 1)
            error  = activations[-1] - target
            delta  = error * self._activate_derivative(activations[-1], pre_activations[-1], last_act)

        for i in reversed(range(len(self.weights))):
            
            if self.dropout_layers[i] is not None:
                delta = self.dropout_layers[i].backward(delta)

            
            if self.bn_layers[i] is not None:
                delta, dgamma, dbeta = self.bn_layers[i].backward(delta)
                self.bn_layers[i].gamma -= 0.001 * dgamma
                self.bn_layers[i].beta  -= 0.001 * dbeta

            grads_w[i] = np.dot(activations[i].T, delta) / m
            grads_b[i] = np.sum(delta, axis=0) / m

            if i > 0:
                act_prev = self.activations_config[i - 1]
                delta = np.dot(delta, self.weights[i].T) * self._activate_derivative(
                    activations[i], pre_activations[i], act_prev
                )

        return grads_w, grads_b

    

    def _clip_gradients(self, grads_w, grads_b):
        if self.gradient_clip <= 0:
            return grads_w, grads_b
        
        # Ensure all gradients are finite before norm calculation
        grads_w = [np.nan_to_num(g) for g in grads_w]
        grads_b = [np.nan_to_num(g) for g in grads_b]
        
        total_norm = 0.0
        for g in grads_w + grads_b:
            total_norm += np.sum(g**2)
        total_norm = math.sqrt(total_norm)
        
        if total_norm > self.gradient_clip:
            scale = self.gradient_clip / (total_norm + 1e-8)
            grads_w = [g * scale for g in grads_w]
            grads_b = [g * scale for g in grads_b]
        return grads_w, grads_b

    

    def _get_lr(self, epoch):
        
        if epoch < self.warmup_epochs:
            return self.lr * (epoch + 1) / max(self.warmup_epochs, 1)

        t = epoch - self.warmup_epochs
        T = max(self.epochs - self.warmup_epochs, 1)

        if self.lr_schedule == "cosine":
            return self.lr * 0.5 * (1 + math.cos(math.pi * t / T))
        if self.lr_schedule == "cosine_warm":
            T_cycle = max(T // 3, 1)
            t_cycle = t % T_cycle
            return self.lr * 0.5 * (1 + math.cos(math.pi * t_cycle / T_cycle))
        if self.lr_schedule == "step":
            return self.lr * (0.5 ** (t // max(T // 4, 1)))
        
        return self.lr * (1.0 / (1.0 + 0.005 * t))

    

    def _compute_metrics(self, y_pred, y_true_raw):
        if self.task != "classification":
            return {}
        y_true_safe = np.nan_to_num(y_true_raw, nan=0.0, posinf=0.0, neginf=0.0)
        if self.layers[-1] == 1:
            preds = (np.nan_to_num(y_pred, nan=0.0) > 0.5).astype(int).flatten()
            trues = y_true_safe.flatten().astype(int)
        else:
            preds = np.argmax(np.nan_to_num(y_pred, nan=0.0), axis=1)
            trues = y_true_safe.flatten().astype(int)

        accuracy = float(np.mean(preds == trues))

        
        tp = float(np.sum((preds == 1) & (trues == 1)))
        fp = float(np.sum((preds == 1) & (trues == 0)))
        fn = float(np.sum((preds == 0) & (trues == 1)))
        precision = tp / (tp + fp + 1e-8)
        recall    = tp / (tp + fn + 1e-8)
        f1        = 2 * precision * recall / (precision + recall + 1e-8)

        
        act_all, _ = self._forward(np.eye(self.layers[0])[:10], training=False)
        dead = 0
        total = 0
        for a in act_all[1:-1]:
            dead  += int(np.sum(np.all(a == 0, axis=0)))
            total += a.shape[1]
        dead_ratio = dead / max(total, 1)

        return {
            "accuracy":  accuracy,
            "f1":        float(f1),
            "precision": float(precision),
            "recall":    float(recall),
            "dead_neurons_pct": float(dead_ratio * 100),
        }

    

    def _update_ensemble(self, val_loss):
        snap = (val_loss, [w.copy() for w in self.weights], [b.copy() for b in self.biases])
        self._ensemble.append(snap)
        self._ensemble.sort(key=lambda x: x[0])
        if len(self._ensemble) > 3:
            self._ensemble = self._ensemble[:3]

    

    def _optimizer_step(self, opt_state, grads_w, grads_b, epoch, current_lr):
        ms_w, vs_w, ms_b, vs_b = (
            opt_state["ms_w"], opt_state["vs_w"],
            opt_state["ms_b"], opt_state["vs_b"],
        )
        t = opt_state["t"]
        opt = self.optimizer

        beta1, beta2, eps = 0.9, 0.999, 1e-8
        alpha = current_lr
        wd = self.weight_decay

        for j in range(len(self.weights)):
            gw = grads_w[j]
            gb = grads_b[j]

            if opt == "adamw":
                ms_w[j] = beta1 * ms_w[j] + (1-beta1) * gw
                vs_w[j] = beta2 * vs_w[j] + (1-beta2) * gw**2
                ms_b[j] = beta1 * ms_b[j] + (1-beta1) * gb
                vs_b[j] = beta2 * vs_b[j] + (1-beta2) * gb**2
                mw = ms_w[j] / (1 - beta1**t)
                vw = vs_w[j] / (1 - beta2**t)
                mb = ms_b[j] / (1 - beta1**t)
                vb = vs_b[j] / (1 - beta2**t)
                self.weights[j] -= alpha * (mw / (np.sqrt(vw) + eps) + wd * self.weights[j])
                self.biases[j]  -= alpha * mb / (np.sqrt(vb) + eps)

            elif opt == "radam":
                ms_w[j] = beta1 * ms_w[j] + (1-beta1) * gw
                vs_w[j] = beta2 * vs_w[j] + (1-beta2) * gw**2
                ms_b[j] = beta1 * ms_b[j] + (1-beta1) * gb
                vs_b[j] = beta2 * vs_b[j] + (1-beta2) * gb**2
                rho_inf = 2/(1-beta2) - 1
                rho     = rho_inf - 2*t*beta2**t/(1-beta2**t)
                if rho > 4:
                    rect = math.sqrt(((rho-4)*(rho-2)*rho_inf)/((rho_inf-4)*(rho_inf-2)*rho))
                    mw = ms_w[j]/(1-beta1**t)
                    vw = vs_w[j]/(1-beta2**t)
                    mb = ms_b[j]/(1-beta1**t)
                    vb = vs_b[j]/(1-beta2**t)
                    self.weights[j] -= alpha * rect * mw/(np.sqrt(vw)+eps) + alpha*wd*self.weights[j]
                    self.biases[j]  -= alpha * rect * mb/(np.sqrt(vb)+eps)
                else:
                    mw = ms_w[j]/(1-beta1**t)
                    mb = ms_b[j]/(1-beta1**t)
                    self.weights[j] -= alpha * mw + alpha*wd*self.weights[j]
                    self.biases[j]  -= alpha * mb

            elif opt == "lion":
                
                c_w = np.sign(beta1 * ms_w[j] + (1-beta1) * gw)
                c_b = np.sign(beta1 * ms_b[j] + (1-beta1) * gb)
                self.weights[j] -= alpha * (c_w + wd * self.weights[j])
                self.biases[j]  -= alpha * c_b
                ms_w[j] = beta2 * ms_w[j] + (1-beta2) * gw
                ms_b[j] = beta2 * ms_b[j] + (1-beta2) * gb

            elif opt == "rmsprop":
                vs_w[j] = 0.9 * vs_w[j] + 0.1 * gw**2
                vs_b[j] = 0.9 * vs_b[j] + 0.1 * gb**2
                self.weights[j] -= alpha * gw / (np.sqrt(vs_w[j]) + eps) + alpha*wd*self.weights[j]
                self.biases[j]  -= alpha * gb / (np.sqrt(vs_b[j]) + eps)

            elif opt == "sgd":
                ms_w[j] = 0.9 * ms_w[j] + gw
                ms_b[j] = 0.9 * ms_b[j] + gb
                self.weights[j] -= alpha * ms_w[j] + alpha*wd*self.weights[j]
                self.biases[j]  -= alpha * ms_b[j]
            elif opt == "adamw" or opt == "adam":
                ms_w[j] = beta1 * ms_w[j] + (1-beta1) * gw
                vs_w[j] = beta2 * vs_w[j] + (1-beta2) * (gw**2)
                ms_b[j] = beta1 * ms_b[j] + (1-beta1) * gb
                vs_b[j] = beta2 * vs_b[j] + (1-beta2) * (gb**2)
                mw = ms_w[j] / (1 - beta1**t + 1e-10)
                vw = vs_w[j] / (1 - beta2**t + 1e-10)
                mb = ms_b[j] / (1 - beta1**t + 1e-10)
                vb = vs_b[j] / (1 - beta2**t + 1e-10)
                self.weights[j] -= alpha * (mw / (np.sqrt(vw) + eps) + wd * self.weights[j])
                self.biases[j]  -= alpha * (mb / (np.sqrt(vb) + eps))
            else:
                # Basic Gradient Descent fallback
                self.weights[j] -= alpha * gw
                self.biases[j]  -= alpha * gb

    

    def fit(self, X, y, X_val=None, y_val=None):
        
        y_orig = y.copy()
        if self.task == "classification" and self.layers[-1] > 1:
            nc = self.layers[-1]
            yoh = np.zeros((y.shape[0], nc))
            yoh[np.arange(y.shape[0]), y.astype(int)] = 1
            y = yoh
        elif self.task == "classification" and self.layers[-1] == 1:
            y = y.reshape(-1, 1)

        
        opt_state = {
            "ms_w": [np.zeros_like(w) for w in self.weights],
            "vs_w": [np.zeros_like(w) for w in self.weights],
            "ms_b": [np.zeros_like(b) for b in self.biases],
            "vs_b": [np.zeros_like(b) for b in self.biases],
            "t": 0,
        }

        best_val_loss    = float("inf")
        best_weights     = [w.copy() for w in self.weights]
        best_biases      = [b.copy() for b in self.biases]
        patience_counter = 0
        n = X.shape[0]

        print(json.dumps({
            "type": "log",
            "message": (
                f"[CyberHex ∞-IQ Engine] Optimizer={self.optimizer.upper()} | "
                f"LR={self.lr} | Schedule={self.lr_schedule} | "
                f"BatchNorm={self.use_batch_norm} | Dropout={self.dropout_rate} | "
                f"GradClip={self.gradient_clip} | Patience={self.patience}"
            )
        }), flush=True)

        for epoch in range(self.epochs):
            current_lr = self._get_lr(epoch)

            
            idx = np.random.permutation(n)
            Xs, ys = X[idx], y[idx]

            for s in range(0, n, self.batch_size):
                e   = min(s + self.batch_size, n)
                Xb  = Xs[s:e]
                yb  = ys[s:e]

                acts, pre_acts = self._forward(Xb, training=True)
                gw, gb = self._backward(acts, pre_acts, Xb, yb)
                gw, gb = self._clip_gradients(gw, gb)

                opt_state["t"] += 1
                self._optimizer_step(opt_state, gw, gb, epoch, current_lr)

            
            acts_all, _ = self._forward(X, training=False)
            train_loss  = self._compute_loss(acts_all[-1], y)

            val_loss = None
            if X_val is not None and y_val is not None:
                if self.task == "classification" and self.layers[-1] > 1:
                    yv = np.zeros((y_val.shape[0], self.layers[-1]))
                    yv[np.arange(y_val.shape[0]), y_val.astype(int)] = 1
                elif self.task == "classification" and self.layers[-1] == 1:
                    yv = y_val.reshape(-1, 1)
                else:
                    yv = y_val

                acts_val, _ = self._forward(X_val, training=False)
                val_loss = self._compute_loss(acts_val[-1], yv)

                
                self._update_ensemble(val_loss)

                
                if val_loss < best_val_loss:
                    best_val_loss    = val_loss
                    best_weights     = [w.copy() for w in self.weights]
                    best_biases      = [b.copy() for b in self.biases]
                    patience_counter = 0
                else:
                    patience_counter += 1

                if self.early_stopping and patience_counter >= self.patience:
                    print(json.dumps({
                        "type": "log",
                        "message": f"[EarlyStopping] Triggered at epoch {epoch+1}. Best val_loss={best_val_loss:.6f}"
                    }), flush=True)
                    break

            
            # Ensure train_loss is finite for JSON
            safe_train_loss = float(train_loss) if np.isfinite(train_loss) else 1e9
            
            payload = {
                "type":       "epoch",
                "epoch":      epoch + 1,
                "train_loss": safe_train_loss,
                "lr":         float(current_lr),
            }
            if val_loss is not None:
                safe_val_loss = float(val_loss) if np.isfinite(val_loss) else 1e9
                payload["val_loss"] = safe_val_loss

            metrics = self._compute_metrics(acts_all[-1], y_orig)
            payload.update(metrics)

            print(json.dumps(payload), flush=True)

        
        self.weights = best_weights
        self.biases  = best_biases

        final_val = best_val_loss if X_val is not None else train_loss
        print(json.dumps({
            "type": "log",
            "message": f"[CyberHex ∞-IQ Engine] Training complete. Best val_loss={final_val:.6f} | Ensemble size={len(self._ensemble)}"
        }), flush=True)

        return float(train_loss), float(final_val)

    def predict(self, X):
        acts, _ = self._forward(X, training=False)
        return acts[-1]



def generate_synthetic_data(task, n_samples=2000):
    
    np.random.seed(42)

    
    duration          = np.random.exponential(scale=40, size=n_samples)
    src_bytes         = np.random.lognormal(mean=8, sigma=2, size=n_samples)
    dst_bytes         = np.random.lognormal(mean=7, sigma=2, size=n_samples)
    connection_count  = np.random.poisson(lam=15, size=n_samples).astype(float)
    srv_count         = np.random.poisson(lam=10, size=n_samples).astype(float)
    serror_rate       = np.random.beta(a=0.5, b=5, size=n_samples)
    rerror_rate       = np.random.beta(a=0.3, b=5, size=n_samples)
    same_srv_rate     = np.random.beta(a=5, b=1, size=n_samples)
    diff_srv_rate     = 1 - same_srv_rate
    srv_diff_host_rate= np.random.beta(a=1, b=3, size=n_samples)
    payload_entropy   = np.random.uniform(0.1, 7.99, n_samples)
    ttl_value         = np.random.choice([64, 128, 255], size=n_samples).astype(float)
    packet_rate       = np.random.exponential(scale=500, size=n_samples)
    syn_flag          = (serror_rate > 0.6).astype(float) + np.random.rand(n_samples) * 0.1

    X = np.column_stack([
        duration, src_bytes, dst_bytes, connection_count, srv_count,
        serror_rate, rerror_rate, same_srv_rate, diff_srv_rate,
        srv_diff_host_rate, payload_entropy, ttl_value, packet_rate, syn_flag
    ])

    if task == "classification":
        
        is_attack = (
            ((connection_count > 30) & (same_srv_rate < 0.3)) |
            (src_bytes > 50000) |
            ((serror_rate > 0.7) & (syn_flag > 0.7)) |
            (payload_entropy > 7.5)
        ).astype(int)
        
        noise_mask = np.random.random(n_samples) < 0.03
        is_attack[noise_mask] = 1 - is_attack[noise_mask]
        return X, is_attack
    else:
        
        y = (
            src_bytes * 0.0001 +
            connection_count * 0.5 +
            serror_rate * 30 +
            payload_entropy * 5 +
            np.random.randn(n_samples) * 2
        )
        y = np.clip(y, 0, 100)
        return X, y



class DataGenerator:
    def __init__(self, data_path, task="regression", batch_size=32):
        self.data_path  = data_path
        self.task       = task
        self.batch_size = batch_size
        self.ext        = os.path.splitext(data_path)[1].lower()
        self.file_size  = os.path.getsize(data_path)

    def _load_csv_batch(self):
        import csv
        with open(self.data_path, "r") as f:
            reader = csv.reader(f)
            next(reader)
            bx, by = [], []
            for row in reader:
                try:
                    vals = [float(v) for v in row]
                    bx.append(vals[:-1])
                    by.append(vals[-1])
                    if len(bx) == self.batch_size:
                        yield np.array(bx), np.array(by)
                        bx, by = [], []
                except:
                    continue
            if bx:
                yield np.array(bx), np.array(by)

    def _load_image_batch(self):
        print(json.dumps({"type": "log", "message": "Streaming binary/image data..."}), flush=True)
        with open(self.data_path, "rb") as f:
            while True:
                chunk = f.read(self.batch_size * 1024)
                if not chunk:
                    break
                data = np.frombuffer(chunk, dtype=np.uint8)
                n = len(data) // 1024
                if n == 0:
                    break
                x = data[:n*1024].reshape(n, 1024) / 255.0
                y = np.random.randint(0, 2, n) if self.task == "classification" else np.random.rand(n)
                yield x, y

    def flow(self):
        return self._load_csv_batch() if self.ext == ".csv" else self._load_image_batch()



def main():
    config_raw = os.environ.get("CYBERHEX_CONFIG", "{}")
    config     = json.loads(config_raw)

    print(json.dumps({
        "type": "log",
        "message": f"[CyberHex ∞-IQ Engine] Booting ultra-max-pro training pipeline... Config: {json.dumps(config)}"
    }), flush=True)

    data_path  = config.get("data_path")
    task       = config.get("task", "regression")
    batch_size = config.get("batch_size", 32)

    X_train = y_train = X_val = y_val = None

    if data_path and os.path.exists(data_path):
        size_mb = os.path.getsize(data_path) / (1024**2)
        if size_mb > 500:
            print(json.dumps({"type": "log", "message": f"Large dataset detected ({size_mb:.1f} MB). Streaming 500k samples."}), flush=True)
            gen = DataGenerator(data_path, task, batch_size=10000)
            Xc, yc = [], []
            for _ in range(50):
                try:
                    bx, by = next(gen.flow())
                    Xc.append(bx); yc.append(by)
                except StopIteration:
                    break
            X_train = np.concatenate(Xc, axis=0)
            y_train = np.concatenate(yc, axis=0)
        else:
            try:
                print(json.dumps({"type": "log", "message": f"Loading dataset ({size_mb:.2f} MB)..."}), flush=True)
                if data_path.endswith(".csv"):
                    import csv
                    with open(data_path, "r") as f:
                        header = next(csv.reader(f))
                    
                    full_data = np.genfromtxt(data_path, delimiter=",", skip_header=1)
                    
                    sel_feats = config.get("selected_features", [])
                    tgt_feats = config.get("target_features", [])
                    
                    if not sel_feats or not tgt_feats:
                        # Fallback to old behavior if config is missing
                        X_train = full_data[:, :-1]
                        y_train = full_data[:, -1]
                    else:
                        # Filter based on headers
                        try:
                            feat_indices = [header.index(h) for h in sel_feats if h in header]
                            target_indices = [header.index(h) for h in tgt_feats if h in header]
                            
                            X_train = full_data[:, feat_indices]
                            y_train = full_data[:, target_indices]
                            
                            if y_train.shape[1] == 1:
                                y_train = y_train.flatten()
                        except Exception as e:
                            print(json.dumps({"type": "log", "message": f"Feature selection failed: {e}. Falling back."}), flush=True)
                            X_train = full_data[:, :-1]
                            y_train = full_data[:, -1]
                else:
                    with open(data_path, "rb") as f:
                        data    = np.frombuffer(f.read(), dtype=np.uint8)
                        n       = len(data) // 1024
                        X_train = data[:n*1024].reshape(n, 1024) / 255.0
                        y_train = np.random.randint(0, 2, n)
            except Exception as ex:
                print(json.dumps({"type": "log", "message": f"Data load error: {ex}"}), flush=True)


        if X_train is not None:
            # Robust data cleaning for Infinity and NaN values
            if np.any(np.isnan(X_train)) or np.any(np.isinf(X_train)):
                print(json.dumps({"type": "log", "message": "Cleaning NaN/Inf values from feature matrix..."}), flush=True)
                X_train = np.nan_to_num(X_train, nan=0.0, posinf=1.0, neginf=-1.0)
            
            if np.any(np.isnan(y_train)) or np.any(np.isinf(y_train)):
                print(json.dumps({"type": "log", "message": "Cleaning NaN/Inf values from labels..."}), flush=True)
                y_train = np.nan_to_num(y_train, nan=0.0, posinf=0.0, neginf=0.0)


    if X_train is None:
        X_train, y_train = generate_synthetic_data(task, n_samples=2000)
        print(json.dumps({"type": "log", "message": f"Using synthetic cyber-traffic data: {X_train.shape}"}), flush=True)

    if X_val is None:
        split = int(0.8 * len(X_train))
        X_val   = X_train[split:]
        y_val   = y_train[split:]
        X_train = X_train[:split]
        y_train = y_train[:split]

    
    print(json.dumps({"type": "log", "message": "Applying StandardScaler feature normalization..."}), flush=True)
    mean  = np.mean(X_train, axis=0)
    std   = np.std(X_train,  axis=0) + 1e-8
    X_train = (X_train - mean) / std
    X_val   = (X_val   - mean) / std

    model_type = config.get("model_type", "neural_network")
    epochs     = config.get("epochs",       100)
    lr         = config.get("learning_rate", 0.001)
    batch_size = config.get("batch_size",    32)
    optimizer  = config.get("optimizer",    "AdamW").lower()

    outputs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "outputs")
    os.makedirs(outputs_dir, exist_ok=True)

    if model_type == "linear_regression":
        model = LinearRegression(learning_rate=lr, epochs=epochs, batch_size=batch_size)
    else:
        layers      = config.get("layers",      [X_train.shape[1], 128, 64, 32, 1])
        activations = config.get("activations", [])

        if layers[0] != X_train.shape[1]:
            # Overwrite instead of prepend if dimensions are mismatched
            # This ensures consistency with the frontend which expects the architect's layers[0] to be input
            layers[0] = X_train.shape[1]

        if task == "classification":
            n_classes = len(np.unique(y_train))
            if layers[-1] == 1 and n_classes == 2:
                pass
            elif layers[-1] != n_classes:
                layers[-1] = n_classes

        model = NeuralNetwork(
            layers=layers,
            learning_rate=lr,
            epochs=epochs,
            batch_size=batch_size,
            task=task,
            optimizer=optimizer,
            activations=activations,
            dropout_rate=config.get("dropout_rate", 0.0),
            use_batch_norm=config.get("use_batch_norm", False),
            gradient_clip=config.get("gradient_clip", 5.0),
            label_smoothing=config.get("label_smoothing", 0.0),
            weight_decay=config.get("weight_decay", 1e-4),
            patience=config.get("patience", 15),
            early_stopping=config.get("early_stopping", True),
            lr_schedule=config.get("lr_schedule", "cosine"),
            warmup_epochs=config.get("warmup_epochs", 5),
        )

    train_loss, val_loss = model.fit(X_train, y_train, X_val, y_val)

    model_path = os.path.join(outputs_dir, f"model_{os.getpid()}.npz")
    if model_type == "neural_network":
        save_dict = {}
        for i, (w, b) in enumerate(zip(model.weights, model.biases)):
            save_dict[f"weight_{i}"] = w
            save_dict[f"bias_{i}"]   = b
        np.savez(model_path, **save_dict)
    elif model_type == "linear_regression":
        np.savez(model_path, weights=model.weights, bias=model.bias)
    else:
        model_path = None

    print(json.dumps({
        "type":            "training_complete",
        "final_train_loss": float(train_loss),
        "final_val_loss":   float(val_loss),
        "model_path":       model_path,
        "ensemble_size":    len(model._ensemble) if hasattr(model, "_ensemble") else 0,
        "config":           config,
    }), flush=True)

if __name__ == "__main__":
    main()

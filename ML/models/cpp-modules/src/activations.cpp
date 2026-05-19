#include "activations.h"
#include <cmath>

namespace cyberhex {

// ============================================================================
// Numerical helpers
// ============================================================================
static inline double stable_sigmoid(double x) {
    if (x >= 0) {
        return 1.0 / (1.0 + std::exp(-x));
    } else {
        double e = std::exp(x);
        return e / (1.0 + e);
    }
}

static inline double stable_sigmoid_deriv(double x) {
    // x here is sigmoid output
    return x * (1.0 - x);
}

// ============================================================================
// ReLU
// ============================================================================
Matrix<double> ReLU::forward(const Matrix<double>& X) {
    input = X;
    Matrix<double> out(X.rows(), X.cols());
    for (size_t i = 0; i < X.size(); i++) {
        out.at(i) = X.at(i) > 0 ? X.at(i) : 0.0;
    }
    return out;
}

Matrix<double> ReLU::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        res.at(i) = input.at(i) > 0 ? grad.at(i) : 0.0;
    }
    return res;
}

// ============================================================================
// Sigmoid (numerically stable)
// ============================================================================
Matrix<double> Sigmoid::forward(const Matrix<double>& X) {
    output = Matrix<double>(X.rows(), X.cols());
    for (size_t i = 0; i < X.size(); i++) {
        output.at(i) = stable_sigmoid(X.at(i));
    }
    return output;
}

Matrix<double> Sigmoid::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        double s = output.at(i);
        res.at(i) = grad.at(i) * s * (1.0 - s);
    }
    return res;
}

// ============================================================================
// Softmax (numerically stable — subtracts max per row)
// ============================================================================
Matrix<double> Softmax::forward(const Matrix<double>& X) {
    output = Matrix<double>(X.rows(), X.cols());

    #pragma omp parallel for if(X.rows() > 100)
    for (size_t i = 0; i < X.rows(); i++) {
        // Find max for numerical stability
        double maxVal = X(i, 0);
        for (size_t j = 1; j < X.cols(); j++) {
            if (X(i, j) > maxVal) maxVal = X(i, j);
        }

        // Compute exp(x - max) and sum
        double sum = 0.0;
        for (size_t j = 0; j < X.cols(); j++) {
            double v = std::exp(X(i, j) - maxVal);
            output(i, j) = v;
            sum += v;
        }

        // Normalize
        double inv_sum = 1.0 / sum;
        for (size_t j = 0; j < X.cols(); j++) {
            output(i, j) *= inv_sum;
        }
    }

    return output;
}

Matrix<double> Softmax::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    // Optimized O(n) per row: grad_input = s ⊙ (grad - (grad · s))
    // instead of O(n²) Jacobian: J = diag(s) - s s^T
    Matrix<double> res(grad.rows(), grad.cols(), 0.0);

    #pragma omp parallel for if(grad.rows() > 100)
    for (size_t i = 0; i < grad.rows(); i++) {
        // Compute dot product: sum_k(grad(i,k) * softmax(i,k))
        double dot = 0.0;
        for (size_t k = 0; k < grad.cols(); k++) {
            dot += grad(i, k) * output(i, k);
        }

        // Compute each output element: s_j * (grad_ij - dot)
        for (size_t j = 0; j < grad.cols(); j++) {
            res(i, j) = output(i, j) * (grad(i, j) - dot);
        }
    }
    return res;
}

Matrix<double> Softmax::log_softmax() const {
    // log(softmax(x)) = x - max(x) - log(sum(exp(x - max(x))))
    Matrix<double> result = output;
    for (size_t i = 0; i < result.rows(); i++) {
        double maxVal = output(i, 0);
        for (size_t j = 1; j < output.cols(); j++) {
            if (output(i, j) > maxVal) maxVal = output(i, j);
        }
        double sum = 0.0;
        for (size_t j = 0; j < output.cols(); j++) {
            sum += output(i, j);
        }
        // result(i, j) = log(softmax) = log(p_j)
        // We stored probabilities in output, so log(p_j) = log(output(i,j))
        for (size_t j = 0; j < output.cols(); j++) {
            result(i, j) = std::log(std::max(output(i, j), 1e-15));
        }
    }
    return result;
}

// ============================================================================
// Tanh
// ============================================================================
Matrix<double> Tanh::forward(const Matrix<double>& X) {
    output = Matrix<double>(X.rows(), X.cols());
    for (size_t i = 0; i < X.size(); i++) {
        output.at(i) = std::tanh(X.at(i));
    }
    return output;
}

Matrix<double> Tanh::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int timestep) {
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        double tanh_val = output.at(i);
        res.at(i) = grad.at(i) * (1.0 - tanh_val * tanh_val);
    }
    return res;
}

// ============================================================================
// Leaky ReLU
// ============================================================================
LeakyReLU::LeakyReLU(double alpha) : alpha_(alpha) {}

Matrix<double> LeakyReLU::forward(const Matrix<double>& X) {
    output = Matrix<double>(X.rows(), X.cols());
    for (size_t i = 0; i < X.size(); i++) {
        output.at(i) = X.at(i) > 0 ? X.at(i) : alpha_ * X.at(i);
    }
    return output;
}

Matrix<double> LeakyReLU::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        res.at(i) = output.at(i) > 0 ? grad.at(i) : alpha_ * grad.at(i);
    }
    return res;
}

// ============================================================================
// ELU
// ============================================================================
ELU::ELU(double alpha) : alpha_(alpha) {}

Matrix<double> ELU::forward(const Matrix<double>& X) {
    output = Matrix<double>(X.rows(), X.cols());
    for (size_t i = 0; i < X.size(); i++) {
        if (X.at(i) > 0) {
            output.at(i) = X.at(i);
        } else {
            output.at(i) = alpha_ * (std::exp(X.at(i)) - 1.0);
        }
    }
    return output;
}

Matrix<double> ELU::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        if (output.at(i) > 0) {
            res.at(i) = grad.at(i);
        } else {
            res.at(i) = grad.at(i) * (output.at(i) + alpha_);
        }
    }
    return res;
}

// ============================================================================
// Swish (SiLU) = x * sigmoid(x)
// Numerically stable: clips x for large negative values
// Swish'(x) = sigmoid(x) + swish(x) * (1 - sigmoid(x))
// ============================================================================
Matrix<double> Swish::forward(const Matrix<double>& X) {
    output = Matrix<double>(X.rows(), X.cols());
    input_sigmoid_ = Matrix<double>(X.rows(), X.cols());
    for (size_t i = 0; i < X.size(); i++) {
        double x = X.at(i);
        // Numerical guard: for x < -88, sigmoid(x) underflows to 0
        // Swish(x) = x * sigmoid(x) → 0 for x → -inf (correct behavior)
        // For x > 88, sigmoid(x) ≈ 1, Swish(x) ≈ x (correct behavior)
        double s = stable_sigmoid(x);
        input_sigmoid_.at(i) = s;
        output.at(i) = x * s;
    }
    return output;
}

Matrix<double> Swish::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        double sigma = input_sigmoid_.at(i);
        double swish_val = output.at(i);
        // Swish derivative: sigma(x) + swish(x) * (1 - sigma(x))
        double deriv = sigma + swish_val * (1.0 - sigma);
        res.at(i) = grad.at(i) * deriv;
    }
    return res;
}

// ============================================================================
// GELU
// ============================================================================
Matrix<double> GELU::forward(const Matrix<double>& X) {
    input = X;
    Matrix<double> out(X.rows(), X.cols());
    for (size_t i = 0; i < X.size(); i++) {
        double x = X.at(i);
        // GELU approximation: 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
        double c = std::sqrt(2.0 / M_PI) * (x + 0.044715 * x * x * x);
        out.at(i) = 0.5 * x * (1.0 + std::tanh(c));
    }
    return out;
}

Matrix<double> GELU::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        double x = input.at(i);
        double c = std::sqrt(2.0 / M_PI) * (x + 0.044715 * x * x * x);
        double tanh_c = std::tanh(c);
        double sech2_c = 1.0 - tanh_c * tanh_c;
        double dgelu = 0.5 * (1.0 + tanh_c) +
                       0.5 * x * sech2_c * std::sqrt(2.0 / M_PI) *
                       (1.0 + 3.0 * 0.044715 * x * x);
        res.at(i) = grad.at(i) * dgelu;
    }
    return res;
}

// ============================================================================
// Softplus
// ============================================================================
Matrix<double> Softplus::forward(const Matrix<double>& X) {
    input = X;
    Matrix<double> out(X.rows(), X.cols());
    for (size_t i = 0; i < X.size(); i++) {
        // log1p(exp(x)) is more stable for small x
        if (X.at(i) > 20.0) {
            out.at(i) = X.at(i); // linear for large x
        } else {
            out.at(i) = std::log1p(std::exp(X.at(i)));
        }
    }
    return out;
}

Matrix<double> Softplus::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        // derivative = sigmoid(x)
        res.at(i) = grad.at(i) * stable_sigmoid(input.at(i));
    }
    return res;
}

// ============================================================================
// Identity
// ============================================================================
Matrix<double> Identity::forward(const Matrix<double>& X) {
    return X;
}

Matrix<double> Identity::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    return grad;
}

// ============================================================================
// Dropout
// ============================================================================
Dropout::Dropout(double rate) : rate_(rate) {}

Matrix<double> Dropout::forward(const Matrix<double>& X) {
    if (!training_) return X;

    mask = Matrix<double>(X.rows(), X.cols(), 0.0);
    Matrix<double> output(X.rows(), X.cols());

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<double> dis(0.0, 1.0);
    double scale = 1.0 / (1.0 - rate_);

    for (size_t i = 0; i < X.size(); i++) {
        if (dis(gen) > rate_) {
            mask.at(i) = scale;
            output.at(i) = X.at(i) * scale;
        } else {
            mask.at(i) = 0.0;
            output.at(i) = 0.0;
        }
    }
    return output;
}

Matrix<double> Dropout::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    if (!training_) return grad;
    Matrix<double> res(grad.rows(), grad.cols());
    for (size_t i = 0; i < grad.size(); i++) {
        res.at(i) = grad.at(i) * mask.at(i);
    }
    return res;
}

// ============================================================================
// Layer Normalization
// ============================================================================
LayerNormalization::LayerNormalization(size_t normalized_shape, double epsilon)
    : gamma(1, normalized_shape, 1.0), beta(1, normalized_shape, 0.0), epsilon_(epsilon) {}

void LayerNormalization::reset_state() {
    gamma.fill(1.0);
    beta.fill(0.0);
}

Matrix<double> LayerNormalization::forward(const Matrix<double>& X) {
    input_cache = X;
    const size_t rows = X.rows();
    const size_t cols = X.cols();
    mean_cache = Matrix<double>(rows, 1, 0.0);
    inv_std_cache = Matrix<double>(rows, 1, 0.0);
    Matrix<double> output(rows, cols);

    for (size_t i = 0; i < rows; i++) {
        double mean = 0.0;
        for (size_t j = 0; j < cols; j++) mean += X(i, j);
        mean /= static_cast<double>(cols);
        mean_cache(i, 0) = mean;

        double var = 0.0;
        for (size_t j = 0; j < cols; j++) {
            double d = X(i, j) - mean;
            var += d * d;
        }
        var /= static_cast<double>(cols);
        double inv_std = 1.0 / std::sqrt(var + epsilon_);
        inv_std_cache(i, 0) = inv_std;

        for (size_t j = 0; j < cols; j++) {
            double x_hat = (X(i, j) - mean) * inv_std;
            output(i, j) = gamma(0, j) * x_hat + beta(0, j);
        }
    }
    return output;
}

Matrix<double> LayerNormalization::backward(const Matrix<double>& grad, double lr,
                                            OptimizerType opt, int t) {
    const size_t rows = grad.rows();
    const size_t cols = grad.cols();
    Matrix<double> input_grad(rows, cols, 0.0);
    Matrix<double> d_gamma(1, cols, 0.0);
    Matrix<double> d_beta(1, cols, 0.0);

    for (size_t i = 0; i < rows; i++) {
        double mean = mean_cache(i, 0);
        double inv_std = inv_std_cache(i, 0);
        const double D = static_cast<double>(cols);

        Matrix<double> dx_hat(1, cols);
        for (size_t j = 0; j < cols; j++) {
            double x_hat = (input_cache(i, j) - mean) * inv_std;
            d_gamma(0, j) += grad(i, j) * x_hat;
            d_beta(0, j) += grad(i, j);
            dx_hat(0, j) = grad(i, j) * gamma(0, j);
        }

        double dvar = 0.0;
        for (size_t j = 0; j < cols; j++) {
            dvar += dx_hat(0, j) * (input_cache(i, j) - mean);
        }
        dvar *= -0.5 * std::pow(inv_std, 3.0);

        double dmean = 0.0;
        for (size_t j = 0; j < cols; j++) {
            dmean += dx_hat(0, j) * (-inv_std);
        }
        dmean += dvar * (-2.0 * mean / D);

        for (size_t j = 0; j < cols; j++) {
            double dx = dx_hat(0, j) * inv_std;
            dx += dvar * 2.0 * (input_cache(i, j) - mean) / D;
            dx += dmean / D;
            input_grad(i, j) = dx;
        }
    }

    if (lr > 0.0) {
        gamma = gamma - d_gamma * lr;
        beta = beta - d_beta * lr;
        (void)opt;
        (void)t;
    }
    return input_grad;
}

// ============================================================================
// Batch Normalization
// ============================================================================
BatchNormalization::BatchNormalization(size_t input_size, double epsilon, double momentum)
    : gamma(1, input_size, 1.0), beta(1, input_size, 0.0),
      running_mean(1, input_size, 0.0), running_var(1, input_size, 1.0),
      epsilon_(epsilon), momentum_(momentum) {}

void BatchNormalization::reset_state() {
    gamma.fill(1.0);
    beta.fill(0.0);
    running_mean.fill(0.0);
    running_var.fill(1.0);
}

Matrix<double> BatchNormalization::forward(const Matrix<double>& X) {
    input_cache = X;
    Matrix<double> output(X.rows(), X.cols(), 0.0);

    if (training_) {
        // Compute batch mean and variance
        for (size_t j = 0; j < X.cols(); j++) {
            double mean = 0.0;
            for (size_t i = 0; i < X.rows(); i++) {
                mean += X(i, j);
            }
            mean /= X.rows();

            double var = 0.0;
            for (size_t i = 0; i < X.rows(); i++) {
                double diff = X(i, j) - mean;
                var += diff * diff;
            }
            var /= X.rows();

            // Update running statistics
            running_mean(0, j) = momentum_ * running_mean(0, j) + (1.0 - momentum_) * mean;
            running_var(0, j) = momentum_ * running_var(0, j) + (1.0 - momentum_) * var;

            // Normalize
            ivar(0, j) = 1.0 / std::sqrt(var + epsilon_);
            for (size_t i = 0; i < X.rows(); i++) {
                x_hat(i, j) = (X(i, j) - mean) * ivar(0, j);
                output(i, j) = gamma(0, j) * x_hat(i, j) + beta(0, j);
            }
        }
    } else {
        // Inference mode: use running statistics
        for (size_t j = 0; j < X.cols(); j++) {
            double inv_std = 1.0 / std::sqrt(running_var(0, j) + epsilon_);
            for (size_t i = 0; i < X.rows(); i++) {
                double normalized = (X(i, j) - running_mean(0, j)) * inv_std;
                output(i, j) = gamma(0, j) * normalized + beta(0, j);
            }
        }
    }

    return output;
}

Matrix<double> BatchNormalization::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> dX(grad.rows(), grad.cols(), 0.0);
    size_t N = grad.rows();

    for (size_t j = 0; j < grad.cols(); j++) {
        double dGamma = 0.0, dBeta = 0.0;
        for (size_t i = 0; i < N; i++) {
            dGamma += grad(i, j) * x_hat(i, j);
            dBeta += grad(i, j);
        }

        // Simple SGD update for gamma/beta (user's responsibility to pass correct lr)
        gamma(0, j) -= lr * dGamma / N;
        beta(0, j) -= lr * dBeta / N;

        // Gradient w.r.t. input
        double dxhat_sum = 0.0, dxhat_xhat_sum = 0.0;
        for (size_t i = 0; i < N; i++) {
            double dxhat = grad(i, j) * gamma(0, j);
            dxhat_sum += dxhat;
            dxhat_xhat_sum += dxhat * x_hat(i, j);
        }

        for (size_t i = 0; i < N; i++) {
            double dxhat = grad(i, j) * gamma(0, j);
            dX(i, j) = (1.0 / N) * ivar(0, j) * (
                N * dxhat - dxhat_sum - x_hat(i, j) * dxhat_xhat_sum
            );
        }
    }

    return dX;
}

} // namespace cyberhex
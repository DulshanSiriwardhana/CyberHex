#include "dense.h"
#include <cmath>
#include <iostream>
#include <fstream>
#include <random>

namespace cyberhex {

Dense::Dense(size_t in_features, size_t out_features, InitType init_type)
    : in_features_(in_features), out_features_(out_features),
      weights(in_features, out_features, 0.0), bias(1, out_features, 0.0),
      m_W(in_features, out_features, 0.0), v_W(in_features, out_features, 0.0),
      m_B(1, out_features, 0.0), v_B(1, out_features, 0.0)
{
    initialize(init_type);
}

void Dense::initialize(InitType type) {
    std::random_device rd;
    std::mt19937 gen(rd());

    double variance = 0.0;
    double fan_in = static_cast<double>(in_features_);
    double fan_out = static_cast<double>(out_features_);

    switch (type) {
        case InitType::HE:
            variance = 2.0 / fan_in;
            break;
        case InitType::XAVIER:
            variance = 2.0 / (fan_in + fan_out);
            break;
        case InitType::LECUN_NORMAL:
            variance = 1.0 / fan_in;
            break;
        case InitType::HE_UNIFORM:
            variance = 2.0 / fan_in;
            {
                double limit = std::sqrt(3.0 * variance);
                std::uniform_real_distribution<double> dist(-limit, limit);
                for (size_t i = 0; i < weights.size(); i++)
                    weights.at(i) = dist(gen);
                return;
            }
        case InitType::XAVIER_UNIFORM:
            variance = 6.0 / (fan_in + fan_out);
            {
                double limit = std::sqrt(variance);
                std::uniform_real_distribution<double> dist(-limit, limit);
                for (size_t i = 0; i < weights.size(); i++)
                    weights.at(i) = dist(gen);
                return;
            }
        case InitType::ORTHOGONAL:
            // Simplified: use normal then QR
            variance = 1.0;
            break;
    }

    // Normal initialization
    std::normal_distribution<double> dist(0.0, std::sqrt(variance));
    for (size_t i = 0; i < weights.size(); i++)
        weights.at(i) = dist(gen);
}

Matrix<double> Dense::forward(const Matrix<double>& X) {
    input = X;

    // y = X · W + bias
    Matrix<double> out = X.dot(weights);

    // Broadcast bias
    for (size_t i = 0; i < out.rows(); i++) {
        for (size_t j = 0; j < out.cols(); j++) {
            out(i, j) += bias(0, j);
        }
    }

    return out;
}

std::vector<Matrix<double>*> Dense::parameter_gradients() {
    // Weight gradient = input^T · grad
    // Bias gradient = sum(grad, axis=0)
    // These are computed in backward() and stored; for checkpointing we return empty
    return {};
}

Matrix<double> Dense::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    // dW = input^T · grad
    Matrix<double> dW = input.transpose().dot(grad);

    // dB = sum(grad, axis=0)
    Matrix<double> dB(1, grad.cols(), 0.0);
    for (size_t j = 0; j < grad.cols(); j++) {
        for (size_t i = 0; i < grad.rows(); i++) {
            dB(0, j) += grad(i, j);
        }
    }

    // Add regularization gradients
    if (l1_lambda_ > 0.0 || l2_lambda_ > 0.0) {
        for (size_t i = 0; i < weights.size(); i++) {
            double w = weights.at(i);
            if (l1_lambda_ > 0.0) {
                dW.at(i) += l1_lambda_ * (w > 0 ? 1.0 : (w < 0 ? -1.0 : 0.0));
            }
            if (l2_lambda_ > 0.0) {
                dW.at(i) += l2_lambda_ * w;
            }
        }
    }

    // Updates based on optimizer type
    if (opt == OptimizerType::SGD) {
        weights = weights - dW * lr;
        bias = bias - dB * lr;
    }
    else if (opt == OptimizerType::MOMENTUM || opt == OptimizerType::NESTEROV) {
        double beta = 0.9;
        m_W = m_W * beta + dW * (1.0 - beta);
        m_B = m_B * beta + dB * (1.0 - beta);

        if (opt == OptimizerType::NESTEROV) {
            weights = weights - m_W * lr * beta - dW * lr * (1.0 - beta);
            bias = bias - m_B * lr * beta - dB * lr * (1.0 - beta);
        } else {
            weights = weights - m_W * lr;
            bias = bias - m_B * lr;
        }
    }
    else if (opt == OptimizerType::RMSPROP) {
        double beta = 0.999;
        double epsilon = 1e-8;

        for (size_t i = 0; i < weights.size(); i++) {
            v_W.at(i) = beta * v_W.at(i) + (1.0 - beta) * dW.at(i) * dW.at(i);
            weights.at(i) -= lr * dW.at(i) / (std::sqrt(v_W.at(i)) + epsilon);
        }
        for (size_t j = 0; j < bias.cols(); j++) {
            v_B(0, j) = beta * v_B(0, j) + (1.0 - beta) * dB(0, j) * dB(0, j);
            bias(0, j) -= lr * dB(0, j) / (std::sqrt(v_B(0, j)) + epsilon);
        }
    }
    else if (opt == OptimizerType::ADAM || opt == OptimizerType::ADAMW || opt == OptimizerType::NADAM) {
        double beta1 = 0.9;
        double beta2 = 0.999;
        double epsilon = 1e-8;
        // AdamW uses separate weight decay (hardcoded as 0.01 here)
        const double adamw_decay = 0.01;

        for (size_t i = 0; i < weights.size(); i++) {
            m_W.at(i) = beta1 * m_W.at(i) + (1.0 - beta1) * dW.at(i);
            v_W.at(i) = beta2 * v_W.at(i) + (1.0 - beta2) * dW.at(i) * dW.at(i);

            double m_hat = m_W.at(i) / (1.0 - std::pow(beta1, t));
            double v_hat = v_W.at(i) / (1.0 - std::pow(beta2, t));

            if (opt == OptimizerType::NADAM) {
                // Nadam: Nesterov-accelerated Adam
                double m_bar = m_W.at(i) * beta1 / (1.0 - std::pow(beta1, t)) +
                               (1.0 - beta1) * dW.at(i) / (1.0 - std::pow(beta1, t));
                weights.at(i) -= lr * m_bar / (std::sqrt(v_hat) + epsilon);
            } else if (opt == OptimizerType::ADAMW) {
                // AdamW: decoupled weight decay
                weights.at(i) -= lr * (m_hat / (std::sqrt(v_hat) + epsilon) + adamw_decay * weights.at(i));
            } else {
                weights.at(i) -= lr * m_hat / (std::sqrt(v_hat) + epsilon);
            }
        }

        for (size_t j = 0; j < bias.cols(); j++) {
            m_B(0, j) = beta1 * m_B(0, j) + (1.0 - beta1) * dB(0, j);
            v_B(0, j) = beta2 * v_B(0, j) + (1.0 - beta2) * dB(0, j) * dB(0, j);

            double m_hat = m_B(0, j) / (1.0 - std::pow(beta1, t));
            double v_hat = v_B(0, j) / (1.0 - std::pow(beta2, t));
            bias(0, j) -= lr * m_hat / (std::sqrt(v_hat) + epsilon);
        }
    }

    // Max norm constraint
    if (max_norm_ > 0.0) {
        for (size_t j = 0; j < weights.cols(); j++) {
            double col_norm = 0.0;
            for (size_t i = 0; i < weights.rows(); i++) {
                col_norm += weights(i, j) * weights(i, j);
            }
            col_norm = std::sqrt(col_norm);
            if (col_norm > max_norm_) {
                double scale = max_norm_ / col_norm;
                for (size_t i = 0; i < weights.rows(); i++) {
                    weights(i, j) *= scale;
                }
            }
        }
    }

    // Gradient w.r.t. input: grad · W^T
    Matrix<double> grad_input = grad.dot(weights.transpose());

    return grad_input;
}

void Dense::reset_state() {
    m_W.fill(0.0);
    v_W.fill(0.0);
    m_B.fill(0.0);
    v_B.fill(0.0);
}

void Dense::save(std::ofstream& file) const {
    // Write dimensions
    size_t rows = weights.rows(), cols = weights.cols();
    file.write(reinterpret_cast<const char*>(&rows), sizeof(size_t));
    file.write(reinterpret_cast<const char*>(&cols), sizeof(size_t));
    file.write(reinterpret_cast<const char*>(weights.data()), weights.size() * sizeof(double));

    rows = bias.rows(); cols = bias.cols();
    file.write(reinterpret_cast<const char*>(&rows), sizeof(size_t));
    file.write(reinterpret_cast<const char*>(&cols), sizeof(size_t));
    file.write(reinterpret_cast<const char*>(bias.data()), bias.size() * sizeof(double));
}

Dense Dense::load(std::ifstream& file) {
    size_t w_rows, w_cols, b_rows, b_cols;

    file.read(reinterpret_cast<char*>(&w_rows), sizeof(size_t));
    file.read(reinterpret_cast<char*>(&w_cols), sizeof(size_t));
    Matrix<double> W(w_rows, w_cols);
    file.read(reinterpret_cast<char*>(W.data()), W.size() * sizeof(double));

    file.read(reinterpret_cast<char*>(&b_rows), sizeof(size_t));
    file.read(reinterpret_cast<char*>(&b_cols), sizeof(size_t));
    Matrix<double> B(b_rows, b_cols);
    file.read(reinterpret_cast<char*>(B.data()), B.size() * sizeof(double));

    Dense layer(w_rows, w_cols);
    layer.weights = std::move(W);
    layer.bias = std::move(B);
    return layer;
}

} // namespace cyberhex
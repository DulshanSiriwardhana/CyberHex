#include "transformer.h"
#include "activations.h"
#include "ops_dispatch.h"
#include "device.h"
#include <cmath>
#include <algorithm>
#include <random>
#include <stdexcept>

namespace cyberhex {

namespace {

void softmax_inplace(std::vector<double>& v) {
    if (v.empty()) return;
    double maxv = *std::max_element(v.begin(), v.end());
    double sum = 0.0;
    for (double& x : v) {
        x = std::exp(x - maxv);
        sum += x;
    }
    if (sum > 0.0) {
        for (double& x : v) x /= sum;
    }
}

void he_matrix(Matrix<double>& W) {
    double stddev = std::sqrt(2.0 / static_cast<double>(W.rows()));
    std::mt19937 gen(7);
    std::normal_distribution<double> dist(0.0, stddev);
    for (size_t i = 0; i < W.size(); i++) W.at(i) = dist(gen);
}

} // namespace

MultiHeadSelfAttention::MultiHeadSelfAttention(size_t d_model, size_t num_heads)
    : d_model_(d_model), num_heads_(num_heads) {
    if (d_model == 0 || num_heads == 0 || d_model % num_heads != 0) {
        throw std::invalid_argument("d_model must be divisible by num_heads");
    }
    head_dim_ = d_model / num_heads;
    W_q_ = Matrix<double>(d_model, d_model, 0.0);
    W_k_ = Matrix<double>(d_model, d_model, 0.0);
    W_v_ = Matrix<double>(d_model, d_model, 0.0);
    W_o_ = Matrix<double>(d_model, d_model, 0.0);
    dW_q_ = Matrix<double>(d_model, d_model, 0.0);
    dW_k_ = Matrix<double>(d_model, d_model, 0.0);
    dW_v_ = Matrix<double>(d_model, d_model, 0.0);
    dW_o_ = Matrix<double>(d_model, d_model, 0.0);
    he_matrix(W_q_);
    he_matrix(W_k_);
    he_matrix(W_v_);
    he_matrix(W_o_);
}

Matrix<double> MultiHeadSelfAttention::forward(const Matrix<double>& X) {
    input_ = X;
    const Device dev = default_device();
    Matrix<double> Q = dispatch_matmul(dev, X, W_q_);
    Matrix<double> K = dispatch_matmul(dev, X, W_k_);
    Matrix<double> V = dispatch_matmul(dev, X, W_v_);

    const size_t rows = X.rows();
    Matrix<double> head_out(rows, d_model_, 0.0);

    for (size_t i = 0; i < rows; i++) {
        for (size_t h = 0; h < num_heads_; h++) {
            const size_t off = h * head_dim_;
            std::vector<double> scores(rows, 0.0);
            for (size_t j = 0; j < rows; j++) {
                double dot = 0.0;
                for (size_t d = 0; d < head_dim_; d++) {
                    dot += Q(i, off + d) * K(j, off + d);
                }
                scores[j] = dot / std::sqrt(static_cast<double>(head_dim_));
            }
            softmax_inplace(scores);

            for (size_t d = 0; d < head_dim_; d++) {
                double acc = 0.0;
                for (size_t j = 0; j < rows; j++) {
                    acc += scores[j] * V(j, off + d);
                }
                head_out(i, off + d) = acc;
            }
        }
    }

    context_ = head_out;
    return dispatch_matmul(dev, head_out, W_o_);
}

Matrix<double> MultiHeadSelfAttention::backward(const Matrix<double>& grad) {
    const Device dev = default_device();
    const size_t rows = input_.rows();

    // 1. dW_o = context_.transpose() * grad
    dW_o_ = dispatch_matmul(dev, context_.transpose(), grad);

    // 2. dC = grad * W_o_.transpose()
    Matrix<double> dC = dispatch_matmul(dev, grad, W_o_.transpose());

    // 3. Setup gradients for input components
    Matrix<double> dQ(rows, d_model_, 0.0);
    Matrix<double> dK(rows, d_model_, 0.0);
    Matrix<double> dV(rows, d_model_, 0.0);

    // Recompute Q, K, V from forward pass inputs
    Matrix<double> Q = dispatch_matmul(dev, input_, W_q_);
    Matrix<double> K = dispatch_matmul(dev, input_, W_k_);
    Matrix<double> V = dispatch_matmul(dev, input_, W_v_);

    // Backprop through self attention scores
    for (size_t i = 0; i < rows; i++) {
        for (size_t h = 0; h < num_heads_; h++) {
            const size_t off = h * head_dim_;

            // Recompute attention scores for head h, row i
            std::vector<double> scores(rows, 0.0);
            for (size_t j = 0; j < rows; j++) {
                double dot = 0.0;
                for (size_t d = 0; d < head_dim_; d++) {
                    dot += Q(i, off + d) * K(j, off + d);
                }
                scores[j] = dot / std::sqrt(static_cast<double>(head_dim_));
            }
            softmax_inplace(scores);

            // Compute dA and dV for head h
            // dA(i, j) = sum_{d} dC(i, off + d) * V(j, off + d)
            std::vector<double> dA(rows, 0.0);
            for (size_t j = 0; j < rows; j++) {
                double dot_dA = 0.0;
                for (size_t d = 0; d < head_dim_; d++) {
                    dot_dA += dC(i, off + d) * V(j, off + d);
                }
                dA[j] = dot_dA;

                // dV(j, off + d) += scores[j] * dC(i, off + d)
                for (size_t d = 0; d < head_dim_; d++) {
                    dV(j, off + d) += scores[j] * dC(i, off + d);
                }
            }

            // Backprop through softmax:
            // dS(i, j) = scores[j] * (dA[j] - sum_{k} dA[k] * scores[k])
            double sum_dA_scores = 0.0;
            for (size_t k = 0; k < rows; k++) {
                sum_dA_scores += dA[k] * scores[k];
            }

            std::vector<double> dS(rows, 0.0);
            for (size_t j = 0; j < rows; j++) {
                dS[j] = scores[j] * (dA[j] - sum_dA_scores);
            }

            // Backprop through scaled dot product:
            // dS[j] / sqrt(head_dim_) is the gradient of Q(i, off+d)*K(j, off+d)
            double scale = 1.0 / std::sqrt(static_cast<double>(head_dim_));
            for (size_t j = 0; j < rows; j++) {
                double factor = dS[j] * scale;
                for (size_t d = 0; d < head_dim_; d++) {
                    dQ(i, off + d) += factor * K(j, off + d);
                    dK(j, off + d) += factor * Q(i, off + d);
                }
            }
        }
    }

    // 4. Compute weight gradients
    dW_q_ = dispatch_matmul(dev, input_.transpose(), dQ);
    dW_k_ = dispatch_matmul(dev, input_.transpose(), dK);
    dW_v_ = dispatch_matmul(dev, input_.transpose(), dV);

    // 5. Compute input gradient: dX = dQ * W_q^T + dK * W_k^T + dV * W_v^T
    Matrix<double> dX = dispatch_matmul(dev, dQ, W_q_.transpose());
    Matrix<double> dX_k = dispatch_matmul(dev, dK, W_k_.transpose());
    Matrix<double> dX_v = dispatch_matmul(dev, dV, W_v_.transpose());

    for (size_t i = 0; i < dX.size(); i++) {
        dX.at(i) += dX_k.at(i) + dX_v.at(i);
    }

    return dX;
}

std::vector<Matrix<double>*> MultiHeadSelfAttention::parameter_gradients() {
    return {&dW_q_, &dW_k_, &dW_v_, &dW_o_};
}

std::vector<Matrix<double>*> MultiHeadSelfAttention::parameters() {
    return {&W_q_, &W_k_, &W_v_, &W_o_};
}

std::vector<std::string> MultiHeadSelfAttention::parameter_names() {
    return {"W_q", "W_k", "W_v", "W_o"};
}

TransformerEncoderBlock::TransformerEncoderBlock(size_t d_model, size_t num_heads, size_t ffn_dim)
    : d_model_(d_model) {
    attention_ = std::make_unique<MultiHeadSelfAttention>(d_model, num_heads);
    norm1_ = std::make_unique<LayerNormalization>(d_model);
    norm2_ = std::make_unique<LayerNormalization>(d_model);
    W1_ = Matrix<double>(d_model, ffn_dim, 0.0);
    b1_ = Matrix<double>(1, ffn_dim, 0.0);
    W2_ = Matrix<double>(ffn_dim, d_model, 0.0);
    b2_ = Matrix<double>(1, d_model, 0.0);
    dW1_ = Matrix<double>(d_model, ffn_dim, 0.0);
    db1_ = Matrix<double>(1, ffn_dim, 0.0);
    dW2_ = Matrix<double>(ffn_dim, d_model, 0.0);
    db2_ = Matrix<double>(1, d_model, 0.0);
    he_matrix(W1_);
    he_matrix(W2_);
}

Matrix<double> TransformerEncoderBlock::forward(const Matrix<double>& X) {
    residual1_ = X;
    Matrix<double> attn = attention_->forward(X);
    Matrix<double> x1 = norm1_->forward(residual1_ + attn);
    residual2_ = x1;

    const Device dev = default_device();
    ffn_linear_ = dispatch_matmul(dev, x1, W1_);
    for (size_t i = 0; i < ffn_linear_.rows(); i++) {
        for (size_t j = 0; j < ffn_linear_.cols(); j++) {
            ffn_linear_(i, j) += b1_(0, j);
        }
    }

    ffn_hidden_ = Matrix<double>(ffn_linear_.rows(), ffn_linear_.cols());
    for (size_t i = 0; i < ffn_linear_.size(); i++) {
        double x = ffn_linear_.at(i);
        ffn_hidden_.at(i) = 0.5 * x * (1.0 + std::tanh(std::sqrt(2.0 / M_PI) * (x + 0.044715 * x * x * x)));
    }

    Matrix<double> ffn_out = dispatch_matmul(dev, ffn_hidden_, W2_);
    for (size_t i = 0; i < ffn_out.rows(); i++) {
        for (size_t j = 0; j < ffn_out.cols(); j++) {
            ffn_out(i, j) += b2_(0, j);
        }
    }
    return norm2_->forward(residual2_ + ffn_out);
}

Matrix<double> TransformerEncoderBlock::backward(const Matrix<double>& grad) {
    const Device dev = default_device();
    
    // 1. Backward through norm2
    Matrix<double> g2 = norm2_->backward(grad);

    // 2. Backward through ffn_out projection: ffn_out = ffn_hidden * W2 + b2
    // dW2 = ffn_hidden^T * g2
    dW2_ = dispatch_matmul(dev, ffn_hidden_.transpose(), g2);

    // db2 = sum(g2, axis=0)
    db2_.fill(0.0);
    for (size_t j = 0; j < g2.cols(); j++) {
        for (size_t i = 0; i < g2.rows(); i++) {
            db2_(0, j) += g2(i, j);
        }
    }

    // g_hidden = g2 * W2^T
    Matrix<double> g_hidden = dispatch_matmul(dev, g2, W2_.transpose());

    // 3. Backward through GELU activation
    Matrix<double> g_gelu(g_hidden.rows(), g_hidden.cols());
    for (size_t i = 0; i < g_hidden.size(); i++) {
        double x = ffn_linear_.at(i);
        double c = std::sqrt(2.0 / M_PI) * (x + 0.044715 * x * x * x);
        double tanh_c = std::tanh(c);
        double sech2_c = 1.0 - tanh_c * tanh_c;
        double dgelu = 0.5 * (1.0 + tanh_c) +
                       0.5 * x * sech2_c * std::sqrt(2.0 / M_PI) *
                       (1.0 + 3.0 * 0.044715 * x * x);
        g_gelu.at(i) = g_hidden.at(i) * dgelu;
    }

    // 4. Backward through ffn_linear projection: ffn_linear = x1 * W1 + b1
    // dW1 = x1^T * g_gelu (where x1 is residual2_)
    dW1_ = dispatch_matmul(dev, residual2_.transpose(), g_gelu);

    // db1 = sum(g_gelu, axis=0)
    db1_.fill(0.0);
    for (size_t j = 0; j < g_gelu.cols(); j++) {
        for (size_t i = 0; i < g_gelu.rows(); i++) {
            db1_(0, j) += g_gelu(i, j);
        }
    }

    // g_x1 = g_gelu * W1^T
    Matrix<double> g_x1 = dispatch_matmul(dev, g_gelu, W1_.transpose());

    // 5. Total gradient w.r.t x1 is g_x1 + g2 (direct residual path)
    Matrix<double> g_x1_total(g_x1.rows(), g_x1.cols());
    for (size_t i = 0; i < g_x1.size(); i++) {
        g_x1_total.at(i) = g_x1.at(i) + g2.at(i);
    }

    // 6. Backward through norm1
    Matrix<double> g_attn_path = norm1_->backward(g_x1_total);

    // 7. Backward through attention
    Matrix<double> g_attn_input = attention_->backward(g_attn_path);

    // 8. Total gradient w.r.t layer input is g_attn_input + g_attn_path (residual path)
    Matrix<double> g_input(g_attn_input.rows(), g_attn_input.cols());
    for (size_t i = 0; i < g_attn_input.size(); i++) {
        g_input.at(i) = g_attn_input.at(i) + g_attn_path.at(i);
    }

    return g_input;
}

std::vector<Matrix<double>*> TransformerEncoderBlock::parameter_gradients() {
    auto g = attention_->parameter_gradients();
    auto gn1 = norm1_->parameter_gradients();
    auto gn2 = norm2_->parameter_gradients();
    g.insert(g.end(), gn1.begin(), gn1.end());
    g.push_back(&dW1_);
    g.push_back(&db1_);
    g.push_back(&dW2_);
    g.push_back(&db2_);
    g.insert(g.end(), gn2.begin(), gn2.end());
    return g;
}

std::vector<Matrix<double>*> TransformerEncoderBlock::parameters() {
    auto p = attention_->parameters();
    auto n1 = norm1_->parameters();
    auto n2 = norm2_->parameters();
    p.insert(p.end(), n1.begin(), n1.end());
    p.push_back(&W1_);
    p.push_back(&b1_);
    p.push_back(&W2_);
    p.push_back(&b2_);
    p.insert(p.end(), n2.begin(), n2.end());
    return p;
}

std::vector<std::string> TransformerEncoderBlock::parameter_names() {
  std::vector<std::string> names = attention_->parameter_names();
  auto n1 = norm1_->parameter_names();
  names.insert(names.end(), n1.begin(), n1.end());
  names.push_back("W1");
  names.push_back("b1");
  names.push_back("W2");
  names.push_back("b2");
  auto n2 = norm2_->parameter_names();
  names.insert(names.end(), n2.begin(), n2.end());
  return names;
}

} // namespace cyberhex

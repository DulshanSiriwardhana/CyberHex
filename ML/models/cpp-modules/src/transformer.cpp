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

Matrix<double> MultiHeadSelfAttention::backward(const Matrix<double>& grad, double lr,
                                                OptimizerType opt, int t) {
    (void)lr;
    (void)opt;
    (void)t;
    const Device dev = default_device();
    Matrix<double> grad_context = dispatch_matmul(dev, grad, W_o_.transpose());
    return dispatch_matmul(dev, grad_context, W_q_.transpose());
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
    he_matrix(W1_);
    he_matrix(W2_);
}

Matrix<double> TransformerEncoderBlock::forward(const Matrix<double>& X) {
    residual1_ = X;
    Matrix<double> attn = attention_->forward(X);
    Matrix<double> x1 = norm1_->forward(residual1_ + attn);
    residual2_ = x1;

    const Device dev = default_device();
    ffn_hidden_ = dispatch_matmul(dev, x1, W1_);
    for (size_t i = 0; i < ffn_hidden_.rows(); i++) {
        for (size_t j = 0; j < ffn_hidden_.cols(); j++) {
            ffn_hidden_(i, j) += b1_(0, j);
            double x = ffn_hidden_(i, j);
            ffn_hidden_(i, j) = 0.5 * x * (1.0 + std::tanh(std::sqrt(2.0 / M_PI) * (x + 0.044715 * x * x * x)));
        }
    }
    Matrix<double> ffn_out = dispatch_matmul(dev, ffn_hidden_, W2_);
    for (size_t i = 0; i < ffn_out.rows(); i++) {
        for (size_t j = 0; j < ffn_out.cols(); j++) {
            ffn_out(i, j) += b2_(0, j);
        }
    }
    return norm2_->forward(residual2_ + ffn_out);
}

Matrix<double> TransformerEncoderBlock::backward(const Matrix<double>& grad, double lr,
                                                 OptimizerType opt, int t) {
    Matrix<double> g2 = norm2_->backward(grad, lr, opt, t);
    Matrix<double> g_ffn = g2;
    Matrix<double> g_hidden = dispatch_matmul(default_device(), g_ffn, W2_.transpose());
    Matrix<double> g_x1 = dispatch_matmul(default_device(), g_hidden, W1_.transpose());
    Matrix<double> g_attn_path = norm1_->backward(g_x1, lr, opt, t);
    return attention_->backward(g_attn_path, lr, opt, t);
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

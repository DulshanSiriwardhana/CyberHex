#include "dense.h"
#include <cmath>
#include <iostream>
#include <fstream>
#include <random>

namespace cyberhex {

Dense::Dense(size_t in_features, size_t out_features, InitType init_type)
    : in_features_(in_features), out_features_(out_features),
      weights(in_features, out_features, 0.0), bias(1, out_features, 0.0),
      dW(in_features, out_features, 0.0), dB(1, out_features, 0.0),
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

            variance = 1.0;
            break;
    }

    std::normal_distribution<double> dist(0.0, std::sqrt(variance));
    for (size_t i = 0; i < weights.size(); i++)
        weights.at(i) = dist(gen);
}

Matrix<double> Dense::forward(const Matrix<double>& X) {
    input = X;

    Matrix<double> out = X.dot(weights);

    for (size_t i = 0; i < out.rows(); i++) {
        for (size_t j = 0; j < out.cols(); j++) {
            out(i, j) += bias(0, j);
        }
    }

    return out;
}

std::vector<Matrix<double>*> Dense::parameter_gradients() {
    return {&dW, &dB};
}

Matrix<double> Dense::backward(const Matrix<double>& grad) {

    dW = input.transpose().dot(grad);

    dB.fill(0.0);
    for (size_t j = 0; j < grad.cols(); j++) {
        for (size_t i = 0; i < grad.rows(); i++) {
            dB(0, j) += grad(i, j);
        }
    }

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

    Matrix<double> grad_input = grad.dot(weights.transpose());

    return grad_input;
}

void Dense::set_parameters(Matrix<double> W, Matrix<double> B) {
    if (W.rows() != in_features_ || W.cols() != out_features_) {
        throw DimensionMismatchException("Dense::set_parameters weight shape mismatch");
    }
    if (B.rows() != 1 || B.cols() != out_features_) {
        throw DimensionMismatchException("Dense::set_parameters bias shape mismatch");
    }
    weights = std::move(W);
    bias = std::move(B);
}

void Dense::reset_state() {
    m_W.fill(0.0);
    v_W.fill(0.0);
    m_B.fill(0.0);
    v_B.fill(0.0);
}

void Dense::save(std::ofstream& file) const {

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

}

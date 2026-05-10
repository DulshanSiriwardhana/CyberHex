#include "dense.h"
#include <cmath>
#include <iostream>
#include <random>

const Matrix& Dense::getWeights() const {
    return weights;
}

const Matrix& Dense::getBias() const {
    return bias;
}

Dense::Dense(double in, double out, InitType init_type)
    : weights(in, out, 0.0), bias(1, out, 0.0),
      m_W(in, out, 0.0), v_W(in, out, 0.0),
      m_B(1, out, 0.0), v_B(1, out, 0.0) {

    std::random_device rd;
    std::mt19937 gen(rd());
    
    double variance = (init_type == InitType::HE) ? (2.0 / in) : (1.0 / in); // Xavier limit
    std::normal_distribution<double> d(0.0, std::sqrt(variance));

    for (size_t i = 0; i < in; i++)
        for (size_t j = 0; j < out; j++)
            weights.matrix[i][j] = d(gen);
}

Matrix Dense::forward(const Matrix& X) {
    input = X;
    Matrix out = X.dot(weights);

    for (int i = 0; i < out.rows; i++)
        for (int j = 0; j < out.cols; j++)
            out.matrix[i][j] += bias.matrix[0][j];

    return out;
}

Matrix Dense::backward(const Matrix& grad, double lr, OptimizerType opt, int t) {

    if (input.matrix.empty()) { std::cout << "input empty\n"; exit(1); }
    if (grad.matrix.empty()) { std::cout << "grad empty\n"; exit(1); }

    if (input.rows != grad.rows) {
        std::cout << "BATCH SIZE MISMATCH\n";
        exit(1);
    }

    Matrix dW = input.transpose().dot(grad);

    Matrix dB(1, grad.cols, 0.0);
    for (int j = 0; j < grad.cols; j++)
        for (int i = 0; i < grad.rows; i++)
            dB.matrix[0][j] += grad.matrix[i][j];

    if (grad.cols != weights.cols) {
        std::cout << "GRAD-WEIGHT DIM ERROR\n";
        exit(1);
    }

    Matrix grad_input = grad.dot(weights.transpose());


    if (opt == OptimizerType::SGD) {
        weights = weights - dW * lr;
        bias = bias - dB * lr;
    } else if (opt == OptimizerType::MOMENTUM) {
        double beta = 0.9;
        m_W = m_W * beta + dW * (1.0 - beta);
        m_B = m_B * beta + dB * (1.0 - beta);
        weights = weights - m_W * lr;
        bias = bias - m_B * lr;
    } else if (opt == OptimizerType::RMSPROP) {
        double beta = 0.999;
        double epsilon = 1e-8;
        
        // Elementwise operations would need an apply() or custom loop. We will just use a loop.
        for (size_t i=0; i<weights.rows; i++) {
            for(size_t j=0; j<weights.cols; j++){
                v_W.matrix[i][j] = beta * v_W.matrix[i][j] + (1 - beta) * dW.matrix[i][j] * dW.matrix[i][j];
                weights.matrix[i][j] -= lr * dW.matrix[i][j] / (std::sqrt(v_W.matrix[i][j]) + epsilon);
            }
        }
        for (size_t j=0; j<bias.cols; j++){
            v_B.matrix[0][j] = beta * v_B.matrix[0][j] + (1 - beta) * dB.matrix[0][j] * dB.matrix[0][j];
            bias.matrix[0][j] -= lr * dB.matrix[0][j] / (std::sqrt(v_B.matrix[0][j]) + epsilon);
        }
    } else if (opt == OptimizerType::ADAM) {
        double beta1 = 0.9;
        double beta2 = 0.999;
        double epsilon = 1e-8;
        
        for (size_t i=0; i<weights.rows; i++) {
            for(size_t j=0; j<weights.cols; j++){
                m_W.matrix[i][j] = beta1 * m_W.matrix[i][j] + (1 - beta1) * dW.matrix[i][j];
                v_W.matrix[i][j] = beta2 * v_W.matrix[i][j] + (1 - beta2) * dW.matrix[i][j] * dW.matrix[i][j];
                
                double m_hat = m_W.matrix[i][j] / (1 - std::pow(beta1, t));
                double v_hat = v_W.matrix[i][j] / (1 - std::pow(beta2, t));
                
                weights.matrix[i][j] -= lr * m_hat / (std::sqrt(v_hat) + epsilon);
            }
        }
        for (size_t j=0; j<bias.cols; j++){
            m_B.matrix[0][j] = beta1 * m_B.matrix[0][j] + (1 - beta1) * dB.matrix[0][j];
            v_B.matrix[0][j] = beta2 * v_B.matrix[0][j] + (1 - beta2) * dB.matrix[0][j] * dB.matrix[0][j];
            
            double m_hat = m_B.matrix[0][j] / (1 - std::pow(beta1, t));
            double v_hat = v_B.matrix[0][j] / (1 - std::pow(beta2, t));
            
            bias.matrix[0][j] -= lr * m_hat / (std::sqrt(v_hat) + epsilon);
        }
    }


    return grad_input;
}
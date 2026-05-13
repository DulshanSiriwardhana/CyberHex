#include "dense.h"
#include <cmath>
#include <iostream>
#include <random>

const Matrix<double>& Dense::getWeights() const {
    return weights;
}

const Matrix<double>& Dense::getBias() const {
    return bias;
}

Dense::Dense(double in, double out, InitType init_type)
    : weights(in, out, 0.0), bias(1, out, 0.0),
      m_W(in, out, 0.0), v_W(in, out, 0.0),
      m_B(1, out, 0.0), v_B(1, out, 0.0) {

    std::random_device rd;
    std::mt19937 gen(rd());
    
    double variance = 0.0;
    if (init_type == InitType::HE) {
        variance = 2.0 / in;
    } else { 
        variance = 2.0 / (in + out);
    }
    
    std::normal_distribution<double> d(0.0, std::sqrt(variance));

    for (size_t i = 0; i < in; i++)
        for (size_t j = 0; j < out; j++)
            weights(i, j) = d(gen);
}

Matrix<double> Dense::forward(const Matrix<double>& X) {
    input = X;
    Matrix<double> out = X.dot(weights);

    for (int i = 0; i < out.rows; i++)
        for (int j = 0; j < out.cols; j++)
            out(i, j) += bias(0, j);

    return out;
}

Matrix<double> Dense::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {

    if (input.data.empty()) { std::cout << "input empty\n"; exit(1); }
    if (grad.data.empty()) { std::cout << "grad empty\n"; exit(1); }

    if (input.rows != grad.rows) {
        std::cout << "BATCH SIZE MISMATCH\n";
        exit(1);
    }

    Matrix<double> dW = input.transpose().dot(grad);

    Matrix<double> dB(1, grad.cols, 0.0);
    for (int j = 0; j < grad.cols; j++)
        for (int i = 0; i < grad.rows; i++)
            dB(0, j) += grad(i, j);

    if (grad.cols != weights.cols) {
        std::cout << "GRAD-WEIGHT DIM ERROR\n";
        exit(1);
    }

    Matrix<double> grad_input = grad.dot(weights.transpose());


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
        
        
        for (size_t i=0; i<weights.rows; i++) {
            for(size_t j=0; j<weights.cols; j++){
                v_W(i, j) = beta * v_W(i, j) + (1 - beta) * dW(i, j) * dW(i, j);
                weights(i, j) -= lr * dW(i, j) / (std::sqrt(v_W(i, j)) + epsilon);
            }
        }
        for (size_t j=0; j<bias.cols; j++){
            v_B(0, j) = beta * v_B(0, j) + (1 - beta) * dB(0, j) * dB(0, j);
            bias(0, j) -= lr * dB(0, j) / (std::sqrt(v_B(0, j)) + epsilon);
        }
    } else if (opt == OptimizerType::ADAM) {
        double beta1 = 0.9;
        double beta2 = 0.999;
        double epsilon = 1e-8;
        
        for (size_t i=0; i<weights.rows; i++) {
            for(size_t j=0; j<weights.cols; j++){
                m_W(i, j) = beta1 * m_W(i, j) + (1 - beta1) * dW(i, j);
                v_W(i, j) = beta2 * v_W(i, j) + (1 - beta2) * dW(i, j) * dW(i, j);
                
                double m_hat = m_W(i, j) / (1 - std::pow(beta1, t));
                double v_hat = v_W(i, j) / (1 - std::pow(beta2, t));
                
                weights(i, j) -= lr * m_hat / (std::sqrt(v_hat) + epsilon);
            }
        }
        for (size_t j=0; j<bias.cols; j++){
            m_B(0, j) = beta1 * m_B(0, j) + (1 - beta1) * dB(0, j);
            v_B(0, j) = beta2 * v_B(0, j) + (1 - beta2) * dB(0, j) * dB(0, j);
            
            double m_hat = m_B(0, j) / (1 - std::pow(beta1, t));
            double v_hat = v_B(0, j) / (1 - std::pow(beta2, t));
            
            bias(0, j) -= lr * m_hat / (std::sqrt(v_hat) + epsilon);
        }
    }

    
    for (size_t i = 0; i < weights.rows; i++) {
        for (size_t j = 0; j < weights.cols; j++) {
            double w = weights(i, j);
            double l1_penalty = (w > 0 ? 1.0 : (w < 0 ? -1.0 : 0.0)) * l1_lambda;
            double l2_penalty = w * l2_lambda;
            weights(i, j) -= lr * (l1_penalty + l2_penalty);
        }
    }


    return grad_input;
}
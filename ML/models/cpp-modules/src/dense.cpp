#include "dense.h"
#include "higher_maths.h"
#include <iostream>

Dense::Dense(double in, double out)
    : weights(in, out, 0.0), bias(1, out, 0.0) {

    for (int i = 0; i < in; i++)
        for (int j = 0; j < out; j++)
            weights.matrix[i][j] = ((double)randd());
}

Matrix Dense::forward(const Matrix& X) {
    input = X;
    Matrix out = X.dot(weights);

    for (int i = 0; i < out.rows; i++)
        for (int j = 0; j < out.cols; j++)
            out.matrix[i][j] += bias.matrix[0][j];

    return out;
}

Matrix Dense::backward(const Matrix& grad, double lr) {

    if (!input.matrix) { std::cout << "input NULL\n"; exit(1); }
    if (!grad.matrix) { std::cout << "grad NULL\n"; exit(1); }

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

    weights = weights - dW * lr;
    bias = bias - dB * lr;

    return grad_input;
}
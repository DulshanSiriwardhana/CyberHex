#include "dense.h"
#include "higher_maths.h"

Dense::Dense(double in, double out)
    : weights(in, out, 0.0), bias(1, out, 0.0) {

    for (int i = 0; i < in; i++)
        for (int j = 0; j < out; j++)
            weights.matrix[i][j] = ((double)randd());
}

Matrix Dense::forward(const Matrix& X) {
    Matrix out = X.dot(weights);

    for (int i = 0; i < out.rows; i++)
        for (int j = 0; j < out.cols; j++)
            out.matrix[i][j] += bias.matrix[0][j];

    return out;
}

Matrix Dense::backward(const Matrix& grad, double lr) {
    Matrix dW = input.transpose().dot(grad);

    Matrix dB(1, grad.cols, 0.0);
    for (int j = 0; j < grad.cols; j++)
        for (int i = 0; i < grad.rows; i++)
            dB.matrix[0][j] += grad.matrix[i][j];

    weights = weights - dW * lr;
    bias = bias - dB * lr;

    return grad.dot(weights.transpose());
}
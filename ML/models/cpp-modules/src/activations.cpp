#include "activations.h"
#include <cmath>

double relu(double x) { return x > 0 ? x : 0; }
double relu_d(double x) { return x > 0 ? 1 : 0; }

double sigmoid(double x) { return 1.0 / (1.0 + exp(-x)); }
double sigmoid_d(double x) { return x * (1 - x); }

ReLU::ReLU() {}
Sigmoid::Sigmoid() {}

Matrix ReLU::forward(const Matrix& X) {
    input = X;
    Matrix out = X;
    out.apply(relu);
    return out;
}

Matrix ReLU::backward(const Matrix& grad, double) {
    Matrix g = input;
    g.apply(relu_d);

    Matrix res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res.matrix[i][j] *= g.matrix[i][j];

    return res;
}

Matrix Sigmoid::forward(const Matrix& X) {
    output = X;
    output.apply(sigmoid);
    return output;
}

Matrix Sigmoid::backward(const Matrix& grad, double) {
    Matrix g = output;
    g.apply(sigmoid_d);

    Matrix res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res.matrix[i][j] *= g.matrix[i][j];

    return res;
}
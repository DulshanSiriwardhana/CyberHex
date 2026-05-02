#include "activations.h"
#include <cmath>

double relu(double x) { return x > 0 ? x : 0; }
double relu_d(double x) { return x > 0 ? 1 : 0; }

double sigmoid(double x) { return 1.0 / (1.0 + exp(-x)); }
double sigmoid_d(double x) { return x * (1 - x); }

ReLU::ReLU() {}
Sigmoid::Sigmoid() {}
Softmax::Softmax() {}
Identity::Identity() {}

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

Matrix Softmax::forward(const Matrix& X) {
    output = Matrix(X.rows, X.cols);

    for (int i = 0; i < X.rows; i++) {
        double maxVal = X.matrix[i][0];
        for (int j = 1; j < X.cols; j++)
            if (X.matrix[i][j] > maxVal)
                maxVal = X.matrix[i][j];

        double sum = 0.0;

        for (int j = 0; j < X.cols; j++) {
            output.matrix[i][j] = exp(X.matrix[i][j] - maxVal);
            sum += output.matrix[i][j];
        }

        for (int j = 0; j < X.cols; j++) {
            output.matrix[i][j] /= sum;
        }
    }

    return output;
}

Matrix Softmax::backward(const Matrix& grad, double) {
    return grad;
}

Matrix Identity::forward(const Matrix& input) {
    return input;
}

Matrix Identity::backward(const Matrix& grad, double) {
    return grad;
}
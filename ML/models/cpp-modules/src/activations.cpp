#include "activations.h"
#include <cmath>
#include "higher_maths.h"

int p = -0.5;
int q = 1.11111111111111111111111111111111;

double relu(double x) { return x > 0 ? x : 0; }
double relu_d(double x) { return x > 0 ? 1 : 0; }

double sigmoid(double x) { return 1.0 / (1.0 + exp(-x)); }
double sigmoid_d(double x) { return x * (1 - x); }

double generalized_sigmoid(double x) { return 1.0 / (1.0 + exp(p-q * x));}
double generalized_sigmoid_d(double x) { return q * x * (1-x);}

ReLU::ReLU() {}
Sigmoid::Sigmoid() {}
Softmax::Softmax() {}
Identity::Identity() {}
Generalized_Sigmoid::Generalized_Sigmoid() {}

Matrix ReLU::forward(const Matrix& X) {
    input = X;
    Matrix out = X;
    out.apply(relu);
    return out;
}

Matrix ReLU::backward(const Matrix& grad, double lr, OptimizerType opt, int t) {
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

Matrix Sigmoid::backward(const Matrix& grad, double lr, OptimizerType opt, int t) {
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

Matrix Softmax::backward(const Matrix& grad, double lr, OptimizerType opt, int t) {
    return grad;
}

Matrix Identity::forward(const Matrix& input) {
    return input;
}

Matrix Identity::backward(const Matrix& grad, double lr, OptimizerType opt, int t) {
    return grad;
}

Matrix Generalized_Sigmoid::forward(const Matrix& X) {
    output = X;
    output.apply(generalized_sigmoid);
    return output;
}

Matrix Generalized_Sigmoid::backward(const Matrix& grad, double lr, OptimizerType opt, int t) {
    Matrix g = output;
    g.apply(generalized_sigmoid_d);

    Matrix res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res.matrix[i][j] *= g.matrix[i][j];

    return res;
}
double tanh_act(double x) { return std::tanh(x); }
double tanh_deriv(double x) { return 1.0 - x * x; }
double leaky_relu(double x) { return x > 0 ? x : 0.01 * x; }
double leaky_relu_deriv(double x) { return x > 0 ? 1.0 : 0.01; }

Tanh::Tanh() {}
Matrix Tanh::forward(const Matrix& X) {
    output = X;
    output.apply(tanh_act);
    return output;
}
Matrix Tanh::backward(const Matrix& grad, double lr, OptimizerType opt, int t) {
    Matrix g = output;
    g.apply(tanh_deriv);
    Matrix res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res.matrix[i][j] *= g.matrix[i][j];
    return res;
}

LeakyReLU::LeakyReLU() {}
Matrix LeakyReLU::forward(const Matrix& X) {
    output = X;
    output.apply(leaky_relu);
    return output;
}
Matrix LeakyReLU::backward(const Matrix& grad, double lr, OptimizerType opt, int t) {
    Matrix g = output;
    g.apply(leaky_relu_deriv);
    Matrix res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res.matrix[i][j] *= g.matrix[i][j];
    return res;
}

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

Matrix<double> ReLU::forward(const Matrix<double>& X) {
    input = X;
    Matrix<double> out = X;
    out.apply(relu);
    return out;
}

Matrix<double> ReLU::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> g = input;
    g.apply(relu_d);

    Matrix<double> res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res(i, j) *= g(i, j);

    return res;
}

Matrix<double> Sigmoid::forward(const Matrix<double>& X) {
    output = X;
    output.apply(sigmoid);
    return output;
}

Matrix<double> Sigmoid::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> g = output;
    g.apply(sigmoid_d);

    Matrix<double> res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res(i, j) *= g(i, j);

    return res;
}

Matrix<double> Softmax::forward(const Matrix<double>& X) {
    output = Matrix<double>(X.rows, X.cols);

    for (int i = 0; i < X.rows; i++) {
        double maxVal = X(i, 0);
        for (int j = 1; j < X.cols; j++)
            if (X(i, j) > maxVal)
                maxVal = X(i, j);

        double sum = 0.0;

        for (int j = 0; j < X.cols; j++) {
            output(i, j) = exp(X(i, j) - maxVal);
            sum += output(i, j);
        }

        for (int j = 0; j < X.cols; j++) {
            output(i, j) /= sum;
        }
    }

    return output;
}

Matrix<double> Softmax::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    return grad;
}

Matrix<double> Identity::forward(const Matrix<double>& input) {
    return input;
}

Matrix<double> Identity::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    return grad;
}

Matrix<double> Generalized_Sigmoid::forward(const Matrix<double>& X) {
    output = X;
    output.apply(generalized_sigmoid);
    return output;
}

Matrix<double> Generalized_Sigmoid::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> g = output;
    g.apply(generalized_sigmoid_d);

    Matrix<double> res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res(i, j) *= g(i, j);

    return res;
}
double tanh_act(double x) { return std::tanh(x); }
double tanh_deriv(double x) { return 1.0 - x * x; }
double leaky_relu(double x) { return x > 0 ? x : 0.01 * x; }
double leaky_relu_deriv(double x) { return x > 0 ? 1.0 : 0.01; }

Tanh::Tanh() {}
Matrix<double> Tanh::forward(const Matrix<double>& X) {
    output = X;
    output.apply(tanh_act);
    return output;
}
Matrix<double> Tanh::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> g = output;
    g.apply(tanh_deriv);
    Matrix<double> res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res(i, j) *= g(i, j);
    return res;
}

LeakyReLU::LeakyReLU() {}
Matrix<double> LeakyReLU::forward(const Matrix<double>& X) {
    output = X;
    output.apply(leaky_relu);
    return output;
}
Matrix<double> LeakyReLU::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> g = output;
    g.apply(leaky_relu_deriv);
    Matrix<double> res = grad;
    for (int i = 0; i < grad.rows; i++)
        for (int j = 0; j < grad.cols; j++)
            res(i, j) *= g(i, j);
    return res;
}

double softplus_act(double x) { return std::log1p(std::exp(x)); }
double softplus_deriv(double x) { return 1.0 / (1.0 + std::exp(-x)); }

Softplus::Softplus() {}
Matrix<double> Softplus::forward(const Matrix<double>& X) {
    input = X;
    Matrix<double> output = X;
    output.apply(softplus_act);
    return output;
}
Matrix<double> Softplus::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> g = input;
    g.apply(softplus_deriv);
    Matrix<double> res = grad;
    for (size_t i = 0; i < grad.rows; i++)
        for (size_t j = 0; j < grad.cols; j++)
            res(i, j) *= g(i, j);
    return res;
}

#include <random>

Dropout::Dropout(double rate) : rate(rate) {}
Matrix<double> Dropout::forward(const Matrix<double>& input) {
    mask = Matrix<double>(input.rows, input.cols, 0.0);
    Matrix<double> output = input;
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> dis(0.0, 1.0);
    double scale = 1.0 / (1.0 - rate);
    
    for(size_t i=0; i<input.rows; i++) {
        for(size_t j=0; j<input.cols; j++) {
            if (dis(gen) > rate) {
                mask(i, j) = scale;
                output(i, j) *= scale;
            } else {
                mask(i, j) = 0.0;
                output(i, j) = 0.0;
            }
        }
    }
    return output;
}
Matrix<double> Dropout::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> res = grad;
    for (size_t i = 0; i < grad.rows; i++)
        for (size_t j = 0; j < grad.cols; j++)
            res(i, j) *= mask(i, j);
    return res;
}

BatchNormalization::BatchNormalization(size_t input_size) 
    : gamma(1, input_size, 1.0), beta(1, input_size, 0.0), 
      running_mean(1, input_size, 0.0), running_var(1, input_size, 1.0), epsilon(1e-5) {}

Matrix<double> BatchNormalization::forward(const Matrix<double>& input) {
    Matrix<double> output(input.rows, input.cols, 0.0);
    x_hat = Matrix<double>(input.rows, input.cols, 0.0);
    ivar = Matrix<double>(1, input.cols, 0.0);
    
    for (size_t j = 0; j < input.cols; j++) {
        double mean = 0.0;
        for (size_t i = 0; i < input.rows; i++) mean += input(i, j);
        mean /= input.rows;
        
        double var = 0.0;
        for (size_t i = 0; i < input.rows; i++) {
            double diff = input(i, j) - mean;
            var += diff * diff;
        }
        var /= input.rows;
        running_mean(0, j) = 0.9 * running_mean(0, j) + 0.1 * mean;
        running_var(0, j) = 0.9 * running_var(0, j) + 0.1 * var;
        
        ivar(0, j) = 1.0 / std::sqrt(var + epsilon);
        for (size_t i = 0; i < input.rows; i++) {
            x_hat(i, j) = (input(i, j) - mean) * ivar(0, j);
            output(i, j) = gamma(0, j) * x_hat(i, j) + beta(0, j);
        }
    }
    return output;
}

Matrix<double> BatchNormalization::backward(const Matrix<double>& grad, double lr, OptimizerType opt, int t) {
    Matrix<double> dX(grad.rows, grad.cols, 0.0);
    
    for (size_t j = 0; j < grad.cols; j++) {
        double dGamma = 0.0, dBeta = 0.0;
        for (size_t i = 0; i < grad.rows; i++) {
            dGamma += grad(i, j) * x_hat(i, j);
            dBeta += grad(i, j);
        }
        gamma(0, j) -= lr * dGamma;
        beta(0, j) -= lr * dBeta;
        
        double dxhat_sum = 0.0, dxhat_xhat_sum = 0.0;
        for (size_t i = 0; i < grad.rows; i++) {
            double dxhat = grad(i, j) * gamma(0, j);
            dxhat_sum += dxhat;
            dxhat_xhat_sum += dxhat * x_hat(i, j);
        }
        
        for (size_t i = 0; i < grad.rows; i++) {
            double dxhat = grad(i, j) * gamma(0, j);
            dX(i, j) = (1.0 / grad.rows) * ivar(0, j) * (
                grad.rows * dxhat - dxhat_sum - x_hat(i, j) * dxhat_xhat_sum
            );
        }
    }
    return dX;
}

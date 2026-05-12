import os
import re

dir_path = "/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules"


hdr = os.path.join(dir_path, "include/activations.h")
with open(hdr, "r") as f:
    text = f.read()

new_classes = """
class Softplus : public Layer {
    private:
        Matrix<double> input;
    public:
        Softplus();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Dropout : public Layer {
    private:
        double rate;
        Matrix<double> mask;
    public:
        Dropout(double rate = 0.5);
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class BatchNormalization : public Layer {
    private:
        Matrix<double> gamma;
        Matrix<double> beta;
        Matrix<double> running_mean;
        Matrix<double> running_var;
        Matrix<double> x_hat;
        Matrix<double> ivar;
        double epsilon;
    public:
        BatchNormalization(size_t input_size);
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

"""
text = text.replace("
with open(hdr, "w") as f:
    f.write(text)


cpp = os.path.join(dir_path, "src/activations.cpp")
with open(cpp, "r") as f:
    text_cpp = f.read()
    
new_impl = """
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
"""

with open(cpp, "a") as f:
    f.write(new_impl)


#include "fused_ops.h"
#include "ops_dispatch.h"
#include "device.h"

namespace cyberhex {

Matrix<double> fused_linear_relu_forward(const Matrix<double>& X,
                                         const Matrix<double>& W,
                                         const Matrix<double>& bias,
                                         Matrix<double>& pre_activation_out) {
    pre_activation_out = dispatch_matmul(default_device(), X, W);
    Matrix<double> out(pre_activation_out.rows(), pre_activation_out.cols());
    for (size_t i = 0; i < out.rows(); i++) {
        for (size_t j = 0; j < out.cols(); j++) {
            double z = pre_activation_out(i, j) + bias(0, j);
            pre_activation_out(i, j) = z;
            out(i, j) = z > 0.0 ? z : 0.0;
        }
    }
    return out;
}

FusedLinearReLUGrad fused_linear_relu_backward(const Matrix<double>& grad_out,
                                                const Matrix<double>& X,
                                                const Matrix<double>& W,
                                                const Matrix<double>& pre_activation) {
    Matrix<double> grad_relu(pre_activation.rows(), pre_activation.cols());
    for (size_t i = 0; i < pre_activation.size(); i++) {
        grad_relu.at(i) = pre_activation.at(i) > 0.0 ? grad_out.at(i) : 0.0;
    }

    FusedLinearReLUGrad g;
    g.grad_W = dispatch_matmul(default_device(), X.transpose(), grad_relu);
    g.grad_b = Matrix<double>(1, grad_relu.cols(), 0.0);
    for (size_t j = 0; j < grad_relu.cols(); j++) {
        for (size_t i = 0; i < grad_relu.rows(); i++) {
            g.grad_b(0, j) += grad_relu(i, j);
        }
    }
    g.grad_X = dispatch_matmul(default_device(), grad_relu, W.transpose());
    return g;
}

} // namespace cyberhex

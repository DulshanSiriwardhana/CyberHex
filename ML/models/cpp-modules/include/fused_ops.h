#ifndef CYBERHEX_FUSED_OPS_H
#define CYBERHEX_FUSED_OPS_H

#include "matrix.h"

namespace cyberhex {

Matrix<double> fused_linear_relu_forward(const Matrix<double>& X,
                                         const Matrix<double>& W,
                                         const Matrix<double>& bias,
                                         Matrix<double>& pre_activation_out);

struct FusedLinearReLUGrad {
    Matrix<double> grad_X;
    Matrix<double> grad_W;
    Matrix<double> grad_b;
};

FusedLinearReLUGrad fused_linear_relu_backward(const Matrix<double>& grad_out,
                                                const Matrix<double>& X,
                                                const Matrix<double>& W,
                                                const Matrix<double>& pre_activation);

}

#endif

#ifndef CYBERHEX_OPS_DISPATCH_H
#define CYBERHEX_OPS_DISPATCH_H

#include "matrix.h"
#include "device.h"

namespace cyberhex {

Matrix<double> dispatch_matmul(const Device& device,
                               const Matrix<double>& A,
                               const Matrix<double>& B);

}

#endif

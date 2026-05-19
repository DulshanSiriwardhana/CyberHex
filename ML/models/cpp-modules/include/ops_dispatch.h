#ifndef CYBERHEX_OPS_DISPATCH_H
#define CYBERHEX_OPS_DISPATCH_H

#include "matrix.h"
#include "device.h"

namespace cyberhex {

/** Device-aware GEMM: C = A·B (CPU OpenMP; CUDA when CYBERHEX_CUDA). */
Matrix<double> dispatch_matmul(const Device& device,
                               const Matrix<double>& A,
                               const Matrix<double>& B);

} // namespace cyberhex

#endif // CYBERHEX_OPS_DISPATCH_H

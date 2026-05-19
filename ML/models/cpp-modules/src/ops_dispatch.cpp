#include "ops_dispatch.h"
#include <stdexcept>

#ifdef CYBERHEX_CUDA
extern "C" bool cyberhex_cuda_matmul(const double* A, size_t a_rows, size_t a_cols,
                                     const double* B, size_t b_rows, size_t b_cols,
                                     double* C);
extern "C" bool cyberhex_cuda_runtime_available();
#endif

namespace cyberhex {

Matrix<double> dispatch_matmul(const Device& device,
                               const Matrix<double>& A,
                               const Matrix<double>& B) {
    if (A.cols() != B.rows()) {
        throw std::invalid_argument("dispatch_matmul: dimension mismatch");
    }

    if (device.is_cuda()) {
        if (!Device::cuda_available()) {
            throw std::runtime_error("CUDA device requested but not available");
        }
#ifdef CYBERHEX_CUDA
        Matrix<double> C(A.rows(), B.cols(), 0.0);
        if (!cyberhex_cuda_matmul(A.data(), A.rows(), A.cols(),
                                  B.data(), B.rows(), B.cols(),
                                  C.data())) {
            throw std::runtime_error("CUDA matmul failed");
        }
        return C;
#else
        throw std::runtime_error("CUDA device requested but build lacks CYBERHEX_CUDA");
#endif
    }

    return A.dot(B);
}

} // namespace cyberhex

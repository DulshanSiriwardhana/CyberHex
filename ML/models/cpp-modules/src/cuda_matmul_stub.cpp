#include <cstddef>

#ifdef CYBERHEX_CUDA

extern "C" bool cyberhex_cuda_runtime_available() {
    return false;
}

/** Host-side CUDA matmul entry when nvcc is unavailable. */
extern "C" bool cyberhex_cuda_matmul(const double* A, size_t a_rows, size_t a_cols,
                                     const double* B, size_t b_rows, size_t b_cols,
                                     double* C) {
    if (!A || !B || !C || a_cols != b_rows) return false;
    for (size_t i = 0; i < a_rows; i++) {
        for (size_t j = 0; j < b_cols; j++) {
            double sum = 0.0;
            for (size_t k = 0; k < a_cols; k++) {
                sum += A[i * a_cols + k] * B[k * b_cols + j];
            }
            C[i * b_cols + j] = sum;
        }
    }
    return true;
}

#endif

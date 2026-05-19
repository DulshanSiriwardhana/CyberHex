#ifndef CYBERHEX_CUDA_RUNTIME_H
#define CYBERHEX_CUDA_RUNTIME_H

#ifdef __cplusplus
extern "C" {
#endif

bool cyberhex_cuda_runtime_available();
bool cyberhex_cuda_matmul(const double* A, size_t a_rows, size_t a_cols,
                          const double* B, size_t b_rows, size_t b_cols,
                          double* C);

#ifdef __cplusplus
}
#endif

#endif

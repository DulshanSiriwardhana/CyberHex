#include <cuda_runtime.h>
#include <cstddef>

namespace {

__global__ void matmul_kernel(const double* A, const double* B, double* C,
                              int M, int N, int K) {
    const int row = static_cast<int>(blockIdx.y * blockDim.y + threadIdx.y);
    const int col = static_cast<int>(blockIdx.x * blockDim.x + threadIdx.x);
    if (row >= M || col >= N) return;

    double sum = 0.0;
    for (int k = 0; k < K; k++) {
        sum += A[row * K + k] * B[k * N + col];
    }
    C[row * N + col] = sum;
}

} // namespace

extern "C" bool cyberhex_cuda_runtime_available() {
    int count = 0;
    cudaError_t err = cudaGetDeviceCount(&count);
    return err == cudaSuccess && count > 0;
}

extern "C" bool cyberhex_cuda_matmul(const double* A, size_t a_rows, size_t a_cols,
                                     const double* B, size_t b_rows, size_t b_cols,
                                     double* C) {
    if (!A || !B || !C || a_cols != b_rows) return false;

    const int M = static_cast<int>(a_rows);
    const int K = static_cast<int>(a_cols);
    const int N = static_cast<int>(b_cols);

    double *dA = nullptr, *dB = nullptr, *dC = nullptr;
    const size_t a_bytes = a_rows * a_cols * sizeof(double);
    const size_t b_bytes = b_rows * b_cols * sizeof(double);
    const size_t c_bytes = a_rows * b_cols * sizeof(double);

    auto cleanup = [&]() {
        if (dA) cudaFree(dA);
        if (dB) cudaFree(dB);
        if (dC) cudaFree(dC);
    };

    if (cudaMalloc(&dA, a_bytes) != cudaSuccess) return false;
    if (cudaMalloc(&dB, b_bytes) != cudaSuccess) { cleanup(); return false; }
    if (cudaMalloc(&dC, c_bytes) != cudaSuccess) { cleanup(); return false; }

    if (cudaMemcpy(dA, A, a_bytes, cudaMemcpyHostToDevice) != cudaSuccess) { cleanup(); return false; }
    if (cudaMemcpy(dB, B, b_bytes, cudaMemcpyHostToDevice) != cudaSuccess) { cleanup(); return false; }

    dim3 block(16, 16);
    dim3 grid((N + block.x - 1) / block.x, (M + block.y - 1) / block.y);
    matmul_kernel<<<grid, block>>>(dA, dB, dC, M, N, K);

    if (cudaGetLastError() != cudaSuccess) { cleanup(); return false; }
    if (cudaDeviceSynchronize() != cudaSuccess) { cleanup(); return false; }
    if (cudaMemcpy(C, dC, c_bytes, cudaMemcpyDeviceToHost) != cudaSuccess) { cleanup(); return false; }

    cleanup();
    return true;
}

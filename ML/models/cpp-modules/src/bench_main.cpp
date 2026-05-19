// CyberHex micro-benchmarks — matrix dot product GFLOPS
#include "matrix.h"
#include <chrono>
#include <iostream>
#include <iomanip>
#include <cstdlib>

using namespace cyberhex;

int main(int argc, char** argv) {
    size_t n = 512;
    int repeats = 10;

    if (argc > 1) n = static_cast<size_t>(std::atoi(argv[1]));
    if (argc > 2) repeats = std::atoi(argv[2]);

    Matrix<double> a(n, n);
    Matrix<double> b(n, n);
    for (size_t i = 0; i < a.size(); i++) {
        a.at(i) = static_cast<double>(i % 97) * 0.01;
        b.at(i) = static_cast<double>(i % 53) * 0.02;
    }

    // Warmup
    for (int i = 0; i < 3; i++) {
        auto c = a.dot(b);
        (void)c;
    }

    double total_ms = 0.0;
    for (int r = 0; r < repeats; r++) {
        auto t0 = std::chrono::steady_clock::now();
        auto c = a.dot(b);
        auto t1 = std::chrono::steady_clock::now();
        total_ms += std::chrono::duration<double, std::milli>(t1 - t0).count();
        (void)c;
    }

    double mean_ms = total_ms / repeats;
    double gflops = (2.0 * static_cast<double>(n) * n * n) / (mean_ms * 1e6);

    std::cout << std::fixed << std::setprecision(3);
    std::cout << "{\"benchmark\":\"matmul\",\"n\":" << n
              << ",\"repeats\":" << repeats
              << ",\"mean_ms\":" << mean_ms
              << ",\"gflops\":" << gflops << "}" << std::endl;
    return 0;
}

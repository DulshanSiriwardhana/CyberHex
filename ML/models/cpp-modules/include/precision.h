#ifndef CYBERHEX_PRECISION_H
#define CYBERHEX_PRECISION_H

#include "matrix.h"
#include <cstdint>
#include <cmath>
#include <vector>

namespace cyberhex {

enum class ComputePrecision {
    Float64,
    Float32,
    Mixed  // parameters in FP16, compute in FP32/FP64
};

/** IEEE-754 binary16 helpers (software implementation). */
class Float16 {
public:
    uint16_t bits = 0;

    Float16() = default;
    explicit Float16(uint16_t b) : bits(b) {}
    static Float16 from_float(float x);
    static Float16 from_double(double x);
    float to_float() const;
    double to_double() const;
};

struct Fp16Matrix {
    size_t rows = 0;
    size_t cols = 0;
    std::vector<Float16> data;
};

Fp16Matrix matrix_to_fp16(const Matrix<double>& src);
Matrix<double> matrix_from_fp16(const Fp16Matrix& src);

struct MixedPrecisionState {
    bool enabled = false;
    Fp16Matrix fp16_cache;
};

} // namespace cyberhex

#endif // CYBERHEX_PRECISION_H

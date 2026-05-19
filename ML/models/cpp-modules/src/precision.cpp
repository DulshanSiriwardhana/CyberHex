#include "precision.h"
#include <cstring>

namespace cyberhex {

namespace {

uint32_t float_to_bits(float f) {
    uint32_t u;
    std::memcpy(&u, &f, sizeof(float));
    return u;
}

float bits_to_float(uint32_t u) {
    float f;
    std::memcpy(&f, &u, sizeof(float));
    return f;
}

} // namespace

Float16 Float16::from_float(float x) {
    uint32_t f = float_to_bits(x);
    uint16_t sign = (f >> 16) & 0x8000;
    int32_t exp = ((f >> 23) & 0xFF) - 127 + 15;
    uint32_t mant = f & 0x7FFFFF;

    if (exp <= 0) {
        if (exp < -10) return Float16(sign);
        mant = (mant | 0x800000) >> (1 - exp);
        return Float16(sign | static_cast<uint16_t>(mant >> 13));
    }
    if (exp >= 31) {
        return Float16(sign | 0x7C00);
    }
    return Float16(sign | static_cast<uint16_t>((exp << 10) | (mant >> 13)));
}

Float16 Float16::from_double(double x) {
    return from_float(static_cast<float>(x));
}

float Float16::to_float() const {
    uint32_t sign = (bits & 0x8000) << 16;
    uint32_t exp = (bits >> 10) & 0x1F;
    uint32_t mant = bits & 0x3FF;

    if (exp == 0) {
        if (mant == 0) return bits_to_float(sign);
        exp = 1;
        while ((mant & 0x400) == 0) {
            mant <<= 1;
            exp--;
        }
        mant &= 0x3FF;
    } else if (exp == 31) {
        uint32_t inf = sign | 0x7F800000 | (mant << 13);
        return bits_to_float(inf);
    }

    uint32_t fexp = exp - 15 + 127;
    uint32_t f = sign | (fexp << 23) | (mant << 13);
    return bits_to_float(f);
}

double Float16::to_double() const {
    return static_cast<double>(to_float());
}

Fp16Matrix matrix_to_fp16(const Matrix<double>& src) {
    Fp16Matrix out;
    out.rows = src.rows();
    out.cols = src.cols();
    out.data.resize(src.size());
    for (size_t i = 0; i < src.size(); i++) {
        out.data[i] = Float16::from_double(src.at(i));
    }
    return out;
}

Matrix<double> matrix_from_fp16(const Fp16Matrix& src) {
    Matrix<double> out(src.rows, src.cols);
    for (size_t i = 0; i < out.size(); i++) {
        out.at(i) = src.data[i].to_double();
    }
    return out;
}

} // namespace cyberhex

#ifndef MATRIX_H
#define MATRIX_H

#include <vector>
#include <stdexcept>
#include <string>
#include <cassert>
#include <type_traits>

class CyberHexException : public std::runtime_error {
public:
    explicit CyberHexException(const std::string& msg) : std::runtime_error(msg) {}
};

class DimensionMismatchException : public CyberHexException {
public:
    explicit DimensionMismatchException(const std::string& msg) : CyberHexException(msg) {}
};

template <typename T=double>
class Matrix {
    static_assert(std::is_arithmetic<T>::value,
        "Matrix<T>: T must be an arithmetic type (float, double, int, etc.).");
    public:
        size_t rows;
        size_t cols;
        std::vector<T> data;

        inline T& operator()(size_t r, size_t c) {
            assert(r < rows && "Row index out of bounds");
            assert(c < cols && "Col index out of bounds");
            return data[r * cols + c];
        }

        inline const T& operator()(size_t r, size_t c) const {
            assert(r < rows && "Row index out of bounds");
            assert(c < cols && "Col index out of bounds");
            return data[r * cols + c];
        }

        Matrix();
        Matrix(size_t r, size_t c, T val = 0.0);

        Matrix(const Matrix& other);
        Matrix(Matrix&& other) noexcept;
        Matrix& operator=(Matrix other);
        void swap(Matrix& other) noexcept;

        Matrix dot(const Matrix& other) const;
        Matrix transpose() const;

        Matrix operator+(const Matrix& other) const;
        Matrix operator-(const Matrix& other) const;
        Matrix operator*(T scalar) const;

        void apply(double (*func)(double));
        void print() const;
};

std::vector<double> solve_AX_eq_B(std::vector<std::vector<double>> A, std::vector<double> B);
double det(std::vector<std::vector<double>> A);
void removeRowColumn(const std::vector<std::vector<double>>& A, size_t row, size_t column, std::vector<std::vector<double>>& ret);

#endif
#ifndef MATRIX_H
#define MATRIX_H

#include <vector>
#include <stdexcept>
#include <string>

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
    public:
        size_t rows;
        size_t cols;
        std::vector<T> data;

        inline T& operator()(size_t r, size_t c) {
            return data[r * cols + c];
        }

        inline const T& operator()(size_t r, size_t c) const {
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

void removeRowColumn(const std::vector<std::vector<double>>& A, size_t row, size_t column, std::vector<std::vector<double>>& ret);
double det(std::vector<std::vector<double>> A); // Pass by value to allow mutation for LU
void replaceRow(const std::vector<std::vector<double>>& A, size_t row, const std::vector<double>& replacingRow, std::vector<std::vector<double>>& ret);
void replaceColumn(const std::vector<std::vector<double>>& A, size_t column, const std::vector<double>& replacingColumn, std::vector<std::vector<double>>& ret);
std::vector<double> solve_AX_eq_B(std::vector<std::vector<double>> A, std::vector<double> B); // Pass by value
std::vector<std::vector<double>> multiply_matrices(const std::vector<std::vector<double>>& A, const std::vector<std::vector<double>>& B);

#endif
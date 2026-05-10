#include "matrix.h"
#include <iostream>
#include <cmath>

using namespace std;

Matrix::Matrix() : rows(0), cols(0), matrix(0, std::vector<double>(0, 0.0)) {}

Matrix::Matrix(size_t r, size_t c, double val) : rows(r), cols(c), matrix(r, std::vector<double>(c, val)) {}

// Copy constructor
Matrix::Matrix(const Matrix& other) : rows(other.rows), cols(other.cols), matrix(other.matrix) {}

// Move constructor
Matrix::Matrix(Matrix&& other) noexcept : rows(other.rows), cols(other.cols), matrix(std::move(other.matrix)) {
    other.rows = 0;
    other.cols = 0;
}

// operator= using copy and swap
Matrix& Matrix::operator=(Matrix other) {
    swap(other);
    return *this;
}

// swap
void Matrix::swap(Matrix& other) noexcept {
    std::swap(rows, other.rows);
    std::swap(cols, other.cols);
    matrix.swap(other.matrix);
}

Matrix Matrix::dot(const Matrix& other) const {
    if (cols != other.rows) {
        throw DimensionMismatchException("Matrix dot product dimension mismatch");
    }
    Matrix result(rows, other.cols, 0.0);

    #pragma omp parallel for collapse(2)
    for (size_t i = 0; i < rows; i++)
        for (size_t j = 0; j < other.cols; j++)
            for (size_t k = 0; k < cols; k++)
                result.matrix[i][j] += matrix[i][k] * other.matrix[k][j];

    return result;
}

Matrix Matrix::transpose() const {
    Matrix t(cols, rows);

    for (size_t i = 0; i < rows; i++)
        for (size_t j = 0; j < cols; j++)
            t.matrix[j][i] = matrix[i][j];

    return t;
}

Matrix Matrix::operator+(const Matrix& other) const {
    if (rows != other.rows || cols != other.cols) {
        throw DimensionMismatchException("Matrix addition dimension mismatch");
    }
    Matrix r(rows, cols);

    for (size_t i = 0; i < rows; i++)
        for (size_t j = 0; j < cols; j++)
            r.matrix[i][j] = matrix[i][j] + other.matrix[i][j];

    return r;
}

Matrix Matrix::operator-(const Matrix& other) const {
    if (rows != other.rows || cols != other.cols) {
        throw DimensionMismatchException("Matrix subtraction dimension mismatch");
    }
    Matrix r(rows, cols);

    for (size_t i = 0; i < rows; i++)
        for (size_t j = 0; j < cols; j++)
            r.matrix[i][j] = matrix[i][j] - other.matrix[i][j];

    return r;
}

Matrix Matrix::operator*(double scalar) const {
    Matrix r(rows, cols);

    for (size_t i = 0; i < rows; i++)
        for (size_t j = 0; j < cols; j++)
            r.matrix[i][j] = matrix[i][j] * scalar;

    return r;
}

void Matrix::apply(double (*func)(double)) {
    for (size_t i = 0; i < rows; i++)
        for (size_t j = 0; j < cols; j++)
            matrix[i][j] = func(matrix[i][j]);
}

void Matrix::print() const {
    for (size_t i = 0; i < rows; i++) {
        for (size_t j = 0; j < cols; j++) {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }
}

void removeRowColumn(const std::vector<std::vector<double>>& A, size_t row, size_t column, std::vector<std::vector<double>>& ret) {
    size_t size = A.size();
    ret.assign(size - 1, std::vector<double>(size - 1));
    for(int i=0; i<size-1; i++) {
        for(int j=0; j<size-1; j++) {
            size_t srcR = (i >= row) ? i + 1 : i;
            size_t srcC = (j >= column) ? j + 1 : j;
            ret[i][j] = A[srcR][srcC];
        }
    }
}

double det(std::vector<std::vector<double>> A) {
    if (A.empty()) return 0;
    size_t size = A.size();
    if (size == 1) return A[0][0];

    // LU decomposition via Gaussian elimination
    double d = 1.0;
    for (size_t i = 0; i < size; i++) {
        size_t pivot = i;
        for (size_t j = i + 1; j < size; j++) {
            if (std::abs(A[j][i]) > std::abs(A[pivot][i])) {
                pivot = j;
            }
        }
        if (pivot != i) {
            std::swap(A[i], A[pivot]);
            d = -d;
        }
        if (A[i][i] == 0) {
            return 0; // Singular matrix
        }
        d *= A[i][i];
        for (size_t j = i + 1; j < size; j++) {
            double factor = A[j][i] / A[i][i];
            for (size_t k = i + 1; k < size; k++) {
                A[j][k] -= factor * A[i][k];
            }
        }
    }
    return d;
}

void replaceRow(const std::vector<std::vector<double>>& A, size_t row, const std::vector<double>& replacingRow, std::vector<std::vector<double>>& ret) {
    size_t size = A.size();
    ret.assign(size, std::vector<double>(size));
    for(int i=0; i<size; i++) {
        for(int j=0; j<size; j++) {
            if(i == row) {
                ret[i][j] = replacingRow[j];
            } else {
                ret[i][j] = A[i][j];
            }
        }
    }
}

void replaceColumn(const std::vector<std::vector<double>>& A, size_t column, const std::vector<double>& replacingColumn, std::vector<std::vector<double>>& ret) {
    size_t size = A.size();
    ret.assign(size, std::vector<double>(size));
    for(int i=0; i<size; i++) {
        for(int j=0; j<size; j++) {
            if(j == column) {
                ret[i][j] = replacingColumn[i];
            } else {
                ret[i][j] = A[i][j];
            }
        }
    }
}

std::vector<double> solve_AX_eq_B(std::vector<std::vector<double>> A, std::vector<double> B) {
    if (A.empty() || B.empty() || A.size() != B.size()) {
        throw CyberHexException("solve_AX_eq_B: Invalid dimensions or empty matrices");
    }
    size_t size = A.size();
    
    // Gaussian elimination
    for (size_t i = 0; i < size; i++) {
        size_t pivot = i;
        for (size_t j = i + 1; j < size; j++) {
            if (std::abs(A[j][i]) > std::abs(A[pivot][i])) {
                pivot = j;
            }
        }
        if (pivot != i) {
            std::swap(A[i], A[pivot]);
            std::swap(B[i], B[pivot]);
        }
        if (A[i][i] == 0) {
            throw CyberHexException("Singular matrix detected in solve_AX_eq_B");
        }
        // Eliminate
        for (size_t j = i + 1; j < size; j++) {
            double factor = A[j][i] / A[i][i];
            B[j] -= factor * B[i];
            for (size_t k = i; k < size; k++) {
                A[j][k] -= factor * A[i][k];
            }
        }
    }

    // Back substitution
    std::vector<double> X(size, 0.0);
    for (size_t i = size - 1; i >= 0; i--) {
        double sum = B[i];
        for (size_t j = i + 1; j < size; j++) {
            sum -= A[i][j] * X[j];
        }
        X[i] = sum / A[i][i];
    }
    return X;
}

std::vector<std::vector<double>> multiply_matrices(const std::vector<std::vector<double>>& A, const std::vector<std::vector<double>>& B) {
    if (A.empty() || B.empty() || A[0].size() != B.size()) {
        throw CyberHexException("multiply_matrices: Invalid dimensions");
    }
    size_t rowsA = A.size();
    size_t colsA = A[0].size();
    size_t colsB = B[0].size();
    
    std::vector<std::vector<double>> ret(rowsA, std::vector<double>(colsB, 0.0));
    for(int i=0; i<rowsA; i++) {
        for(int j=0; j<colsB; j++) {
            double val = 0;
            for(int k=0; k<colsA; k++) {
                val += A[i][k] * B[k][j];
            }
            ret[i][j] = val;
        }
    }
    return ret;
}

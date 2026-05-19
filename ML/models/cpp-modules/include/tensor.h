#ifndef CYBERHEX_TENSOR_H
#define CYBERHEX_TENSOR_H

#include "matrix.h"
#include <cstddef>

namespace cyberhex {

/**
 * Non-owning view into a row-major Matrix (Phase 2 tensor ABI foundation).
 * Supports sub-matrix windows without copying underlying storage.
 */
template <typename T = double>
class TensorView {
public:
    TensorView() = default;

    TensorView(Matrix<T>& matrix, size_t row_offset, size_t col_offset,
               size_t view_rows, size_t view_cols)
        : matrix_(&matrix), row_offset_(row_offset), col_offset_(col_offset),
          rows_(view_rows), cols_(view_cols) {
        if (row_offset_ + rows_ > matrix.rows() || col_offset_ + cols_ > matrix.cols()) {
            throw DimensionMismatchException("TensorView exceeds parent matrix bounds");
        }
    }

    explicit TensorView(Matrix<T>& matrix)
        : TensorView(matrix, 0, 0, matrix.rows(), matrix.cols()) {}

    size_t rows() const { return rows_; }
    size_t cols() const { return cols_; }

    T& operator()(size_t i, size_t j) {
        return (*matrix_)(row_offset_ + i, col_offset_ + j);
    }

    const T& operator()(size_t i, size_t j) const {
        return (*matrix_)(row_offset_ + i, col_offset_ + j);
    }

    Matrix<T> to_matrix() const {
        Matrix<T> out(rows_, cols_);
        for (size_t i = 0; i < rows_; i++) {
            for (size_t j = 0; j < cols_; j++) {
                out(i, j) = (*this)(i, j);
            }
        }
        return out;
    }

    /** View a contiguous row block inside the parent matrix. */
    TensorView row_view(size_t start, size_t count) const {
        return TensorView(*matrix_, row_offset_ + start, col_offset_, count, cols_);
    }

private:
    Matrix<T>* matrix_ = nullptr;
    size_t row_offset_ = 0;
    size_t col_offset_ = 0;
    size_t rows_ = 0;
    size_t cols_ = 0;
};

/** Element-wise add with NumPy-style broadcasting (2D only). */
template <typename T>
Matrix<T> broadcast_add(const Matrix<T>& a, const Matrix<T>& b) {
    if (a.rows() == b.rows() && a.cols() == b.cols()) {
        return a + b;
    }
    if (b.rows() == 1 && b.cols() == a.cols()) {
        Matrix<T> out(a.rows(), a.cols());
        for (size_t i = 0; i < a.rows(); i++) {
            for (size_t j = 0; j < a.cols(); j++) {
                out(i, j) = a(i, j) + b(0, j);
            }
        }
        return out;
    }
    if (b.cols() == 1 && b.rows() == a.rows()) {
        Matrix<T> out(a.rows(), a.cols());
        for (size_t i = 0; i < a.rows(); i++) {
            for (size_t j = 0; j < a.cols(); j++) {
                out(i, j) = a(i, j) + b(i, 0);
            }
        }
        return out;
    }
    if (b.rows() == 1 && b.cols() == 1) {
        return a + b(0, 0);
    }
    throw DimensionMismatchException(
        "broadcast_add: incompatible shapes (" + std::to_string(a.rows()) + "x" +
        std::to_string(a.cols()) + ") vs (" + std::to_string(b.rows()) + "x" +
        std::to_string(b.cols()) + ")");
}

} // namespace cyberhex

#endif // CYBERHEX_TENSOR_H

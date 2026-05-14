#ifndef CYBERHEX_MATRIX_H
#define CYBERHEX_MATRIX_H

#include <vector>
#include <stdexcept>
#include <string>
#include <cassert>
#include <type_traits>
#include <memory>
#include <algorithm>
#include <iostream>
#include <iomanip>
#include <cstring>
#include <cmath>
#include <random>

namespace cyberhex {

// ============================================================================
// Exception Hierarchy
// ============================================================================
class CyberHexException : public std::runtime_error {
public:
    explicit CyberHexException(const std::string& msg) : std::runtime_error(msg) {}
};

class DimensionMismatchException : public CyberHexException {
public:
    explicit DimensionMismatchException(const std::string& msg) : CyberHexException(msg) {}
};

class NumericalException : public CyberHexException {
public:
    explicit NumericalException(const std::string& msg) : CyberHexException(msg) {}
};

// ============================================================================
// Matrix<T> — Cache-friendly, row-major matrix with OpenMP parallelism
// ============================================================================
template <typename T = double>
class Matrix {
    static_assert(std::is_arithmetic<T>::value,
        "Matrix<T>: T must be an arithmetic type (float, double, int, etc.).");

public:
    // --- Constructors / Destructor ---
    Matrix() noexcept : rows_(0), cols_(0), size_(0), data_(nullptr), owned_(true) {}

    explicit Matrix(size_t r, size_t c, T val = T(0))
        : rows_(r), cols_(c), size_(r * c)
    {
        if (size_ > 0) {
            data_ = static_cast<T*>(aligned_alloc(64, size_ * sizeof(T)));
            if (!data_) throw std::bad_alloc();
            std::fill(data_, data_ + size_, val);
        } else {
            data_ = nullptr;
        }
        owned_ = true;
    }

    // View constructor (non-owning)
    Matrix(size_t r, size_t c, T* data, bool owned = false) noexcept
        : rows_(r), cols_(c), size_(r * c), data_(data), owned_(owned) {}

    // Copy constructor
    Matrix(const Matrix& other) : rows_(other.rows_), cols_(other.cols_), size_(other.size_) {
        if (size_ > 0) {
            data_ = static_cast<T*>(aligned_alloc(64, size_ * sizeof(T)));
            if (!data_) throw std::bad_alloc();
            std::memcpy(data_, other.data_, size_ * sizeof(T));
        } else {
            data_ = nullptr;
        }
        owned_ = true;
    }

    // Move constructor
    Matrix(Matrix&& other) noexcept
        : rows_(other.rows_), cols_(other.cols_), size_(other.size_),
          data_(other.data_), owned_(other.owned_)
    {
        other.rows_ = 0;
        other.cols_ = 0;
        other.size_ = 0;
        other.data_ = nullptr;
        other.owned_ = true;
    }

    // Destructor
    ~Matrix() {
        if (owned_ && data_) {
            std::free(data_);
        }
    }

    // Copy-and-swap assignment
    Matrix& operator=(Matrix other) {
        swap(other);
        return *this;
    }

    void swap(Matrix& other) noexcept {
        std::swap(rows_, other.rows_);
        std::swap(cols_, other.cols_);
        std::swap(size_, other.size_);
        std::swap(data_, other.data_);
        std::swap(owned_, other.owned_);
    }

    // --- Accessors ---
    size_t rows() const noexcept { return rows_; }
    size_t cols() const noexcept { return cols_; }
    size_t size() const noexcept { return size_; }
    bool empty() const noexcept { return size_ == 0; }
    T* data() noexcept { return data_; }
    const T* data() const noexcept { return data_; }

    // Element access with bounds checking (debug)
    inline T& operator()(size_t r, size_t c) {
        assert(r < rows_ && "Row index out of bounds");
        assert(c < cols_ && "Col index out of bounds");
        return data_[r * cols_ + c];
    }

    inline const T& operator()(size_t r, size_t c) const {
        assert(r < rows_ && "Row index out of bounds");
        assert(c < cols_ && "Col index out of bounds");
        return data_[r * cols_ + c];
    }

    // Flat indexing
    inline T& at(size_t i) {
        assert(i < size_ && "Flat index out of bounds");
        return data_[i];
    }

    inline const T& at(size_t i) const {
        assert(i < size_ && "Flat index out of bounds");
        return data_[i];
    }

    // Row access
    T* row(size_t r) {
        assert(r < rows_ && "Row index out of bounds");
        return data_ + r * cols_;
    }

    const T* row(size_t r) const {
        assert(r < rows_ && "Row index out of bounds");
        return data_ + r * cols_;
    }

    // --- Reshape ---
    void reshape(size_t r, size_t c) {
        if (r * c != size_) {
            throw DimensionMismatchException(
                "reshape: new dimensions must match current size (" +
                std::to_string(size_) + ")");
        }
        rows_ = r;
        cols_ = c;
    }

    // --- Fill / Set ---
    void fill(T val) {
        std::fill(data_, data_ + size_, val);
    }

    void set_row(size_t r, const std::vector<T>& vals) {
        assert(r < rows_ && "Row index out of bounds");
        assert(vals.size() == cols_ && "Row size mismatch");
        std::copy(vals.begin(), vals.end(), data_ + r * cols_);
    }

    void set_col(size_t c, const std::vector<T>& vals) {
        assert(c < cols_ && "Col index out of bounds");
        assert(vals.size() == rows_ && "Col size mismatch");
        for (size_t i = 0; i < rows_; i++) {
            data_[i * cols_ + c] = vals[i];
        }
    }

    // --- Matrix Operations ---
    Matrix dot(const Matrix& other) const;
    Matrix transpose() const;
    Matrix T() const { return transpose(); }

    // Element-wise operations
    Matrix operator+(const Matrix& other) const;
    Matrix operator-(const Matrix& other) const;
    Matrix operator*(const Matrix& other) const;  // element-wise
    Matrix operator/(const Matrix& other) const;  // element-wise

    // Scalar operations
    Matrix operator+(T scalar) const;
    Matrix operator-(T scalar) const;
    Matrix operator*(T scalar) const;
    Matrix operator/(T scalar) const;

    // In-place operations
    Matrix& operator+=(const Matrix& other);
    Matrix& operator-=(const Matrix& other);
    Matrix& operator*=(T scalar);
    Matrix& operator/=(T scalar);

    // Unary operations
    Matrix operator-() const;

    // Comparison
    bool operator==(const Matrix& other) const;
    bool operator!=(const Matrix& other) const { return !(*this == other); }

    // --- Apply function ---
    void apply(T (*func)(T));
    void apply(const std::function<T(T)>& func);
    Matrix applied(T (*func)(T)) const;
    Matrix applied(const std::function<T(T)>& func) const;

    // --- Reduction operations ---
    T sum() const;
    T mean() const;
    T max() const;
    T min() const;
    T norm() const;        // Frobenius norm
    T squared_norm() const;

    // Row/column reductions
    Matrix row_sum() const;
    Matrix col_sum() const;
    Matrix row_mean() const;
    Matrix col_mean() const;
    Matrix row_max() const;
    Matrix col_max() const;

    // --- Statistical operations ---
    static Matrix random(size_t r, size_t c, T mean = T(0), T stddev = T(1));
    static Matrix uniform(size_t r, size_t c, T low = T(0), T high = T(1));
    static Matrix identity(size_t n);
    static Matrix ones(size_t r, size_t c);
    static Matrix zeros(size_t r, size_t c);

    // --- Submatrix / slicing ---
    Matrix slice(size_t row_start, size_t row_end, size_t col_start, size_t col_end) const;
    Matrix row_slice(size_t start, size_t count) const;
    Matrix col_slice(size_t start, size_t count) const;

    // --- Debug ---
    void print(const std::string& name = "", int precision = 6) const;
    double relative_error(const Matrix& other) const;

private:
    size_t rows_ = 0;
    size_t cols_ = 0;
    size_t size_ = 0;
    T* data_ = nullptr;
    bool owned_ = true;

    // Aligned allocation
    static void* aligned_alloc(size_t alignment, size_t size) {
        void* ptr = nullptr;
        if (posix_memalign(&ptr, alignment, size) != 0) {
            throw std::bad_alloc();
        }
        return ptr;
    }
};

// ============================================================================
// Dot Product Implementation — Cache-blocked, OpenMP-parallelized
// ============================================================================
template <typename T>
Matrix<T> Matrix<T>::dot(const Matrix<T>& other) const {
    if (cols_ != other.rows_) {
        throw DimensionMismatchException(
            "Matrix dot: cols (" + std::to_string(cols_) + ") != other.rows (" +
            std::to_string(other.rows_) + ")");
    }

    Matrix<T> result(rows_, other.cols_, T(0));
    const size_t M = rows_, N = other.cols_, K = cols_;

    // Cache blocking parameters
    const size_t BLOCK_M = 64;
    const size_t BLOCK_N = 64;
    const size_t BLOCK_K = 256;

    #pragma omp parallel for collapse(2) if(M * N * K > 100000)
    for (size_t i0 = 0; i0 < M; i0 += BLOCK_M) {
        for (size_t j0 = 0; j0 < N; j0 += BLOCK_N) {
            size_t imax = std::min(i0 + BLOCK_M, M);
            size_t jmax = std::min(j0 + BLOCK_N, N);

            for (size_t k0 = 0; k0 < K; k0 += BLOCK_K) {
                size_t kmax = std::min(k0 + BLOCK_K, K);

                for (size_t i = i0; i < imax; i++) {
                    const T* a_row = data_ + i * K;
                    T* c_row = result.data_ + i * N;

                    for (size_t k = k0; k < kmax; k++) {
                        T aik = a_row[k];
                        const T* b_row = other.data_ + k * N;
                        #pragma omp simd
                        for (size_t j = j0; j < jmax; j++) {
                            c_row[j] += aik * b_row[j];
                        }
                    }
                }
            }
        }
    }

    return result;
}

// ============================================================================
// Transpose — Cache-blocked
// ============================================================================
template <typename T>
Matrix<T> Matrix<T>::transpose() const {
    Matrix<T> t(cols_, rows_);
    const size_t BLOCK = 64;

    #pragma omp parallel for collapse(2) if(rows_ * cols_ > 10000)
    for (size_t i = 0; i < rows_; i += BLOCK) {
        for (size_t j = 0; j < cols_; j += BLOCK) {
            size_t i_max = std::min(i + BLOCK, rows_);
            size_t j_max = std::min(j + BLOCK, cols_);
            for (size_t ii = i; ii < i_max; ii++) {
                #pragma omp simd
                for (size_t jj = j; jj < j_max; jj++) {
                    t(jj, ii) = data_[ii * cols_ + jj];
                }
            }
        }
    }

    return t;
}

// ============================================================================
// Element-wise arithmetic operations
// ============================================================================
template <typename T>
Matrix<T> Matrix<T>::operator+(const Matrix<T>& other) const {
    if (rows_ != other.rows_ || cols_ != other.cols_) {
        throw DimensionMismatchException(
            "Matrix addition: dimension mismatch (" +
            std::to_string(rows_) + "x" + std::to_string(cols_) + " vs " +
            std::to_string(other.rows_) + "x" + std::to_string(other.cols_) + ")");
    }
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = data_[i] + other.data_[i];
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::operator-(const Matrix<T>& other) const {
    if (rows_ != other.rows_ || cols_ != other.cols_) {
        throw DimensionMismatchException("Matrix subtraction: dimension mismatch");
    }
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = data_[i] - other.data_[i];
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::operator*(const Matrix<T>& other) const {
    if (rows_ != other.rows_ || cols_ != other.cols_) {
        throw DimensionMismatchException("Matrix element-wise multiply: dimension mismatch");
    }
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = data_[i] * other.data_[i];
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::operator/(const Matrix<T>& other) const {
    if (rows_ != other.rows_ || cols_ != other.cols_) {
        throw DimensionMismatchException("Matrix element-wise divide: dimension mismatch");
    }
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = data_[i] / other.data_[i];
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::operator+(T scalar) const {
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = data_[i] + scalar;
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::operator-(T scalar) const {
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = data_[i] - scalar;
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::operator*(T scalar) const {
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = data_[i] * scalar;
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::operator/(T scalar) const {
    if (scalar == T(0)) {
        throw NumericalException("Division by zero");
    }
    Matrix<T> r(rows_, cols_);
    T inv = T(1) / scalar;
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = data_[i] * inv;
    }
    return r;
}

template <typename T>
Matrix<T>& Matrix<T>::operator+=(const Matrix<T>& other) {
    if (rows_ != other.rows_ || cols_ != other.cols_) {
        throw DimensionMismatchException("Matrix +=: dimension mismatch");
    }
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        data_[i] += other.data_[i];
    }
    return *this;
}

template <typename T>
Matrix<T>& Matrix<T>::operator-=(const Matrix<T>& other) {
    if (rows_ != other.rows_ || cols_ != other.cols_) {
        throw DimensionMismatchException("Matrix -=: dimension mismatch");
    }
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        data_[i] -= other.data_[i];
    }
    return *this;
}

template <typename T>
Matrix<T>& Matrix<T>::operator*=(T scalar) {
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        data_[i] *= scalar;
    }
    return *this;
}

template <typename T>
Matrix<T>& Matrix<T>::operator/=(T scalar) {
    if (scalar == T(0)) {
        throw NumericalException("Division by zero");
    }
    T inv = T(1) / scalar;
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        data_[i] *= inv;
    }
    return *this;
}

template <typename T>
Matrix<T> Matrix<T>::operator-() const {
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = -data_[i];
    }
    return r;
}

template <typename T>
bool Matrix<T>::operator==(const Matrix<T>& other) const {
    if (rows_ != other.rows_ || cols_ != other.cols_) return false;
    for (size_t i = 0; i < size_; i++) {
        if (std::abs(data_[i] - other.data_[i]) > T(1e-10)) return false;
    }
    return true;
}

// ============================================================================
// Apply functions
// ============================================================================
template <typename T>
void Matrix<T>::apply(T (*func)(T)) {
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        data_[i] = func(data_[i]);
    }
}

template <typename T>
void Matrix<T>::apply(const std::function<T(T)>& func) {
    #pragma omp parallel for if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        data_[i] = func(data_[i]);
    }
}

template <typename T>
Matrix<T> Matrix<T>::applied(T (*func)(T)) const {
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for simd if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = func(data_[i]);
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::applied(const std::function<T(T)>& func) const {
    Matrix<T> r(rows_, cols_);
    #pragma omp parallel for if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        r.data_[i] = func(data_[i]);
    }
    return r;
}

// ============================================================================
// Reduction operations
// ============================================================================
template <typename T>
T Matrix<T>::sum() const {
    T s = T(0);
    #pragma omp parallel for reduction(+:s) if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        s += data_[i];
    }
    return s;
}

template <typename T>
T Matrix<T>::mean() const {
    return sum() / static_cast<T>(size_);
}

template <typename T>
T Matrix<T>::max() const {
    T m = data_[0];
    #pragma omp parallel for reduction(max:m) if(size_ > 10000)
    for (size_t i = 1; i < size_; i++) {
        if (data_[i] > m) m = data_[i];
    }
    return m;
}

template <typename T>
T Matrix<T>::min() const {
    T m = data_[0];
    #pragma omp parallel for reduction(min:m) if(size_ > 10000)
    for (size_t i = 1; i < size_; i++) {
        if (data_[i] < m) m = data_[i];
    }
    return m;
}

template <typename T>
T Matrix<T>::squared_norm() const {
    T s = T(0);
    #pragma omp parallel for reduction(+:s) if(size_ > 10000)
    for (size_t i = 0; i < size_; i++) {
        s += data_[i] * data_[i];
    }
    return s;
}

template <typename T>
T Matrix<T>::norm() const {
    return std::sqrt(squared_norm());
}

template <typename T>
Matrix<T> Matrix<T>::row_sum() const {
    Matrix<T> r(rows_, 1, T(0));
    for (size_t i = 0; i < rows_; i++) {
        T s = T(0);
        for (size_t j = 0; j < cols_; j++) {
            s += data_[i * cols_ + j];
        }
        r(i, 0) = s;
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::col_sum() const {
    Matrix<T> r(1, cols_, T(0));
    for (size_t j = 0; j < cols_; j++) {
        T s = T(0);
        for (size_t i = 0; i < rows_; i++) {
            s += data_[i * cols_ + j];
        }
        r(0, j) = s;
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::row_mean() const {
    Matrix<T> r(rows_, 1, T(0));
    for (size_t i = 0; i < rows_; i++) {
        T s = T(0);
        for (size_t j = 0; j < cols_; j++) {
            s += data_[i * cols_ + j];
        }
        r(i, 0) = s / static_cast<T>(cols_);
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::col_mean() const {
    Matrix<T> r(1, cols_, T(0));
    for (size_t j = 0; j < cols_; j++) {
        T s = T(0);
        for (size_t i = 0; i < rows_; i++) {
            s += data_[i * cols_ + j];
        }
        r(0, j) = s / static_cast<T>(rows_);
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::row_max() const {
    Matrix<T> r(rows_, 1);
    for (size_t i = 0; i < rows_; i++) {
        T m = data_[i * cols_];
        for (size_t j = 1; j < cols_; j++) {
            if (data_[i * cols_ + j] > m) m = data_[i * cols_ + j];
        }
        r(i, 0) = m;
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::col_max() const {
    Matrix<T> r(1, cols_);
    for (size_t j = 0; j < cols_; j++) {
        T m = data_[j];
        for (size_t i = 1; i < rows_; i++) {
            if (data_[i * cols_ + j] > m) m = data_[i * cols_ + j];
        }
        r(0, j) = m;
    }
    return r;
}

// ============================================================================
// Static factory methods
// ============================================================================
template <typename T>
Matrix<T> Matrix<T>::random(size_t r, size_t c, T mean, T stddev) {
    Matrix<T> m(r, c);
    std::random_device rd;
    std::mt19937_64 gen(rd());
    std::normal_distribution<T> dist(mean, stddev);
    for (size_t i = 0; i < m.size_; i++) {
        m.data_[i] = dist(gen);
    }
    return m;
}

template <typename T>
Matrix<T> Matrix<T>::uniform(size_t r, size_t c, T low, T high) {
    Matrix<T> m(r, c);
    std::random_device rd;
    std::mt19937_64 gen(rd());
    std::uniform_real_distribution<T> dist(low, high);
    for (size_t i = 0; i < m.size_; i++) {
        m.data_[i] = dist(gen);
    }
    return m;
}

template <typename T>
Matrix<T> Matrix<T>::identity(size_t n) {
    Matrix<T> m(n, n, T(0));
    for (size_t i = 0; i < n; i++) {
        m(i, i) = T(1);
    }
    return m;
}

template <typename T>
Matrix<T> Matrix<T>::ones(size_t r, size_t c) {
    return Matrix<T>(r, c, T(1));
}

template <typename T>
Matrix<T> Matrix<T>::zeros(size_t r, size_t c) {
    return Matrix<T>(r, c, T(0));
}

// ============================================================================
// Slicing
// ============================================================================
template <typename T>
Matrix<T> Matrix<T>::slice(size_t row_start, size_t row_end,
                            size_t col_start, size_t col_end) const {
    assert(row_start < row_end && row_end <= rows_ &&
           col_start < col_end && col_end <= cols_);
    size_t new_rows = row_end - row_start;
    size_t new_cols = col_end - col_start;
    Matrix<T> r(new_rows, new_cols);
    for (size_t i = 0; i < new_rows; i++) {
        for (size_t j = 0; j < new_cols; j++) {
            r(i, j) = data_[(row_start + i) * cols_ + (col_start + j)];
        }
    }
    return r;
}

template <typename T>
Matrix<T> Matrix<T>::row_slice(size_t start, size_t count) const {
    return slice(start, start + count, 0, cols_);
}

template <typename T>
Matrix<T> Matrix<T>::col_slice(size_t start, size_t count) const {
    return slice(0, rows_, start, start + count);
}

// ============================================================================
// Print
// ============================================================================
template <typename T>
void Matrix<T>::print(const std::string& name, int precision) const {
    if (!name.empty()) {
        std::cout << name << " (" << rows_ << "x" << cols_ << "):" << std::endl;
    }
    std::cout << std::fixed << std::setprecision(precision);
    for (size_t i = 0; i < std::min(rows_, size_t(10)); i++) {
        std::cout << "[";
        for (size_t j = 0; j < std::min(cols_, size_t(10)); j++) {
            std::cout << std::setw(precision + 3) << data_[i * cols_ + j];
            if (j < std::min(cols_, size_t(10)) - 1) std::cout << ", ";
        }
        if (cols_ > 10) std::cout << ", ...";
        std::cout << "]" << std::endl;
    }
    if (rows_ > 10) std::cout << "..." << std::endl;
}

template <typename T>
double Matrix<T>::relative_error(const Matrix& other) const {
    if (rows_ != other.rows_ || cols_ != other.cols_) {
        return std::numeric_limits<double>::infinity();
    }
    T diff_norm = T(0);
    T norm_val = T(0);
    for (size_t i = 0; i < size_; i++) {
        T d = data_[i] - other.data_[i];
        diff_norm += d * d;
        norm_val += other.data_[i] * other.data_[i];
    }
    if (norm_val == T(0)) return diff_norm > T(0) ? 1.0 : 0.0;
    return static_cast<double>(std::sqrt(diff_norm / norm_val));
}

// ============================================================================
// Legacy helper functions (preserved for backwards compatibility)
// ============================================================================
std::vector<double> solve_AX_eq_B(std::vector<std::vector<double>> A, std::vector<double> B);
double det(std::vector<std::vector<double>> A);
void removeRowColumn(const std::vector<std::vector<double>>& A, size_t row, size_t column, std::vector<std::vector<double>>& ret);

} // namespace cyberhex

#endif // CYBERHEX_MATRIX_H
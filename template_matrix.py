import os
import re

src_dir = "/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules"

files = []
for root, dirs, filenames in os.walk(src_dir):
    for f in filenames:
        if f.endswith(".cpp") or f.endswith(".h"):
            files.append(os.path.join(root, f))

# Read matrix.h
matrix_h_path = os.path.join(src_dir, "include/matrix.h")
with open(matrix_h_path, "r") as f:
    text = f.read()

# Replace class Matrix with template <typename T> class Matrix
# And double inside Matrix with T
# But only inside Matrix!
# Wait, let's just make it template <typename T> class Matrix
text = re.sub(r"class Matrix \{", "template <typename T=double>\nclass Matrix {", text)
text = re.sub(r"std::vector<double> data;", "std::vector<T> data;", text)
text = re.sub(r"inline double& operator\(\)\(size_t r, size_t c\)", "inline T& operator()(size_t r, size_t c)", text)
text = re.sub(r"inline const double& operator\(\)\(size_t r, size_t c\) const", "inline const T& operator()(size_t r, size_t c) const", text)
text = re.sub(r"Matrix\(size_t r, size_t c, double val = 0\.0\);", "Matrix(size_t r, size_t c, T val = 0.0);", text)
text = re.sub(r"Matrix operator\*\((?:double|T) scalar\) const;", "Matrix operator*(T scalar) const;", text)

with open(matrix_h_path, "w") as f:
    f.write(text)

# Read matrix.cpp
matrix_cpp_path = os.path.join(src_dir, "src/matrix.cpp")
with open(matrix_cpp_path, "r") as f:
    text = f.read()

# Replace Matrix:: with template <typename T> Matrix<T>::
text = re.sub(r"Matrix::", "template <typename T>\nMatrix<T>::", text)
text = re.sub(r"template <typename T>\ntemplate <typename T>\nMatrix<T>::", "template <typename T>\nMatrix<T>::", text) # fix doubles
text = re.sub(r"Matrix\(size_t r, size_t c, double val\)", "Matrix(size_t r, size_t c, T val)", text)
text = re.sub(r"Matrix<T>::Matrix\(Matrix&& other\)", "Matrix<T>::Matrix(Matrix<T>&& other)", text)
text = re.sub(r"Matrix<T>::operator=\(Matrix other\)", "Matrix<T>::operator=(Matrix<T> other)", text)
text = re.sub(r"swap\(Matrix& other\)", "swap(Matrix<T>& other)", text)
text = re.sub(r"Matrix<T>::dot\(const Matrix& other\) const", "Matrix<T>::dot(const Matrix<T>& other) const", text)
text = re.sub(r"Matrix<T>::operator\+\(const Matrix& other\) const", "Matrix<T>::operator+(const Matrix<T>& other) const", text)
text = re.sub(r"Matrix<T>::operator\-\(const Matrix& other\) const", "Matrix<T>::operator-(const Matrix<T>& other) const", text)
text = re.sub(r"Matrix<T>::operator\*\((?:double|T) scalar\) const", "Matrix<T>::operator*(T scalar) const", text)

# add explicit template instantiation at end
text += "\ntemplate class Matrix<double>;\ntemplate class Matrix<float>;\n"

# wait dot returns Matrix, should return Matrix<T> inside template?
# In C++ inside `template <typename T> Matrix<T>::dot`, `Matrix` refers to `Matrix<T>`. But returning `Matrix` works, though `Matrix<T>` is safer.
text = re.sub(r"Matrix template <typename T>\nMatrix<T>::", "template <typename T>\nMatrix<T> Matrix<T>::", text)
text = re.sub(r"Matrix& template <typename T>\nMatrix<T>::", "template <typename T>\nMatrix<T>& Matrix<T>::", text)
text = re.sub(r"void template <typename T>\nMatrix<T>::", "template <typename T>\nvoid Matrix<T>::", text)

with open(matrix_cpp_path, "w") as f:
    f.write(text)


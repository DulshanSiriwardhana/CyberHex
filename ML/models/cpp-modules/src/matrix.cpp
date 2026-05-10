#include "matrix.h"
#include <iostream>

using namespace std;

Matrix::Matrix() : rows(0), cols(0), matrix(0, std::vector<double>(0, 0.0)) {}

Matrix::Matrix(int r, int c, double val) : rows(r), cols(c), matrix(r, std::vector<double>(c, val)) {}

Matrix Matrix::dot(const Matrix& other) const {
    if (cols != other.rows) {
        throw std::invalid_argument("Matrix dot product dimension mismatch");
    }
    Matrix result(rows, other.cols, 0.0);

    for (int i = 0; i < rows; i++)
        for (int j = 0; j < other.cols; j++)
            for (int k = 0; k < cols; k++)
                result.matrix[i][j] += matrix[i][k] * other.matrix[k][j];

    return result;
}

Matrix Matrix::transpose() const {
    Matrix t(cols, rows);

    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            t.matrix[j][i] = matrix[i][j];

    return t;
}

Matrix Matrix::operator+(const Matrix& other) const {
    if (rows != other.rows || cols != other.cols) {
        throw std::invalid_argument("Matrix addition dimension mismatch");
    }
    Matrix r(rows, cols);

    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            r.matrix[i][j] = matrix[i][j] + other.matrix[i][j];

    return r;
}

Matrix Matrix::operator-(const Matrix& other) const {
    if (rows != other.rows || cols != other.cols) {
        throw std::invalid_argument("Matrix subtraction dimension mismatch");
    }
    Matrix r(rows, cols);

    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            r.matrix[i][j] = matrix[i][j] - other.matrix[i][j];

    return r;
}

Matrix Matrix::operator*(double scalar) const {
    Matrix r(rows, cols);

    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            r.matrix[i][j] = matrix[i][j] * scalar;

    return r;
}

void Matrix::apply(double (*func)(double)) {
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            matrix[i][j] = func(matrix[i][j]);
}

void Matrix::print() const {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }
}

void removeRowColumn(double** &A, int row, int column, int size, double** &ret){
    for(int i=0;i<size-1;i++){
        for(int j=0;j<size-1;j++){
            if(j>=column){
                if(i>=row){
                    ret[i][j] = A[i+1][j+1];
                }
                else{
                    ret[i][j] = A[i][j+1];
                }
            }
            else{
                if(i>=row){
                    ret[i][j] = A[i+1][j];
                }
                else{
                    ret[i][j] = A[i][j];
                }
            }
        }
    }
}

double det2x2(double** &A){
    return A[0][0]*A[1][1] - A[0][1]*A[1][0];
}

double det(double** &A, int size){
    if(size == 0) return 0;
    if(size == 1) return A[0][0];

    double** temp = new double*[size];
    for (int i = 0; i < size; i++) {
        temp[i] = new double[size];
        for (int j = 0; j < size; j++) temp[i][j] = A[i][j];
    }

    double d = 1.0;
    for (int i = 0; i < size; i++) {
        int pivot = i;
        for (int j = i + 1; j < size; j++) {
            if (std::abs(temp[j][i]) > std::abs(temp[pivot][i])) {
                pivot = j;
            }
        }
        if (pivot != i) {
            std::swap(temp[i], temp[pivot]);
            d = -d;
        }
        if (temp[i][i] == 0) {
            d = 0;
            break;
        }

        d *= temp[i][i];
        for (int j = i + 1; j < size; j++) {
            double factor = temp[j][i] / temp[i][i];
            for (int k = i + 1; k < size; k++) {
                temp[j][k] -= factor * temp[i][k];
            }
        }
    }

    for (int i = 0; i < size; i++) delete[] temp[i];
    delete[] temp;

    return d;
}

void replaceRow(double** &A, int row, int size, double*  replacingRow, double** &ret){
    for(int i=0;i<size;i++){
        for(int j=0;j<size;j++){
            if(i == row){
                ret[i][j] = replacingRow[j];
            }
            else{
                ret[i][j] = A[i][j];
            }
        }
    }
}

void replaceColumn(double** &A, int column, int size, double*  replacingColumn, double** &ret){
    for(int i=0;i<size;i++){
        for(int j=0;j<size;j++){
            if(j == column){
                ret[i][j] = replacingColumn[i];
            }
            else{
                ret[i][j] = A[i][j];
            }
        }
    }
}

void solve_AX_eq_B(double** &A, double* X, double* B, int size){
    double** M = new double*[size];
    for (int i = 0; i < size; i++) {
        M[i] = new double[size + 1];
        for (int j = 0; j < size; j++) M[i][j] = A[i][j];
        M[i][size] = B[i];
    }

    for (int i = 0; i < size; i++) {
        int pivot = i;
        for (int j = i + 1; j < size; j++) {
            if (std::abs(M[j][i]) > std::abs(M[pivot][i])) {
                pivot = j;
            }
        }
        if (pivot != i) std::swap(M[i], M[pivot]);
        
        if (M[i][i] == 0) {
            std::cerr << "Singular matrix detected in solve_AX_eq_B\n";
            for(int k=0; k<size; k++) X[k] = 0;
            break;
        }

        double diag = M[i][i];
        for (int j = i; j <= size; j++) M[i][j] /= diag;

        for (int j = 0; j < size; j++) {
            if (i != j) {
                double factor = M[j][i];
                for (int k = i; k <= size; k++) {
                    M[j][k] -= factor * M[i][k];
                }
            }
        }
    }

    for (int i = 0; i < size; i++) X[i] = M[i][size];

    for (int i = 0; i < size; i++) delete[] M[i];
    delete[] M;
}

void multiply_matrices(double** &A, double** &B, int* dimensions, double** &ret){
    for(int i=0;i<dimensions[0];i++){
        //int row = i;
        for(int j=0;j<dimensions[3];j++){
            //int column = j;
            double value = 0;
            for(int k=0;k<dimensions[1];k++){
                //int posX = dimensions[1] * i + k;
                //int posY = dimensions[2] * k + j;
                value += A[i][k] * B[k][j];
            }
            ret[i][j] = value;
        }
    }
}
#ifndef MATRIX_H
#define MATRIX_H



#include <vector>

class Matrix {
    public:
        int rows;
        int cols;
        std::vector<std::vector<double>> matrix;

        Matrix();
        Matrix(int r, int c, double val = 0.0);
        
        Matrix dot(const Matrix& other) const;
        Matrix transpose() const;

        Matrix operator+(const Matrix& other) const;
        Matrix operator-(const Matrix& other) const;
        Matrix operator*(double scalar) const;

        void apply(double (*func)(double));
        void print() const;
};

void removeRowColumn(double** &A, int row, int column, int size, double** &ret);
double det2x2(double** &A);
double det(double** &A, int size);
void replaceRow(double** &A, int row, int size, double*  replacingRow, double** &ret);
void replaceColumn(double** &A, int column, int size, double*  replacingColumn, double** &ret);
void solve_AX_eq_B(double** &A, double* X, double* B, int size);
void multiply_matrices(double** &A, double** &B, int* dimensions, double** &ret);

#endif
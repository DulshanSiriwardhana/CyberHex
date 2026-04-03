#ifndef MATRIX_H
#define MATRIX_H

void removeRowColumn(double** &A, int row, int column, int size, double** &ret);
double det2x2(double** &A);
double det(double** &A, int size);
void replaceRow(double** &A, int row, int size, double*  replacingRow, double** &ret);
void replaceColumn(double** &A, int column, int size, double*  replacingColumn, double** &ret);
void solve_AX_eq_B(double** &A, double* X, double* B, int size);

#endif
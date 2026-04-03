#ifndef MATRIX_H
#define MATRIX_H

void removeRowColumn(double* double A, int row, int column, int size, double* double* ret);
double det2x2(double* double A);
double det(double* double* A, int size);
void replaceRow(double* double A, int row, int size, double*  relacingRow, double* double* ret);
void solve_AX_eq_B(double* double* A, double* X, double* B, int size);

#endif
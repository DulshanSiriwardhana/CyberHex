#include "iostream"
#include "higher_maths.h"
#include "basic_maths.h"
#include "stat.h"
#include "machine_learning_algorithms.h"
#include "matrix.h"

using namespace std;

int main() {
    double arrayX[3] = {1,2,4};
    double arrayY[3] = {1,2,3};
    double* n = new double[2];

    double** A = new double*[2];
    A[0] = new double[2];
    A[1] = new double[2];

    A[0][0] = 1;
    A[0][1] = 2;
    A[1][0] = 1;
    A[1][1] = 1;

    double X[2];
    double B[2] = {3,2};
    solve_AX_eq_B(A, X, B, 2);
    //linear_regression_data(arrayX, arrayY, 3, n);
    cout << X[0] << " " << X[1] << endl;
    return 0;
}
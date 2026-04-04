#include "iostream"
#include "higher_maths.h"
#include "basic_maths.h"
#include "stat.h"
#include "machine_learning_algorithms.h"
#include "matrix.h"

using namespace std;

int main() {
    double arrayX[3] = {1,2,3};
    double arrayY[3] = {1,4,9};
    double* n = new double[4];

    // double** A = new double*[3];
    // A[0] = new double[3];
    // A[1] = new double[3];
    // A[2] = new double[3];

    // A[0][0] = 1;
    // A[0][1] = 1;
    // A[0][2] = 1;
    // A[1][0] = 2;
    // A[1][1] = 2;
    // A[1][2] = 1;
    // A[2][0] = 3;
    // A[2][1] = 1;
    // A[2][2] = 1;

    // double X[3];
    // double B[3] = {3,4,3};
    // solve_AX_eq_B(A, X, B, 3);
    // linear_regression_data(arrayX, arrayY, 3, n);
    k_degree_polynomial_regression_data(arrayX, arrayY, 3, 3, n);
    double distance = euclid_distance(arrayX, arrayY, 3);
    double x = power(3.0,0.5);
    cout << x << " " << n[1] << " " << n[2] << " " << n[3] <<endl;
    return 0;
}
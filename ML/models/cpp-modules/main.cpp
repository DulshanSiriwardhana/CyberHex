#include "iostream"
#include "higher_maths.h"
#include "basic_maths.h"
#include "stat.h"
#include "machine_learning_algorithms.h"
#include "matrix.h"
#include "io.h"
#include "types.h"

using namespace std;

int main() {
    // double arrayX[3] = {1,2,3};
    // double arrayY[3] = {1,4,9};
    // double* n = new double[4];

    // // double** A = new double*[3];
    // // A[0] = new double[3];
    // // A[1] = new double[3];
    // // A[2] = new double[3];

    // // A[0][0] = 1;
    // // A[0][1] = 1;
    // // A[0][2] = 1;
    // // A[1][0] = 2;
    // // A[1][1] = 2;
    // // A[1][2] = 1;
    // // A[2][0] = 3;
    // // A[2][1] = 1;
    // // A[2][2] = 1;

    // // double X[3];
    // // double B[3] = {3,4,3};
    // // solve_AX_eq_B(A, X, B, 3);
    // // linear_regression_data(arrayX, arrayY, 3, n);
    // k_degree_polynomial_regression_data(arrayX, arrayY, 3, 3, n);
    // double distance = euclid_distance(arrayX, arrayY, 3);
    // double x = power(3.0,0.5);
    // cout << x << " " << n[1] << " " << n[2] << " " << n[3] <<endl;

    double array[10] = {9,8.0,7.0,6.0,5.0,4.0,3.0,2.0,1.0,0.0};
    selection_sort(array, 10);
    print_array(array, 10);

    labeledDataPoint data[10];

    for (int i = 0; i < 10; i++) {
        data[i].label = (double) ((i*2%3) + 0.1);
        data[i].point = new double[4]{(double) i,(double) i*i,(double) i-1,(double) i/2.0};
    }
    for (int i = 0; i < 10; i++) {
        cout<<data[i].label;
        print_array(data[i].point, 4);
    }

    double point[4] = {1,2,3,4};

    int ret = knn(data, 10, 4, 6, point, 1);
    cout<<ret<<endl;
    return 0;
}
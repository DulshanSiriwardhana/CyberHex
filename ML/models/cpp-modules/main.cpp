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
    // // double arrayX[3] = {1,2,3};
    // // double arrayY[3] = {1,4,9};
    // // double* n = new double[4];

    // // // double** A = new double*[3];
    // // // A[0] = new double[3];
    // // // A[1] = new double[3];
    // // // A[2] = new double[3];

    // // // A[0][0] = 1;
    // // // A[0][1] = 1;
    // // // A[0][2] = 1;
    // // // A[1][0] = 2;
    // // // A[1][1] = 2;
    // // // A[1][2] = 1;
    // // // A[2][0] = 3;
    // // // A[2][1] = 1;
    // // // A[2][2] = 1;

    // // // double X[3];
    // // // double B[3] = {3,4,3};
    // // // solve_AX_eq_B(A, X, B, 3);
    // // // linear_regression_data(arrayX, arrayY, 3, n);
    // // k_degree_polynomial_regression_data(arrayX, arrayY, 3, 3, n);
    // // double distance = euclid_distance(arrayX, arrayY, 3);
    // // double x = power(3.0,0.5);
    // // cout << x << " " << n[1] << " " << n[2] << " " << n[3] <<endl;

    // double array[10] = {9,8.0,7.0,6.0,5.0,4.0,3.0,2.0,1.0,0.0};
    // selection_sort(array, 10);
    // print_array(array, 10);

    // labeledDataPoint data[100];

    // for (int i = 0; i < 100; i++) {
    //     data[i].label = (double) ((((3-i)*(3-i))%((i) + 1)) + 0.1);
    //     data[i].point = new double[4]{(double) (10-i)*(i+1)*i/13.0,(double) i*i,(double) i-1,(double) i/2.0};
    // }
    // for (int i = 0; i < 100; i++) {
    //     cout<<data[i].label;
    //     print_array(data[i].point, 4);
    // }

    // double point[4] = {1,2,3,4};

    // int ret = knn(data, 100, 4, 6, point, 1);
    // cout<<ret<<endl;


    double** A = new double*[2];
    A[0] = new double[2];
    A[1] = new double[2];

    A[0][0] = 1;
    A[0][1] = 1;
    A[1][0] = 2;
    A[1][1] = 2;

    double** B = new double*[2];
    B[0] = new double[2];
    B[1] = new double[2];

    B[0][0] = 1;
    B[0][1] = 1;
    B[1][0] = 2;
    B[1][1] = 2;

    double** ret =  new double*[2];
    ret[0] = new double[2];
    ret[1] = new double[2];

    int sizes[4] = {2,2,2,2};

    multiply_matrices(A, B, sizes, ret);

    return 0;
}
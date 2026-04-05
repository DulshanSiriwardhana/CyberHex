#include "machine_learning_algorithms.h"
#include "stat.h"
#include "matrix.h"
#include "types.h"
#include "iostream"

using namespace std;

void linear_regression_data(double* dataX, double* dataY, int size, double* return_data){
    double x_mean = calc_mean(dataX, size);
    double y_mean = calc_mean(dataY, size);
    double xy_mean = calc_multiplicative_mean(dataX, dataY, size);
    double x_square_mean = calc_square_mean(dataX, size);

    double alpha = (x_square_mean * y_mean - x_mean * xy_mean)/(x_square_mean - x_mean * x_mean);
    double beta = (xy_mean - y_mean * x_mean)/(x_square_mean - x_mean * x_mean);
    return_data[0] = alpha;
    return_data[1] = beta;
}

void k_degree_polynomial_regression_data(double* dataX, double* dataY, int size, int degree, double* return_data){
    double* xy_means = new double[degree+1];

    double** A = new double*[degree+1];
    for(int i=0;i<=degree;i++){
        A[i] = new double[degree+1];
    }

    xy_means[0] = calc_mean(dataY, size);

    double* temp = new double[2*degree + 1];

    temp[0] = 1;

    for(int i =1; i<=2*degree;i++){
        temp[i] = calc_n_order_mean(dataX, size, i);
    }

    for(int i =0; i<degree;i++){
        for(int j=0; j<degree; j++){
            A[i][j] = temp[i+j];
        }
    }
    
    for(int i=0;i<=degree;i++){
        xy_means[i+1] = calc_n_order_multiplicative_mean(dataX, i+1, dataY, 1, size);
    }

    solve_AX_eq_B(A, return_data, xy_means, degree);
}

void knn(labeledDataPoint* &data, int size, int dimension, int k, double* point, int distance_function){
    struct nearest {
        double dis;
        int label;
    };

    nearest k_nearest[k];

    for(int i=0;i<size){
        if(i<k){
            nearest n = new nearest({
                dis: euclid_distance(data[i].point, point);,
                label: data[i].label;
            })
            k_nearest[i] = n;
        }
        else{
            double dis = euclid_distance(data[i].point, point);

            for(int j=0;j<k;j++){
                if()
            }
        }
    }
}
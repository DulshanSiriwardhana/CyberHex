#include "machine_learning_algorithms.h"
#include "stat.h"

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
    double* x_power_means = new double[2*degree + 1];
    double* xy_means = new double[degree+1];
    x_power_means[0] = 1;
    xy_means[0] = calc_mean(dataY, size);

    for(int i =0; i<2*degree;i++){
        x_power_means[i+1] = calc_n_order_mean(dataX, size, i+1);
    }
    
    for(int i=0;i<degree;i++){
        xy_means[i+1] = calc_n_order_multiplicative_mean(dataX, i+1, dataY, 1, size);
    }
}
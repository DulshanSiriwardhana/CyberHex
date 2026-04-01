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
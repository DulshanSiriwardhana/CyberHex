#ifndef MACHINE_LEARNING_ALGORITHMS_H
#define MACHINE_LEARNING_ALGORITHMS_H
#include "types.h"

void linear_regression_data(double* dataX, double* dataY, int size, double* return_data);
void k_degree_polynomial_regression_data(double* dataX, double* dataY, int size, int degree, double* return_data);
void logistic(double x);
void fittest_polynomial_regression_data();
int knn(labeledDataPoint* data,  int size, int dimension, int k, double* point, int distance_function);

#endif
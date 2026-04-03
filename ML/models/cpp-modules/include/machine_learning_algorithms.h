#ifndef MACHINE_LEARNING_ALGORITHMS_H
#define MACHINE_LEARNING_ALGORITHMS_H

void linear_regression_data(double* dataX, double* dataY, int size, double* return_data);
void k_degree_polynomial_regression_data(double* dataX, double* dataY, int size, int degree, double* return_data);
void logistic(double x);
void fittest_polynomial_regression_data();
void knn(double** &data, int dimension, int k, double* point);

#endif
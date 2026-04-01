#ifndef STAT_H
#define STAT_H

double calc_mean(double* array, int size);
double calc_multiplicative_mean(double* x, double* y, int size);
double calc_square_mean(double* array, int size);
double calc_n_order_mean(double* array, int size, int order);
double calc_n_order_multiplicative_mean(double* x, int x_order, double* y, int y_order, int size);

#endif
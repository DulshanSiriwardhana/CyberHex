#ifndef HIGHER_MATHS_H
#define HIGHER_MATHS_H

double get_e(double error);
double natural_log(double n, double error);
double factorial(int n);
double exp(double n, int error);
double power(double number, double n);
double square_root(double number);
double euclid_distance(double* pointA, double* pointB, int dimension);
double manhattan_distance(double* pointA, double* pointB, int dimension);
double chebyshev_distance(double* pointA, double* pointB);
double minkowski_distance(double* pointA, double* pointB, int dimension, int p);
void bubble_sort(double* array, int size);
void selection_sort(double* array, int size);
void insertion_sort(double* array, int size);
void merge_sort(double* array, int size);
void quick_sort(double* array, int size);
void heap_sort(double* array, int size);
void swap(double* array, int index1, int index2);
double randd();

#endif
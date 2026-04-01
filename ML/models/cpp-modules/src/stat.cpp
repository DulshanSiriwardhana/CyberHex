#include "stat.h"
#include "basic_maths.h"

double calc_mean(double* array, int size){
    double sum = 0.0;
    for(int i =0; i<size; i++){
        sum+=array[i];
    }

    return sum/size;
}

double calc_square_mean(double* array, int size){
    double sum = 0.0;
    for(int i =0;i<size; i++){
        sum+=array[i]*array[i];
    }

    return sum/size;
}

double calc_n_order_mean(double* array, int size, int order){
    double sum = 0.0;
    for(int i=0;i<size;i++){
        int k = order;
        double power = 1.0;
        while(k>0){
            k--;
            power *= array[i];
        }
        sum+=power;
    }

    return sum/size;
}

double calc_multiplicative_mean(double* x, double* y, int size){
    double sum = 0.0;
    for(int i=0; i<size; i++){
        sum+=x[i] * y[i];
    }

    return sum/size;
}

double calc_n_order_multiplicative_mean(double* x, int x_order, double* y, int y_order, int size){
    double sum = 0.0;
    for(int i=0; i<size; i++){
        sum+=pow(x[i], x_order) * pow(y[i], y_order);
    }

    return sum/size;  
}
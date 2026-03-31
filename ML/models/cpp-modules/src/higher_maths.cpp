#include "higher_maths.h"

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
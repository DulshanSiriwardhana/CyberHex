#include "higher_maths.h"
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

// This is only for n between -1 and +1
double natural_log(double n, double error){
    int k = -1;
    int s = 1;
    int old_value = 0;
    double value = -k * pow(n, s)/s;
    while(true){
        k *= -1;
        s++;
        old_value = value;
        value = -k * pow(n, s)/s;

        if (abs(old_value - value) < error){
            break;
        }
    }

    return value;
}

//double exp(double n, int error);
#include "basic_maths.h"

double pow(double number, int n){
    double value = 1;
    for(int i=0;i<n;i++){
        value *=number;
    }

    return value;
}

double abs(double x){
    if(x<=0){
        return -x;
    }
    return x;
}
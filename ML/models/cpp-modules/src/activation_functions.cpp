#include "activation_functions.h"

void full_linear_filter(double* value){
    value = value;
}

void natural_linear_filter(double* value){
    if(value < 0){
        value = 0;
    }
    else{
        value = value;
    }
}

void negative_linear_filter(double* value){
    if(value >= 0){
        value = 0;
    }
    else{
        value = value;
    }
}

void full_sign_filter(double* value){
    if(value < 0 ){
        value = -1;
    }
    else if (value > 0){
        value = 1;
    }
    else{
        value = 0;
    }
}

void inverse_square_normalize_filter(double* value){
    
}
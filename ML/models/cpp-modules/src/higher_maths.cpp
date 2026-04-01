#include "higher_maths.h"
#include "basic_maths.h"

double factorial(int n){
    if(n==1 || n==0){
        return 1;
    }

    return n*factorial(n-1);
}

// This is only for n between -1 and +1
double natural_log(double n, double error){
    int k = -1;
    int s = 1;
    double old_value = 0;
    double value = -1-k * pow(n, s)/s;

    while(true) {
        k *= -1;
        s++;
        old_value = value;
        value -= k * pow(n-1, s)/s;

        if (abs(old_value - value) < error){
            break;
        }
    }

    return value;
}

double exp(double n, int error){
    double value = 1;
    double old_value = 0;

    int k =0;

    while(abs(old_value-value)>error){
        old_value = value;
        k++;

        value += pow(n, k)/factorial(k);
    }

    return value;
}

double get_e(double error){
    return exp(1, error);
}

// calculating power of double numbers
double power(double number, double n){
    double ERROR = 0.000001;
    double e = get_e(ERROR);
    int cost = (int) number/e;
    double up = n*(cost+natural_log((number/e - cost)*e, ERROR));

    return exp(up,ERROR);
}
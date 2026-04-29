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

        if (absolute(old_value - value) < error){
            break;
        }
    }

    return value;
}

double exp(double n, int error){
    double value = 1;
    double old_value = 0;

    int k =0;

    while(absolute(old_value-value)>error){
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
    int cost = 0;
    while(number>1){
        number/=e;
        cost++;
    }
    double up = n*(cost+natural_log(number, ERROR));

    return exp(up, ERROR);
}

double square_root(double number){
    double ERROR = 0.000001;
    double prev = 2;
    double sqrt = number;
    while(absolute(sqrt-prev)>=ERROR){
        double temp = sqrt;
        sqrt = 2*number/(prev+sqrt);
        prev = temp;
    }

    return sqrt;
}

double euclid_distance(double* pointA, double* pointB, int dimension){
    double sum = 0.0;
    for(int i=0;i<dimension;i++){
        sum+=pow(pointA[i]-pointB[i], 2);
    }

    return square_root(sum);
}

double manhattan_distance(double* pointA, double* pointB, int dimension){
    double sum = 0.0;
    for(int i=0;i<dimension;i++){
        sum+=absolute(pointA[i]-pointB[i]);
    }

    return sum;
}

double chebyshev_distance(double* pointA, double* pointB){
    return absolute(pointA[0]-pointB[0]);
}

double minkowski_distance(double* pointA, double* pointB, int dimension, int p){
    double sum = 0.0;
    for(int i=0;i<dimension;i++){
        sum+=pow(pointA[i]-pointB[i], p);
    }

    return power(sum, 1.0/p);
}

void swap(double* array, int index1, int index2){
    array[index1] = array[index1] - array[index2];
    array[index2] = array[index1] + array[index2];
    array[index1] = array[index2] - array[index1];
}

// The Sorting is begun

void bubble_sort(double* array, int size){
    for(int i=0;i<size-1;i++){
        bool isSwapped = false;
        for(int j=0;j<size-1;j++){
            if(array[j+1]<array[j]){
                swap(array, j, j+1);
                isSwapped = true;
            }
        }
        if(!isSwapped){
            break;
        }
    }
}

void selection_sort(double* array, int size){
    for(int i=0;i<size-1;i++){
        double min = array[i];
        int min_index = i;
        for(int j=i+1;j<size;j++){
            if(array[j]<min){
                min = array[j];
                min_index = j;
            }
        }
        if(i!=min_index){
            swap(array, i, min_index);
        }
    }
}

void insertion_sort(double* array, int size){
    int sorted_end=0;
    for(int i=sorted_end;i<size;i++){
        
    }
}

void merge_sort(double* array, int size){

}

void quick_sort(double* array, int size){

}

void heap_sort(double* array, int size){

}


// Here is an experiment
int a = 1;
int b = 2;
int c = 3;
double randd() {
    a = ((b+c) % (++a + b)) % 100;
    b = ((a+c) % (++b + c)) % 100;
    c = ((a+b) % (++c + a)) % 100;

    double x = (double) ((a+b+c)%(a+2))/((double) (a+1));
    double y = (double) ((a+b+c)%(b+2))/((double) (b+1));
    double z = (double) ((a+b+c)%(c+2))/((double) (c+1));

    return (x+y+z)/3.0;
}
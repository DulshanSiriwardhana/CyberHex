#include "matrix.h"

void removeRowColumn(double* double A, int row, int column, int size, double* double* ret){
    for(int i=0;i<size-1;i++){
        for(int j=0;j<size-1;j++){
            if(j>=column){
                if(i>=row){
                    ret[i][j] = A[i+1][j+1];
                }
                else{
                    ret[i][j] = A[i][j+1];
                }
            }
            else{
                if(i>=row){
                    ret[i][j] = A[i+1][j];
                }
                else{
                    ret[i][j] = A[i][j];
                }
            }
        }
    }
}

double det2x2(double* double A){
    return A[0][0]*A[1][1] - A[0][1]*A[1][0];
}

double det(double* double* A, int size){
    if(size==2){
        return det2x2(double* double* A);
    }

    int k=1;
    double sum =0;
    for(int i =0;i<size;i++){
        double* x =  new double[size-1];
        double* y = new x[size-1];

        removeRowColumn(A, 0, i, size, y);
        sum += k*A[0][i]* det(y);
        k *= -1;
    }

    return sum;
}

void solve_AX_eq_B(double* double* A, double* X, double* B, int size){
    for(int i=0;i<size-1;i++){
        for(int j=i+1;j<size;j++){

        }
    }
}
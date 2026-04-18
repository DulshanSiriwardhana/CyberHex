#include "matrix.h"

void removeRowColumn(double** &A, int row, int column, int size, double** &ret){
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

double det2x2(double** &A){
    return A[0][0]*A[1][1] - A[0][1]*A[1][0];
}

double det(double** &A, int size){
    if(size==2){
        return det2x2(A);
    }

    int k=1;
    double sum =0;
    for(int i =0;i<size;i++){

        double** y = new double*[size-1];

        for(int k=0;k<size;k++){
            y[k] = new double[size-1];
        }

        removeRowColumn(A, 0, i, size, y);
        sum += k*A[0][i]* det(y, size-1);
        k *= -1;
    }

    return sum;
}

void replaceRow(double** &A, int row, int size, double*  replacingRow, double** &ret){
    for(int i=0;i<size;i++){
        for(int j=0;j<size;j++){
            if(i == row){
                ret[i][j] = replacingRow[j];
            }
            else{
                ret[i][j] = A[i][j];
            }
        }
    }
}

void replaceColumn(double** &A, int column, int size, double*  replacingColumn, double** &ret){
    for(int i=0;i<size;i++){
        for(int j=0;j<size;j++){
            if(j == column){
                ret[i][j] = replacingColumn[i];
            }
            else{
                ret[i][j] = A[i][j];
            }
        }
    }
}

void solve_AX_eq_B(double** &A, double* X, double* B, int size){
    double detA = det(A, size);
    for(int i=0;i<size;i++){

        double** newA = new double*[size];

        for(int k=0;k<size;k++){
            newA[k] = new double[size];
        }
        
        replaceColumn(A, i, size, B, newA);
        X[i] = det(newA, size)/detA;
    }
}

void multiply_matrices(double** &A, double** &B, int* dimensions, double** &ret){
    for(int i=0;i<dimensions[0];i++){
        //int row = i;
        for(int j=0;j<dimensions[3];j++){
            //int column = j;
            double value = 0;
            for(int k=0;k<dimensions[1];k++){
                //int posX = dimensions[1] * i + k;
                //int posY = dimensions[2] * k + j;
                value += A[i][k] * B[k][j];
            }
            ret[i][j] = value;
        }
    }
}
#ifndef IO_H
#define IO_H
#include "iostream"

using namespace std;

template <typename T>
void print_array(T* array, int size){
    for(int i=0;i<size;i++){
        if(i==0){
            cout << "{" << array[i] << ", ";
        }
        else if(i==size-1){
            cout << array[i] << "}" << endl;
        }
        else{
            cout << array[i] << ", ";
        }  
    }
}

template <typename T>
void print_matrix(T** &matrix, int* dimensions){
    for(int i=0;i<dimensions[0];i++){
        for(int j=0;j<dimensions[1];j++){
            cout<< matrix[i][j] << " ";
        }
        cout<< endl;
    }
}

#endif
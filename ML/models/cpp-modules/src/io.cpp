#include "iostream"

using namespace std;

template <typename T>
void print_array(T* array, int size){
    for(int i=0;i<size;i++){
        if(i==size-1){
            cout << array[i] << end;
        }
        else{
            cout << array[i] << ", "<< end;
        }  
    }
}
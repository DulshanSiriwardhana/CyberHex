#include "iostream"
#include "higher_maths.h"
#include "basic_maths.h"
#include "stat.h"
#include "machine_learning_algorithms.h"
#include "matrix.h"
#include "io.h"
#include "types.h"
#include "data_structures.h"
#include "model.h"
#include "dense.h"
#include "activations.h"
#include "cmath"

using namespace std;

bool isPrime(int n){
    if(n<2){
        return false;
    }

    if(n==2){
        return true;
    }

    for(int i=2;i<n;i++){
        if(n%i==0){
            return false;
        }
    }

    return true;
}

int main() {
    // // // double arrayX[3] = {1,2,3};
    // // // double arrayY[3] = {1,4,9};
    // // // double* n = new double[4];

    // // // // double** A = new double*[3];
    // // // // A[0] = new double[3];
    // // // // A[1] = new double[3];
    // // // // A[2] = new double[3];

    // // // // A[0][0] = 1;
    // // // // A[0][1] = 1;
    // // // // A[0][2] = 1;
    // // // // A[1][0] = 2;
    // // // // A[1][1] = 2;
    // // // // A[1][2] = 1;
    // // // // A[2][0] = 3;
    // // // // A[2][1] = 1;
    // // // // A[2][2] = 1;

    // // // // double X[3];
    // // // // double B[3] = {3,4,3};
    // // // // solve_AX_eq_B(A, X, B, 3);
    // // // // linear_regression_data(arrayX, arrayY, 3, n);
    // // // k_degree_polynomial_regression_data(arrayX, arrayY, 3, 3, n);
    // // // double distance = euclid_distance(arrayX, arrayY, 3);
    // // // double x = power(3.0,0.5);
    // // // cout << x << " " << n[1] << " " << n[2] << " " << n[3] <<endl;

    // // double array[10] = {9,8.0,7.0,6.0,5.0,4.0,3.0,2.0,1.0,0.0};
    // // selection_sort(array, 10);
    // // print_array(array, 10);

    // // labeledDataPoint data[100];

    // // for (int i = 0; i < 100; i++) {
    // //     data[i].label = (double) ((((3-i)*(3-i))%((i) + 1)) + 0.1);
    // //     data[i].point = new double[4]{(double) (10-i)*(i+1)*i/13.0,(double) i*i,(double) i-1,(double) i/2.0};
    // // }
    // // for (int i = 0; i < 100; i++) {
    // //     cout<<data[i].label;
    // //     print_array(data[i].point, 4);
    // // }

    // // double point[4] = {1,2,3,4};

    // // int ret = knn(data, 100, 4, 6, point, 1);
    // // cout<<ret<<endl;


    // double** A = new double*[2];
    // A[0] = new double[2];
    // A[1] = new double[2];

    // A[0][0] = 1;
    // A[0][1] = 1;
    // A[1][0] = 2;
    // A[1][1] = 2;

    // double** B = new double*[2];
    // B[0] = new double[2];
    // B[1] = new double[2];

    // B[0][0] = 1;
    // B[0][1] = 1;
    // B[1][0] = 2;
    // B[1][1] = 2;

    // double** ret =  new double*[2];
    // ret[0] = new double[2];
    // ret[1] = new double[2];

    // int sizes[4] = {2,2,2,2};

    // multiply_matrices(A, B, sizes, ret);

    // int dimensions[2] = {2,2};

    // print_matrix(ret, dimensions);

    // LinkedList list;

    // list.insertAtEnd(10);
    // cout<<list.getLength()<<endl;
    // list.insertAtEnd(20);
    // cout<<list.getLength()<<endl;
    // list.insertAtEnd(30);
    // cout<<list.getLength()<<endl;
    // list.insertAtBegining(0);
    // cout<<list.getLength()<<endl;
    // list.insertAtEnd(40);
    // cout<<list.getLength()<<endl;
    // list.insertAt(2, 100);
    // cout<<list.getLength()<<endl;

    // list.display();

    // for(int k=0;k<100;k++){
    //     double x = randd();
    //     cout<< x<< endl;
    // }

    //Matrix m(3, 3, 5.0);
    //m.print();

    int N = 100;

    Matrix X(N, 2);
    Matrix y(N, 1);

    for (int i = 0; i < N; i++) {
        double t = (double)i / N * 4 * 3.1415;
        double r = (double)i / N;

        double x1 = r * cos(t);
        double x2 = r * sin(t);

        if (i % 2 == 0) {
            X.matrix[i][0] = x1;
            X.matrix[i][1] = x2;
            y.matrix[i][0] = 0;
        } else {
            X.matrix[i][0] = -x1;
            X.matrix[i][1] = -x2;
            y.matrix[i][0] = 1;
        }
    }

    Model model;

    model.add(new Dense(2, 4));
    model.add(new ReLU());

    model.add(new Dense(4, 8));
    model.add(new ReLU());

    model.add(new Dense(8, 16));
    model.add(new ReLU());

    model.add(new Dense(16, 32));
    model.add(new ReLU());

    model.add(new Dense(32, 64));
    model.add(new ReLU());

    model.add(new Dense(64, 32));
    model.add(new ReLU());

    model.add(new Dense(32, 16));
    model.add(new ReLU());

    model.add(new Dense(16, 8));
    model.add(new ReLU());

    model.add(new Dense(8, 4));
    model.add(new ReLU());

    model.add(new Dense(4, 2));
    model.add(new ReLU());

    model.add(new Dense(2, 1));
    model.add(new Sigmoid());

    model.train(X, y, 100000, 0.1);

    Matrix pred = model.forward(X);

    for (int i = 0; i < 10; i++) {
        std::cout << "Input: (" 
                << X.matrix[i][0] << ", " 
                << X.matrix[i][1] << ") ";

        std::cout << "Pred: " << pred.matrix[i][0]
                << " Label: " << y.matrix[i][0] << std::endl;
    }

    return 0;
}
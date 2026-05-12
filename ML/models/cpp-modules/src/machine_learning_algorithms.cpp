#include "machine_learning_algorithms.h"
#include "stat.h"
#include "matrix.h"
#include "types.h"
#include "higher_maths.h"
#include "io.h"
#include "iostream"

using namespace std;

void linear_regression_data(double* dataX, double* dataY, int size, double* return_data){
    double x_mean = calc_mean(dataX, size);
    double y_mean = calc_mean(dataY, size);
    double xy_mean = calc_multiplicative_mean(dataX, dataY, size);
    double x_square_mean = calc_square_mean(dataX, size);

    double alpha = (x_square_mean * y_mean - x_mean * xy_mean)/(x_square_mean - x_mean * x_mean);
    double beta = (xy_mean - y_mean * x_mean)/(x_square_mean - x_mean * x_mean);
    return_data[0] = alpha;
    return_data[1] = beta;
}

void k_degree_polynomial_regression_data(double* dataX, double* dataY, int size, int degree, double* return_data){
    std::vector<double> xy_means(degree + 2);
    std::vector<std::vector<double>> A(degree + 1, std::vector<double>(degree + 1));

    xy_means[0] = calc_mean(dataY, size);

    std::vector<double> temp(2 * degree + 1);
    temp[0] = 1;

    for(int i =1; i<=2*degree;i++){
        temp[i] = calc_n_order_mean(dataX, size, i);
    }

    for(int i =0; i<=degree;i++){ // fixed upper bound bug
        for(int j=0; j<=degree; j++){
            A[i][j] = temp[i+j];
        }
    }
    
    for(int i=0;i<=degree;i++){
        xy_means[i+1] = calc_n_order_multiplicative_mean(dataX, i+1, dataY, 1, size);
    }

    std::vector<double> B(xy_means.begin(), xy_means.begin() + degree + 1);
    std::vector<double> X = solve_AX_eq_B(A, B);
    
    for (int i = 0; i <= degree; i++) {
        return_data[i] = X[i];
    }
}

int knn(labeledDataPoint* data, int size, int dimension, int k, double* point, int distance_function){
    struct nearest {
        double dis;
        int label;
    };

    int max_labels[size]={0};

    nearest k_nearest[k];

    for(int i=0;i<size; i++){
        if(i<k){
            nearest n = {
                euclid_distance(data[i].point, point, dimension),
                data[i].label
            };
            k_nearest[i] = n;
            max_labels[data[i].label] = max_labels[data[i].label] + 1;
        }
        else{
            double dis = euclid_distance(data[i].point, point, dimension);

            double isLess = false;
            int max = -1;
            double maximum = k_nearest[0].dis;

            for(int j=0;j<k;j++){
                if(k_nearest[j].dis > dis){
                    isLess = true;
                    if(maximum < k_nearest[j].dis){
                        maximum = k_nearest[j].dis;
                        max = j;
                    }
                }
            }

            if(isLess){
                k_nearest[max] = {
                euclid_distance(data[i].point, point, dimension),
                data[i].label
            };
                max_labels[data[i].label] = max_labels[data[i].label] + 1;                
            }
        }
    }

    print_array(max_labels, size);
    int max_label = 0;
    int max_label_count = 1;
    for(int i=0;i<size; i++){
        if(max_labels[i]>max_label_count){
            max_label_count = max_labels[i];
            max_label = i;
        }
    }

    return max_label;
}
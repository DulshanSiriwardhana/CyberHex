#include "iostream"
#include "higher_maths.h"
#include "basic_maths.h"
#include "stat.h"
#include "machine_learning_algorithms.h"

using namespace std;

int main() {
    double arrayX[3] = {1,2,4};
    double arrayY[3] = {1,2,3};
    double* n = new double[2];
    linear_regression_data(arrayX, arrayY, 3, n);
    cout << n[0] << " " << n[1] << endl;
    return 0;
}
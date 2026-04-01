#include "iostream"
#include "higher_maths.h"
#include "basic_maths.h"

using namespace std;

int main() {
    double array[3] = {1,3,3};
    double mean = calc_mean(array, 3);
    double square_mean = calc_square_mean(array, 3);
    double square_mean_2 = calc_n_order_mean(array, 3, 2);
    double n = power(0.9,3);
    double b = pow(10,2);
    cout << n << endl;
    return 0;
}
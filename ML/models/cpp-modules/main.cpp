#include "iostream"
#include "higher_maths.h"

using namespace std;

int main() {
    double array[3] = {1,3,3};
    double mean = calc_mean(array, 3);
    double square_mean = calc_square_mean(array, 3);
    cout << square_mean << endl;
    return 0;
}
#include "iostream"
#include "higher_maths.h"

using namespace std;

int main() {
    double array[3] = {1,3,3};
    double mean = calc_mean(array, 3);
    cout << mean << endl;
    return 0;
}
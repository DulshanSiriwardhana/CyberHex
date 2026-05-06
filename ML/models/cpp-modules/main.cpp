#include "iostream"
#include "matrix.h"
#include "model.h"
#include "dense.h"
#include "activations.h"

using namespace std;

int main() {

    int N = 4;

    Matrix X(N, 2);
    Matrix y(N, 1);

    X.matrix[0][0] = 0; X.matrix[0][1] = 0; y.matrix[0][0] = 0;
    X.matrix[1][0] = 0; X.matrix[1][1] = 1; y.matrix[1][0] = 1;
    X.matrix[2][0] = 1; X.matrix[2][1] = 0; y.matrix[2][0] = 1;
    X.matrix[3][0] = 1; X.matrix[3][1] = 1; y.matrix[3][0] = 0;

    Model model;

    model.add(new Dense(2, 4096));
    model.add(new ReLU());

    model.add(new Dense(4096, 1));
    model.add(new Sigmoid());

    model.train(X, y, 100000, 2.55);

    Matrix pred = model.forward(X);

    cout << "===== XOR Results =====" << endl;

    for (int i = 0; i < N; i++) {
        cout << "Input: (" 
             << X.matrix[i][0] << ", " 
             << X.matrix[i][1] << ") ";

        cout << "Pred: " << pred.matrix[i][0]
             << " Label: " << y.matrix[i][0] << endl;
    }

    return 0;
}
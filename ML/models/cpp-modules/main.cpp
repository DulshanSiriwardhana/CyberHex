#include "iostream"
#include "cmath"
#include "matrix.h"
#include "model.h"
#include "dense.h"
#include "activations.h"
#include "higher_maths.h"

using namespace std;

double f(double x1, double x2) {
    return sin(3*x1)*cos(5*x2) + 0.3*sin(10*(x1 + x2));
}

int main() {

    int N = 2000;

    Matrix X(N, 2);
    Matrix y(N, 1);

    for (int i = 0; i < N; i++) {
        double x1 = randd()*2 - 1;
        double x2 = randd()*2 - 1;

        X.matrix[i][0] = x1;
        X.matrix[i][1] = x2;

        y.matrix[i][0] = f(x1, x2);
    }

    int split = N * 0.8;

    Matrix X_train(split, 2);
    Matrix y_train(split, 1);

    Matrix X_test(N - split, 2);
    Matrix y_test(N - split, 1);

    for (int i = 0; i < split; i++) {
        X_train.matrix[i][0] = X.matrix[i][0];
        X_train.matrix[i][1] = X.matrix[i][1];
        y_train.matrix[i][0] = y.matrix[i][0];
    }

    for (int i = split; i < N; i++) {
        X_test.matrix[i - split][0] = X.matrix[i][0];
        X_test.matrix[i - split][1] = X.matrix[i][1];
        y_test.matrix[i - split][0] = y.matrix[i][0];
    }

    Model model;

    model.add(new Dense(2, 512));
    model.add(new ReLU());

    model.add(new Dense(512, 64));
    model.add(new ReLU());

    model.add(new Dense(64, 8));
    model.add(new ReLU());

    model.add(new Dense(8, 1));
    model.add(new Sigmoid());

    model.train(X_train, y_train, 100000, 0.01);

    Matrix pred = model.forward(X_test);

    double mse = 0;

    for (int i = 0; i < N - split; i++) {
        double diff = pred.matrix[i][0] - y_test.matrix[i][0];
        mse += diff * diff;
    }

    mse /= (N - split);

    cout << "Test MSE: " << mse << endl;

    for (int i = 0; i < 20; i++) {
        cout << X_test.matrix[i][0] << " "
             << X_test.matrix[i][1] << " "
             << pred.matrix[i][0] << " "
             << y_test.matrix[i][0] << endl;
    }

    return 0;
}
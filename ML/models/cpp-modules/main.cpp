#include "iostream"
#include "cmath"
#include "matrix.h"
#include "model.h"
#include "dense.h"
#include "activations.h"
#include "higher_maths.h"
#include <catch2/catch_test_macros.hpp>

using namespace std;

double f(double x1, double x2) {
    return sin(3*x1)*cos(5*x2) + 0.3*sin(10*(x1 + x2));
}

// Item 111: Unit Tests
TEST_CASE("Matrix operations", "[matrix]") {
    Matrix<double> a(2, 2, 1.0);
    Matrix<double> b(2, 2, 2.0);
    
    auto c = a + b;
    REQUIRE(c(0, 0) == 3.0);
    
    auto d = a.dot(b);
    REQUIRE(d.rows == 2);
    REQUIRE(d.cols == 2);
}

TEST_CASE("Model training", "[model]") {
    Model model;
    model.add(new Dense(2, 10));
    model.add(new ReLU());
    model.add(new Dense(10, 1));
    
    Matrix<double> X(10, 2, 0.1);
    Matrix<double> y(10, 1, 0.5);
    
    model.train(X, y, 10, 0.01);
    
    auto pred = model.forward(X);
    REQUIRE(pred.rows == 10);
    REQUIRE(pred.cols == 1);
}

int main(int argc, char* argv[]) {
    // Run tests if --test flag
    if (argc > 1 && std::string(argv[1]) == "--test") {
        return Catch::Session().run(argc, argv);
    }

    // Original main code

    int N = 100;

    Matrix<double> X(N, 2);
    Matrix<double> y(N, 1);

    for (int i = 0; i < N; i++) {
        double x1 = randd()*2 - 1;
        double x2 = randd()*2 - 1;

        X(i, 0) = x1;
        X(i, 1) = x2;

        y(i, 0) = f(x1, x2);
    }

    int split = N * 0.8;

    Matrix<double> X_train(split, 2);
    Matrix<double> y_train(split, 1);

    Matrix<double> X_test(N - split, 2);
    Matrix<double> y_test(N - split, 1);

    for (int i = 0; i < split; i++) {
        X_train(i, 0) = X(i, 0);
        X_train(i, 1) = X(i, 1);
        y_train(i, 0) = y(i, 0);
    }

    for (int i = split; i < N; i++) {
        X_test(i - split, 0) = X(i, 0);
        X_test(i - split, 1) = X(i, 1);
        y_test(i - split, 0) = y(i, 0);
    }

    Model model;

    model.add(new Dense(2, 1024));
    model.add(new ReLU());

    model.add(new Dense(1024, 32));
    model.add(new ReLU());

    model.add(new Dense(32, 1));
    model.add(new Sigmoid());

    model.train(X_train, y_train, 2000, 0.3);

    Matrix<double> pred = model.forward(X_test);

    double mse = 0;

    for (int i = 0; i < N - split; i++) {
        double diff = pred(i, 0) - y_test(i, 0);
        mse += diff * diff;
    }

    mse /= (N - split);

    cout << "Test MSE: " << mse << endl;

    for (int i = 0; i < 20; i++) {
        cout << X_test(i, 0) << " "
             << X_test(i, 1) << " "
             << pred(i, 0) << " "
             << y_test(i, 0) << endl;
    }

    return 0;
}
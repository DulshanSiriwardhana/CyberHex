#include <catch2/catch_test_macros.hpp>
#include "matrix.h"
#include "model.h"
#include "dense.h"
#include "activations.h"

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

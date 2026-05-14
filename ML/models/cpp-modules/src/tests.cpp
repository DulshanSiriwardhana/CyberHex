#include <catch2/catch_test_macros.hpp>
#include "matrix.h"
#include "layer.h"
#include "activations.h"
#include "dense.h"
#include "model.h"
#include <cmath>

using namespace cyberhex;

// Helper for floating-point assertion (avoids Catch2 v2/v3 Approx incompatibility)
#define REQUIRE_NEAR(a, b, eps) REQUIRE(std::abs((a) - (b)) < (eps))

// ============================================================================
// Matrix Tests
// ============================================================================
TEST_CASE("Matrix construction and access", "[matrix]") {
    SECTION("Default constructor") {
        Matrix<double> m;
        REQUIRE(m.rows() == 0);
        REQUIRE(m.cols() == 0);
        REQUIRE(m.empty());
    }

    SECTION("Value constructor") {
        Matrix<double> m(3, 4, 2.5);
        REQUIRE(m.rows() == 3);
        REQUIRE(m.cols() == 4);
        REQUIRE(m(0, 0) == 2.5);
        REQUIRE(m(2, 3) == 2.5);
    }

    SECTION("Copy constructor") {
        Matrix<double> a(2, 2, 1.0);
        Matrix<double> b = a;
        REQUIRE(b(0, 0) == 1.0);
        REQUIRE(b(1, 1) == 1.0);
        a(0, 0) = 5.0; // b should be independent
        REQUIRE(b(0, 0) == 1.0);
    }

    SECTION("Move constructor") {
        Matrix<double> a(2, 2, 1.0);
        Matrix<double> b = std::move(a);
        REQUIRE(b.rows() == 2);
        REQUIRE(b(0, 0) == 1.0);
        REQUIRE(a.empty());
    }

    SECTION("Static factories") {
        auto I = Matrix<double>::identity(3);
        REQUIRE(I(0, 0) == 1.0);
        REQUIRE(I(1, 1) == 1.0);
        REQUIRE(I(0, 1) == 0.0);

        auto ones = Matrix<double>::ones(2, 3);
        REQUIRE(ones(0, 0) == 1.0);
        REQUIRE(ones(1, 2) == 1.0);

        auto zeros = Matrix<double>::zeros(2, 2);
        REQUIRE(zeros(0, 0) == 0.0);
    }
}

TEST_CASE("Matrix arithmetic", "[matrix]") {
    Matrix<double> a(2, 2, 2.0);
    Matrix<double> b(2, 2, 3.0);
    Matrix<double> c(2, 1, 1.0);

    SECTION("Addition") {
        auto r = a + b;
        REQUIRE(r(0, 0) == 5.0);
        REQUIRE(r(1, 1) == 5.0);
    }

    SECTION("Subtraction") {
        auto r = a - b;
        REQUIRE(r(0, 0) == -1.0);
    }

    SECTION("Scalar multiplication") {
        auto r = a * 2.5;
        REQUIRE(r(0, 0) == 5.0);
    }

    SECTION("Dot product") {
        Matrix<double> x(2, 3);
        x(0, 0) = 1; x(0, 1) = 2; x(0, 2) = 3;
        x(1, 0) = 4; x(1, 1) = 5; x(1, 2) = 6;

        Matrix<double> y(3, 2);
        y(0, 0) = 7; y(0, 1) = 8;
        y(1, 0) = 9; y(1, 1) = 10;
        y(2, 0) = 11; y(2, 1) = 12;

        auto r = x.dot(y);
        REQUIRE(r.rows() == 2);
        REQUIRE(r.cols() == 2);
        REQUIRE(r(0, 0) == 58.0);  // 1*7 + 2*9 + 3*11
        REQUIRE(r(0, 1) == 64.0);  // 1*8 + 2*10 + 3*12
        REQUIRE(r(1, 0) == 139.0); // 4*7 + 5*9 + 6*11
        REQUIRE(r(1, 1) == 154.0); // 4*8 + 5*10 + 6*12
    }

    SECTION("Dimension mismatch throws") {
        REQUIRE_THROWS_AS(a.dot(c), DimensionMismatchException);
        REQUIRE_THROWS_AS(a + c, DimensionMismatchException);
    }
}

TEST_CASE("Matrix transpose", "[matrix]") {
    Matrix<double> m(2, 3);
    m(0, 0) = 1; m(0, 1) = 2; m(0, 2) = 3;
    m(1, 0) = 4; m(1, 1) = 5; m(1, 2) = 6;

    auto t = m.transpose();
    REQUIRE(t.rows() == 3);
    REQUIRE(t.cols() == 2);
    REQUIRE(t(0, 0) == 1);
    REQUIRE(t(1, 0) == 2);
    REQUIRE(t(2, 0) == 3);
    REQUIRE(t(0, 1) == 4);
}

TEST_CASE("Matrix reductions", "[matrix]") {
    Matrix<double> m(2, 3);
    m(0, 0) = 1; m(0, 1) = 2; m(0, 2) = 3;
    m(1, 0) = 4; m(1, 1) = 5; m(1, 2) = 6;

    REQUIRE(m.sum() == 21.0);
    REQUIRE(m.mean() == 3.5);
    REQUIRE(m.max() == 6.0);
    REQUIRE(m.min() == 1.0);
}

// ============================================================================
// Activation Function Tests
// ============================================================================
TEST_CASE("ReLU activation", "[activation]") {
    ReLU relu;
    Matrix<double> x(2, 2);
    x(0, 0) = -1.0; x(0, 1) = 2.0;
    x(1, 0) = 0.0;  x(1, 1) = -3.0;

    auto out = relu.forward(x);
    REQUIRE(out(0, 0) == 0.0);
    REQUIRE(out(0, 1) == 2.0);
    REQUIRE(out(1, 0) == 0.0);
    REQUIRE(out(1, 1) == 0.0);

    Matrix<double> grad(2, 2, 1.0);
    auto back = relu.backward(grad, 0.01, OptimizerType::SGD, 1);
    REQUIRE(back(0, 0) == 0.0);  // grad * (x <= 0)
    REQUIRE(back(0, 1) == 1.0);  // grad * (x > 0)
}

TEST_CASE("Sigmoid activation", "[activation]") {
    Sigmoid sig;
    Matrix<double> x(1, 3);
    x(0, 0) = 0.0; x(0, 1) = 100.0; x(0, 2) = -100.0;

    auto out = sig.forward(x);
    REQUIRE_NEAR(out(0, 0), 0.5, 1e-6);
    REQUIRE_NEAR(out(0, 1), 1.0, 1e-6);
    REQUIRE_NEAR(out(0, 2), 0.0, 1e-6);
}

TEST_CASE("Softmax activation", "[activation]") {
    Softmax sm;
    Matrix<double> x(2, 3);
    x(0, 0) = 1.0; x(0, 1) = 2.0; x(0, 2) = 3.0;
    x(1, 0) = 1.0; x(1, 1) = 2.0; x(1, 2) = 3.0;

    auto out = sm.forward(x);

    // Each row should sum to 1
    for (size_t i = 0; i < out.rows(); i++) {
        double sum = 0.0;
        for (size_t j = 0; j < out.cols(); j++) {
            sum += out(i, j);
            REQUIRE(out(i, j) > 0.0);
        }
        REQUIRE_NEAR(sum, 1.0, 1e-6);
    }

    // Row 0 should equal row 1
    REQUIRE_NEAR(out(0, 0), out(1, 0), 1e-10);
    REQUIRE_NEAR(out(0, 1), out(1, 1), 1e-10);
}

// ============================================================================
// Dense Layer Tests
// ============================================================================
TEST_CASE("Dense layer forward", "[layer]") {
    Dense dense(3, 2, InitType::XAVIER);
    Matrix<double> x(2, 3, 1.0);

    auto out = dense.forward(x);
    REQUIRE(out.rows() == 2);
    REQUIRE(out.cols() == 2);
}

TEST_CASE("Dense layer backward", "[layer]") {
    Dense dense(4, 3, InitType::HE);
    Matrix<double> x(2, 4, 0.5);

    auto out = dense.forward(x);
    Matrix<double> grad(2, 3, 0.1);

    auto grad_input = dense.backward(grad, 0.01, OptimizerType::SGD, 1);
    REQUIRE(grad_input.rows() == 2);
    REQUIRE(grad_input.cols() == 4);
}

// ============================================================================
// Loss Function Tests
// ============================================================================
TEST_CASE("MSE Loss", "[loss]") {
    MSELoss mse;
    Matrix<double> pred(3, 1);
    pred(0, 0) = 1.0; pred(1, 0) = 2.0; pred(2, 0) = 3.0;
    Matrix<double> target(3, 1);
    target(0, 0) = 1.0; target(1, 0) = 2.0; target(2, 0) = 3.0;

    // Perfect prediction
    double loss = mse.forward(pred, target);
    REQUIRE_NEAR(loss, 0.0, 1e-10);

    // Non-perfect prediction
    pred(0, 0) = 1.5;
    loss = mse.forward(pred, target);
    // (0.5^2 + 0 + 0) / 3 = 0.25/3 = 0.08333
    REQUIRE_NEAR(loss, 0.25 / 3.0, 1e-10);
}

TEST_CASE("Cross-Entropy Loss", "[loss]") {
    CategoricalCrossEntropyLoss cce;
    Matrix<double> pred(1, 3);
    pred(0, 0) = 0.1; pred(0, 1) = 0.7; pred(0, 2) = 0.2;
    Matrix<double> target(1, 3);
    target(0, 0) = 0.0; target(0, 1) = 1.0; target(0, 2) = 0.0;

    double loss = cce.forward(pred, target);
    // loss = -log(0.7) = 0.3567
    REQUIRE_NEAR(loss, -std::log(0.7), 0.01);
}

// ============================================================================
// Optimizer Tests
// ============================================================================
TEST_CASE("Adam optimizer parameter update", "[optimizer]") {
    auto param = Matrix<double>::ones(2, 2);
    auto grad = Matrix<double>(2, 2, -0.1);

    AdamOptimizer adam(0.001);
    adam.update(param, grad, 0, 10);

    // Parameters should have been updated (increased since gradient is negative)
    REQUIRE(param(0, 0) > 1.0);
    REQUIRE(param(1, 1) > 1.0);
}

// ============================================================================
// Model Training Tests
// ============================================================================
TEST_CASE("Model training reduces loss", "[model]") {
    Model model;
    model.add(std::make_unique<Dense>(2, 16));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(16, 1));
    model.add(std::make_unique<Sigmoid>());

    model.compile(
        std::make_unique<MSELoss>(),
        std::make_unique<AdamOptimizer>(0.01)
    );

    // XOR-like data
    Matrix<double> X(4, 2);
    X(0, 0) = 0; X(0, 1) = 0;
    X(1, 0) = 0; X(1, 1) = 1;
    X(2, 0) = 1; X(2, 1) = 0;
    X(3, 0) = 1; X(3, 1) = 1;

    Matrix<double> y(4, 1);
    y(0, 0) = 0;
    y(1, 0) = 1;
    y(2, 0) = 1;
    y(3, 0) = 0;

    // Pre-training loss
    Matrix<double> pred_before = model.forward(X);
    double loss_before = model.compute_loss(pred_before, y);

    // Train
    model.fit(X, y, 1000, 0, 0.0, 0, false);

    // Post-training loss
    Matrix<double> pred_after = model.forward(X);
    double loss_after = model.compute_loss(pred_after, y);

    // Loss should have decreased
    REQUIRE(loss_after < loss_before);
}

TEST_CASE("Model prediction shapes", "[model]") {
    Model model;
    model.add(std::make_unique<Dense>(10, 5));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(5, 3));
    model.add(std::make_unique<Softmax>());

    Matrix<double> X(8, 10, 0.5);
    auto pred = model.predict(X);

    REQUIRE(pred.rows() == 8);
    REQUIRE(pred.cols() == 3);

    // Each row should sum to ~1 (softmax)
    for (size_t i = 0; i < pred.rows(); i++) {
        double sum = 0.0;
        for (size_t j = 0; j < pred.cols(); j++) {
            sum += pred(i, j);
        }
        REQUIRE_NEAR(sum, 1.0, 1e-5);
    }
}

// ============================================================================
// Checkpoint Tests
// ============================================================================
TEST_CASE("Checkpoint save and load", "[checkpoint]") {
    Model model;
    model.add(std::make_unique<Dense>(3, 4));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(4, 2));

    model.compile(
        std::make_unique<MSELoss>(),
        std::make_unique<AdamOptimizer>(0.001)
    );

    // Save checkpoint
    model.save_checkpoint("/tmp/test_checkpoint.chk");

    // Create new model and load
    Model model2;
    model2.add(std::make_unique<Dense>(3, 4));
    model2.add(std::make_unique<ReLU>());
    model2.add(std::make_unique<Dense>(4, 2));

    model2.load_checkpoint("/tmp/test_checkpoint.chk");

    // Predictions should match
    Matrix<double> X(5, 3, 0.7);
    auto pred1 = model.predict(X);
    auto pred2 = model2.predict(X);

    for (size_t i = 0; i < pred1.size(); i++) {
        REQUIRE_NEAR(pred1.at(i), pred2.at(i), 1e-10);
    }
}

// ============================================================================
// DataLoader Tests
// ============================================================================
TEST_CASE("DataLoader batching", "[dataloader]") {
    Matrix<double> X(100, 5, 1.0);
    Matrix<double> y(100, 1, 0.0);

    auto dataset = std::make_shared<TensorDataset>(X, y);
    DataLoader loader(dataset, 32, false);

    REQUIRE(loader.num_batches() == 4); // 100/32 = 3.125 -> 4

    loader.reset();
    int batches = 0;
    int total_samples = 0;

    while (loader.has_next()) {
        auto [X_batch, y_batch] = loader.next_batch();
        total_samples += X_batch.rows();
        batches++;
    }

    REQUIRE(batches == 4);
    REQUIRE(total_samples == 100);
}

// Benchmark excluded (requires Catch2 benchmark header)

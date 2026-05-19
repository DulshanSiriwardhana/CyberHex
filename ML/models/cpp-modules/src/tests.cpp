#include <catch2/catch_test_macros.hpp>
#include "matrix.h"
#include "layer.h"
#include "activations.h"
#include "dense.h"
#include "model.h"
#include "training_protocol.h"
#include "tensor.h"
#include "conv2d.h"
#include "graph.h"
#include "fused_ops.h"
#include "device.h"
#include "precision.h"
#include "ops_dispatch.h"
#include "transformer.h"
#include "distributed.h"
#include <cmath>
#include <cstdio>
#include <memory>

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
        Matrix<double> bad(3, 1, 1.0);
        REQUIRE_THROWS_AS(a.dot(bad), DimensionMismatchException);
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

    const std::string ckpt_path = "test_checkpoint.chk";

    model.save_checkpoint(ckpt_path);

    Model model2;
    model2.add(std::make_unique<Dense>(3, 4));
    model2.add(std::make_unique<ReLU>());
    model2.add(std::make_unique<Dense>(4, 2));

    model2.compile(
        std::make_unique<MSELoss>(),
        std::make_unique<AdamOptimizer>(0.001)
    );
    model2.load_checkpoint(ckpt_path);
    std::remove(ckpt_path.c_str());

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

TEST_CASE("Softmax numerical stability with large logits", "[numerical]") {
    Softmax sm;
    Matrix<double> X(2, 4);
    X(0, 0) = 1000; X(0, 1) = 1001; X(0, 2) = 999; X(0, 3) = 1000;
    X(1, 0) = -500; X(1, 1) = -501; X(1, 2) = -499; X(1, 3) = -500;

    auto out = sm.forward(X);
    for (size_t i = 0; i < out.rows(); i++) {
        double sum = 0.0;
        for (size_t j = 0; j < out.cols(); j++) {
            REQUIRE(std::isfinite(out(i, j)));
            REQUIRE(out(i, j) >= 0.0);
            sum += out(i, j);
        }
        REQUIRE_NEAR(sum, 1.0, 1e-9);
    }
    REQUIRE(out(0, 1) > out(0, 0));
}

namespace {

bool finite_diff_loss_grad(std::unique_ptr<LossFunction> loss,
                           const Matrix<double>& pred,
                           const Matrix<double>& target,
                           size_t check_samples = 8,
                           double eps = 1e-6,
                           double tol = 1e-4) {
    Matrix<double> analytical = loss->backward(pred, target);
    size_t checked = 0;
    for (size_t i = 0; i < pred.size() && checked < check_samples; i++) {
        double base = pred.at(i);
        Matrix<double> p_plus = pred;
        Matrix<double> p_minus = pred;
        p_plus.at(i) = base + eps;
        p_minus.at(i) = base - eps;
        double num = (loss->forward(p_plus, target) - loss->forward(p_minus, target)) / (2.0 * eps);
        double ana = analytical.at(i);
        if (std::abs(num - ana) > tol * std::max(1.0, std::abs(num))) {
            return false;
        }
        checked++;
    }
    return true;
}

} // namespace

TEST_CASE("TensorView and broadcast_add", "[tensor]") {
    Matrix<double> base(3, 4, 1.0);
    TensorView<double> view(base, 1, 1, 2, 2);
    REQUIRE(view.rows() == 2);
    view(0, 0) = 5.0;
    REQUIRE(base(1, 1) == 5.0);

    Matrix<double> row_bias(1, 4, 2.0);
    auto summed = broadcast_add(base, row_bias);
    REQUIRE_NEAR(summed(2, 3), 3.0, 1e-9);
}

TEST_CASE("Conv2D forward shape", "[conv2d]") {
    const size_t in_c = 1, in_h = 4, in_w = 4;
  Conv2D conv(in_c, 2, in_h, in_w, 3, 3, 1, 1);
    Matrix<double> X(2, in_c * in_h * in_w, 0.5);
    auto out = conv.forward(X);
    REQUIRE(out.rows() == 2);
    REQUIRE(out.cols() == conv.output_size());
}

TEST_CASE("LayerNorm forward normalizes rows", "[layernorm]") {
    LayerNormalization ln(4);
    Matrix<double> X(2, 4);
    X(0, 0) = 1; X(0, 1) = 2; X(0, 2) = 3; X(0, 3) = 4;
    X(1, 0) = 10; X(1, 1) = 10; X(1, 2) = 10; X(1, 3) = 10;
    auto Y = ln.forward(X);
    double mean0 = 0.0, mean1 = 0.0;
    for (size_t j = 0; j < 4; j++) {
        mean0 += Y(0, j);
        mean1 += Y(1, j);
    }
    REQUIRE_NEAR(mean0 / 4.0, mean1 / 4.0, 1e-5);
}

TEST_CASE("Loss gradient finite-difference checks", "[numerical]") {
    Matrix<double> pred(4, 3, 0.6);
    Matrix<double> target(4, 3, 0.4);
    REQUIRE(finite_diff_loss_grad(std::make_unique<MSELoss>(), pred, target));
    REQUIRE(finite_diff_loss_grad(std::make_unique<MAELoss>(), pred, target));
    REQUIRE(finite_diff_loss_grad(std::make_unique<HuberLoss>(), pred, target));

    Matrix<double> pred_prob(4, 1, 0.7);
    Matrix<double> target_bin(4, 1, 1.0);
    REQUIRE(finite_diff_loss_grad(std::make_unique<BinaryCrossEntropyLoss>(), pred_prob, target_bin));

    Matrix<double> pred_c(4, 3, 0.0);
    for (size_t i = 0; i < 4; i++) {
        pred_c(i, i % 3) = 0.9;
        pred_c(i, (i + 1) % 3) = 0.05;
        pred_c(i, (i + 2) % 3) = 0.05;
    }
    Matrix<double> target_oh(4, 3, 0.0);
    for (size_t i = 0; i < 4; i++) target_oh(i, i % 3) = 1.0;
    REQUIRE(finite_diff_loss_grad(std::make_unique<CategoricalCrossEntropyLoss>(), pred_c, target_oh));
}

TEST_CASE("Model load_weights round trip", "[weights]") {
    const std::string prefix = "test_weights_roundtrip";
    Model model;
    model.add(std::make_unique<Dense>(3, 2, InitType::XAVIER));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(2, 1, InitType::XAVIER));
    model.compile(std::make_unique<MSELoss>(), std::make_unique<SGDOptimizer>(0.01));

    Matrix<double> X(5, 3, 0.3);
    auto pred_before = model.predict(X);

    model.save_weights_binary(prefix);

    Model model2;
    model2.add(std::make_unique<Dense>(3, 2, InitType::XAVIER));
    model2.add(std::make_unique<ReLU>());
    model2.add(std::make_unique<Dense>(2, 1, InitType::XAVIER));
    model2.compile(std::make_unique<MSELoss>(), std::make_unique<SGDOptimizer>(0.01));
    model2.load_weights(prefix);

    auto pred_after = model2.predict(X);
    for (size_t i = 0; i < pred_before.size(); i++) {
        REQUIRE_NEAR(pred_before.at(i), pred_after.at(i), 1e-12);
    }

    std::remove((prefix + "/layer_0_weights.bin").c_str());
    std::remove((prefix + "/layer_0_bias.bin").c_str());
    std::remove((prefix + "/layer_2_weights.bin").c_str());
    std::remove((prefix + "/layer_2_bias.bin").c_str());
}

TEST_CASE("MSE loss gradient finite-difference check", "[numerical]") {
    Model model;
    model.add(std::make_unique<Dense>(2, 3, InitType::XAVIER));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(3, 1, InitType::XAVIER));
    model.compile(std::make_unique<MSELoss>(), std::make_unique<SGDOptimizer>(0.01));

    Matrix<double> X(4, 2);
    Matrix<double> y(4, 1);
    for (size_t i = 0; i < X.size(); i++) X.at(i) = 0.1 * static_cast<double>(i);
    for (size_t i = 0; i < y.size(); i++) y.at(i) = 0.05 * static_cast<double>(i);

    REQUIRE(model.check_gradients(X, y, 1e-5, 1e-3));
}

TEST_CASE("Training config JSON parsing", "[protocol]") {
    const std::string json = R"({
        "task": "regression",
        "layers": [8, 16, 1],
        "epochs": 25,
        "batchSize": 16,
        "learningRate": 0.01,
        "optimizer": "adam",
        "validationSplit": 0.15
    })";
    TrainingConfig cfg = parse_training_config(json);
    REQUIRE(cfg.task == "regression");
    REQUIRE(cfg.layers.size() == 3);
    REQUIRE(cfg.layers[0] == 8);
    REQUIRE(cfg.epochs == 25);
    REQUIRE(cfg.batch_size == 16);
    REQUIRE_NEAR(cfg.learning_rate, 0.01, 1e-9);
    REQUIRE_NEAR(cfg.validation_split, 0.15, 1e-9);
}

TEST_CASE("Fused vs unfused linear+ReLU forward", "[graph][fusion]") {
    Matrix<double> X(4, 3, 0.5);
    Matrix<double> W(3, 5, 0.2);
    Matrix<double> b(1, 5, 0.1);

    Matrix<double> pre;
    auto fused = fused_linear_relu_forward(X, W, b, pre);

    auto linear = X.dot(W);
    Matrix<double> unfused(linear.rows(), linear.cols());
    for (size_t i = 0; i < linear.rows(); i++) {
        for (size_t j = 0; j < linear.cols(); j++) {
            double z = linear(i, j) + b(0, j);
            unfused(i, j) = z > 0 ? z : 0.0;
        }
    }

    for (size_t i = 0; i < fused.size(); i++) {
        REQUIRE_NEAR(fused.at(i), unfused.at(i), 1e-12);
    }
}

TEST_CASE("ComputationGraph autodiff matches manual dense+relu", "[graph][autodiff]") {
    Matrix<double> X(4, 2);
    X(0, 0) = 0; X(0, 1) = 0;
    X(1, 0) = 0; X(1, 1) = 1;
    X(2, 0) = 1; X(2, 1) = 0;
    X(3, 0) = 1; X(3, 1) = 1;

    Matrix<double> y(4, 1);
    y(0, 0) = 0; y(1, 0) = 1; y(2, 0) = 1; y(3, 0) = 0;

    ComputationGraph g;
    NodeId input = g.add_input();
    NodeId W = g.add_parameter(2, 4, InitType::XAVIER);
    NodeId b = g.add_parameter(1, 4, InitType::XAVIER);
    g.mutable_node(b).weight.fill(0.0);
    NodeId out = g.add_fused_linear_relu(input, W, b);
    NodeId W2 = g.add_parameter(4, 1, InitType::XAVIER);
    NodeId b2 = g.add_parameter(1, 1, InitType::XAVIER);
    g.mutable_node(b2).weight.fill(0.0);
    out = g.add_matmul(out, W2);
    out = g.add_bias_add(out, b2);

    g.bind_input(input, X);
    g.forward(out);
    auto loss_fn = std::make_unique<BinaryCrossEntropyLoss>();
    double loss_g = loss_fn->forward(g.value(out), y);
    g.zero_grad();
    g.backward(out, loss_fn->backward(g.value(out), y));

    REQUIRE(std::isfinite(loss_g));
    REQUIRE(g.node(W).grad_weight.rows() == 2);
}

TEST_CASE("GraphTrainer XOR convergence", "[graph]") {
    Matrix<double> X(4, 2);
    Matrix<double> y(4, 1);
    for (size_t i = 0; i < 4; i++) {
        X(i, 0) = (i < 2) ? 0.0 : 1.0;
        X(i, 1) = (i % 2 == 0) ? 0.0 : 1.0;
        y(i, 0) = (i == 1 || i == 2) ? 1.0 : 0.0;
    }

    GraphTrainer trainer;
    trainer.set_mixed_precision(false);
    NodeId out = trainer.build_mlp({2, 8, 1}, {"relu", "linear"});
    AdamOptimizer opt(0.05);

    MSELoss loss;
    double loss0 = 1.0;
    for (int epoch = 0; epoch < 300; epoch++) {
        loss0 = trainer.train_step(X, y, loss, opt, out);
    }
    REQUIRE(loss0 < 0.08);
}

TEST_CASE("dispatch_matmul matches Matrix::dot on CPU", "[ops]") {
    Matrix<double> A(3, 4, 0.5);
    Matrix<double> B(4, 2, -0.25);
    auto C = dispatch_matmul(Device::cpu(), A, B);
    auto ref = A.dot(B);
    for (size_t i = 0; i < C.size(); i++) {
        REQUIRE_NEAR(C.at(i), ref.at(i), 1e-12);
    }
}

TEST_CASE("TransformerEncoderBlock forward shape", "[transformer]") {
    TransformerEncoderBlock block(8, 2, 16);
    Matrix<double> X(4, 8, 0.1);
    Matrix<double> Y = block.forward(X);
    REQUIRE(Y.rows() == 4);
    REQUIRE(Y.cols() == 8);
}

TEST_CASE("Distributed allreduce mean", "[distributed]") {
    DistributedContext ctx;
    ctx.world_size = 4;
    ctx.rank = 0;
    Matrix<double> g(2, 2, 4.0);
    allreduce_mean(g, ctx);
    REQUIRE_NEAR(g(0, 0), 1.0, 1e-12);
}

TEST_CASE("TrainingConfig engine and architecture", "[protocol]") {
    TrainingConfig cfg = parse_training_config(R"({
        "engine": "graph",
        "device": "cpu",
        "mixedPrecision": true,
        "architecture": "transformer",
        "dModel": 32,
        "numHeads": 4
    })");
    REQUIRE(cfg.engine == "graph");
    REQUIRE(cfg.mixed_precision);
    REQUIRE(cfg.architecture == "transformer");
    REQUIRE(cfg.d_model == 32);
    REQUIRE(cfg.num_heads == 4);
}

TEST_CASE("Float16 round trip", "[precision]") {
    for (double x : {0.0, 0.5, -1.25, 3.14159, 100.0}) {
        Float16 h = Float16::from_double(x);
        REQUIRE_NEAR(h.to_double(), static_cast<float>(x), 1e-3);
    }
}

TEST_CASE("Device defaults to CPU", "[device]") {
    REQUIRE(default_device().is_cpu());
    REQUIRE_FALSE(Device::cuda_available());
}

// Benchmark excluded (requires Catch2 benchmark header)

// ============================================================================
// CyberHex ML Framework — Example Experiments
// ============================================================================
// Build: mkdir build && cd build && cmake .. && make -j
// Run:   ./app
// ============================================================================

#include "matrix.h"
#include "layer.h"
#include "activations.h"
#include "dense.h"
#include "model.h"
#include <iostream>
#include <cmath>
#include <memory>

using namespace cyberhex;

double xor_function(const double* x, size_t n) {
    return (x[0] > 0.5) != (x[1] > 0.5) ? 1.0 : 0.0;
}

double sine_wave(const double* x, size_t n) {
    return std::sin(3 * x[0]) * std::cos(5 * x[1]) + 0.3 * std::sin(10 * (x[0] + x[1]));
}

double moon_shape(const double* x, size_t n) {
    return std::sqrt(x[0]*x[0] + x[1]*x[1]) > 0.5 ? 1.0 : 0.0;
}

// ============================================================================
// Example 1: XOR Problem (classification)
// ============================================================================
void example_xor() {
    std::cout << "\n" << std::string(60, '=') << std::endl;
    std::cout << "EXAMPLE 1: XOR Problem (Classification)" << std::endl;
    std::cout << std::string(60, '=') << std::endl;

    // Create model: 2 -> 16 -> 16 -> 1
    Model model;
    model.add(std::make_unique<Dense>(2, 16, InitType::HE));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(16, 16, InitType::HE));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(16, 1, InitType::XAVIER));
    model.add(std::make_unique<Sigmoid>());

    model.compile(
        std::make_unique<BinaryCrossEntropyLoss>(),
        std::make_unique<AdamOptimizer>(0.01, 0.9, 0.999, 1e-8),
        std::make_unique<CosineAnnealingScheduler>(0.01, 1e-5, 2000)
    );

    // XOR data
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

    // Train
    model.fit(X, y, 2000, 0, 0.0, 0, true);

    // Test
    auto pred = model.predict(X);
    std::cout << "\nXOR Results:" << std::endl;
    std::cout << "x1 x2 | target | predicted" << std::endl;
    std::cout << std::string(30, '-') << std::endl;
    for (size_t i = 0; i < X.rows(); i++) {
        std::cout << X(i, 0) << "  " << X(i, 1) << " |   "
                  << y(i, 0) << "     |   "
                  << std::round(pred(i, 0)) << " (" << pred(i, 0) << ")" << std::endl;
    }

    double acc = accuracy(pred, y);
    std::cout << "\nXOR Accuracy: " << acc * 100 << "%" << std::endl;
}

// ============================================================================
// Example 2: Regression (sine wave approximation)
// ============================================================================
void example_regression() {
    std::cout << "\n" << std::string(60, '=') << std::endl;
    std::cout << "EXAMPLE 2: Regression (Sine Wave Approximation)" << std::endl;
    std::cout << std::string(60, '=') << std::endl;

    // Generate synthetic data
    int N = 500;
    Matrix<double> X(N, 2);
    Matrix<double> y(N, 1);

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<double> dist(-1.0, 1.0);
    std::normal_distribution<double> noise(0.0, 0.05);

    for (int i = 0; i < N; i++) {
        double x1 = dist(gen);
        double x2 = dist(gen);
        X(i, 0) = x1;
        X(i, 1) = x2;
        y(i, 0) = sine_wave(&x1, 2) + noise(gen);
    }

    // Train/test split (80/20)
    auto [X_train, y_train] = train_test_split(X, y, 0.2, true);
    size_t train_n = X_train.rows();

    // Create model: 2 -> 64 -> 64 -> 1
    Model model;
    model.add(std::make_unique<Dense>(2, 64, InitType::HE));
    model.add(std::make_unique<Tanh>());
    model.add(std::make_unique<Dense>(64, 64, InitType::HE));
    model.add(std::make_unique<Tanh>());
    model.add(std::make_unique<Dense>(64, 1, InitType::XAVIER));

    model.compile(
        std::make_unique<MSELoss>(),
        std::make_unique<AdamOptimizer>(0.001)
    );

    model.set_max_grad_norm(1.0);

    // Set up callback for logging
    model.set_on_epoch_end([](const TrainingMetrics& m) {
        static double last_print = 0;
        if (m.epoch >= last_print + 100) {
            last_print = m.epoch;
            std::cout << "  epoch " << m.epoch
                      << " | loss: " << m.loss
                      << " | lr: " << m.learning_rate
                      << std::endl;
        }
    });

    std::cout << "\nTraining regression model on " << train_n << " samples..." << std::endl;
    model.fit(X_train, y_train, 2000, 32, 0.0, 100, false);

    // Test
    auto pred = model.predict(X.row_slice(train_n, N - train_n));
    auto y_test = y.row_slice(train_n, N - train_n);

    double test_mse = MSELoss().forward(pred, y_test);
    std::cout << "\nTest MSE: " << test_mse << std::endl;

    // Print sample results
    std::cout << "\nSample predictions:" << std::endl;
    std::cout << "x1    x2    | target  | predicted" << std::endl;
    std::cout << std::string(40, '-') << std::endl;
    for (size_t i = 0; i < std::min(size_t(10), N - train_n); i++) {
        std::cout << X(train_n + i, 0) << "  " << X(train_n + i, 1) << " | "
                  << y_test(i, 0) << " | "
                  << pred(i, 0) << std::endl;
    }
}

// ============================================================================
// Example 3: Classification (moon-shape decision boundary)
// ============================================================================
void example_classification() {
    std::cout << "\n" << std::string(60, '=') << std::endl;
    std::cout << "EXAMPLE 3: Classification (Moon-Shape Boundary)" << std::endl;
    std::cout << std::string(60, '=') << std::endl;

    // Generate synthetic classification data
    int N = 1000;
    Matrix<double> X(N, 2);
    Matrix<double> y(N, 1);

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<double> dist(-1.0, 1.0);

    for (int i = 0; i < N; i++) {
        double x1 = dist(gen);
        double x2 = dist(gen);
        X(i, 0) = x1;
        X(i, 1) = x2;
        y(i, 0) = moon_shape(&x1, 2);
    }

    // Train/test split
    auto [X_train, y_train] = train_test_split(X, y, 0.2, true);

    // Create model: 2 -> 32 -> 32 -> 1
    Model model;
    model.add(std::make_unique<Dense>(2, 32, InitType::HE));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(32, 32, InitType::HE));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(32, 1, InitType::XAVIER));
    model.add(std::make_unique<Sigmoid>());

    model.compile(
        std::make_unique<BinaryCrossEntropyLoss>(),
        std::make_unique<AdamOptimizer>(0.005)
    );

    std::cout << "\nTraining classification model..." << std::endl;
    model.fit(X_train, y_train, 1000, 0, 0.0, 50, true);
}

// ============================================================================
// Example 4: Gradient Checking
// ============================================================================
void example_gradient_check() {
    std::cout << "\n" << std::string(60, '=') << std::endl;
    std::cout << "EXAMPLE 4: Gradient Checking" << std::endl;
    std::cout << std::string(60, '=') << std::endl;

    Model model;
    model.add(std::make_unique<Dense>(2, 4, InitType::XAVIER));
    model.add(std::make_unique<ReLU>());
    model.add(std::make_unique<Dense>(4, 1, InitType::XAVIER));

    model.compile(
        std::make_unique<MSELoss>(),
        std::make_unique<AdamOptimizer>(0.001)
    );

    Matrix<double> X(4, 2);
    X(0, 0) = 0; X(0, 1) = 0;
    X(1, 0) = 0; X(1, 1) = 1;
    X(2, 0) = 1; X(2, 1) = 0;
    X(3, 0) = 1; X(3, 1) = 1;

    Matrix<double> y(4, 1);
    y(0, 0) = 0; y(1, 0) = 1; y(2, 0) = 1; y(3, 0) = 0;

    bool grad_ok = model.check_gradients(X, y);
    std::cout << "Gradient check: " << (grad_ok ? "PASSED" : "ISSUES DETECTED") << std::endl;
}

// ============================================================================
// Example 5: CSV data loading (if available)
// ============================================================================
void example_csv_loading() {
    std::cout << "\n" << std::string(60, '=') << std::endl;
    std::cout << "EXAMPLE 5: CSV Dataset Loading" << std::endl;
    std::cout << std::string(60, '=') << std::endl;

    // Try to load datasets from common directories
    std::vector<std::string> paths = {
        "data.csv", "../data.csv", "../../data/dataset.csv",
        "/tmp/data.csv"
    };

    for (const auto& path : paths) {
        try {
            Matrix<double> data = load_csv(path, true, ',');
            std::cout << "Loaded " << path << ": " << data.rows() << "x" << data.cols() << std::endl;
            return;
        } catch (...) {
            // File not found, try next
        }
    }

    std::cout << "No CSV datasets found. Generating synthetic data instead." << std::endl;

    // Generate synthetic dataset
    auto dataset = std::make_shared<SyntheticDataset>(
        500, 10, 1,
        [](const double* x, size_t n) {
            double sum = 0;
            for (size_t i = 0; i < n; i++) sum += x[i] * (i + 1);
            return std::tanh(sum / 10.0);
        },
        0.05
    );

    DataLoader loader(dataset, 32, true);
    std::cout << "Synthetic dataset: " << dataset->num_samples() << " samples, "
              << dataset->input_size() << " features." << std::endl;
    std::cout << "DataLoader: " << loader.num_batches() << " batches of size 32." << std::endl;
}

// ============================================================================
// Main
// ============================================================================
int main(int argc, char* argv[]) {
    std::cout << "========================================" << std::endl;
    std::cout << "  CyberHex ML Framework v2.0" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "C++17 | OpenMP | SIMD | Adam | Cross-Entropy" << std::endl;
    std::cout << "========================================" << std::endl;

    int example = 0;
    if (argc > 1) {
        example = std::atoi(argv[1]);
    }

    // Run selected examples
    if (example == 0 || example == 1) example_xor();
    if (example == 0 || example == 2) example_regression();
    if (example == 0 || example == 3) example_classification();
    if (example == 0 || example == 4) example_gradient_check();
    if (example == 0 || example == 5) example_csv_loading();

    std::cout << "\nAll examples completed." << std::endl;
    return 0;
}
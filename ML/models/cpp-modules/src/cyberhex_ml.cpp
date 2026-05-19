// ============================================================================
// CyberHex ML Training CLI — backend integration (cyberhex.train.v1)
// ============================================================================
// Build: cmake --build build --target cyberhex_ml
// Run:   CYBERHEX_CONFIG='{"epochs":10,...}' ./build/cyberhex_ml
// ============================================================================

#include "training_protocol.h"
#include "model.h"
#include "dense.h"
#include "activations.h"
#include "layer.h"
#include "graph.h"
#include "device.h"
#include "transformer.h"
#include "distributed.h"
<<<<<<< HEAD
<<<<<<< HEAD
=======
#include "onnx_export.h"
>>>>>>> v3.0
=======
#include "onnx_export.h"
>>>>>>> master
#include <iostream>
#include <memory>
#include <random>
#include <filesystem>
#include <sstream>
#include <cstdlib>
#include <algorithm>
#include <unistd.h>

using namespace cyberhex;

namespace {

void add_activation(Model& model, const std::string& name) {
    std::string act = name;
    std::transform(act.begin(), act.end(), act.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    if (act == "relu") {
        model.add(std::make_unique<ReLU>());
    } else if (act == "sigmoid") {
        model.add(std::make_unique<Sigmoid>());
    } else if (act == "tanh") {
        model.add(std::make_unique<Tanh>());
    } else if (act == "softmax") {
        model.add(std::make_unique<Softmax>());
    } else if (act == "leaky_relu" || act == "leakyrelu") {
        model.add(std::make_unique<LeakyReLU>());
    } else if (act == "gelu") {
        model.add(std::make_unique<GELU>());
    } else if (act == "swish") {
        model.add(std::make_unique<Swish>());
    } else if (act == "elu") {
        model.add(std::make_unique<ELU>());
    }
    // linear / none — no extra layer
}

void build_model(Model& model, const TrainingConfig& cfg, size_t input_dim, size_t output_dim) {
    std::vector<size_t> layers = cfg.layers;
    if (layers.empty()) {
        layers = {input_dim, 64, 32, output_dim};
    }
    if (layers[0] != input_dim) {
        layers.insert(layers.begin(), input_dim);
    }
    if (layers.back() != output_dim) {
        layers.back() = output_dim;
    }

    for (size_t i = 0; i + 1 < layers.size(); i++) {
        model.add(std::make_unique<Dense>(layers[i], layers[i + 1], InitType::HE));
        if (i < cfg.activations.size()) {
            add_activation(model, cfg.activations[i]);
        } else if (i + 1 < layers.size() - 1) {
            add_activation(model, "relu");
        }
    }
}

std::unique_ptr<LossFunction> make_loss(const TrainingConfig& cfg) {
    std::string loss = cfg.loss;
    std::transform(loss.begin(), loss.end(), loss.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    if (loss == "mae") return std::make_unique<MAELoss>();
    if (loss == "huber") return std::make_unique<HuberLoss>();
    if (loss == "bce") return std::make_unique<BinaryCrossEntropyLoss>();
    if (loss == "cce" || loss == "cross_entropy") return std::make_unique<CategoricalCrossEntropyLoss>();
    return std::make_unique<MSELoss>();
}

std::unique_ptr<Optimizer> make_optimizer(const TrainingConfig& cfg) {
    std::string opt = cfg.optimizer;
    std::transform(opt.begin(), opt.end(), opt.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    if (opt == "sgd") return std::make_unique<SGDOptimizer>(cfg.learning_rate);
    if (opt == "rmsprop") return std::make_unique<RMSpropOptimizer>(cfg.learning_rate);
    if (opt == "adamw") return std::make_unique<AdamOptimizer>(cfg.learning_rate, 0.9, 0.999, 1e-8, 0.01);
    return std::make_unique<AdamOptimizer>(cfg.learning_rate);
}

Matrix<double> generate_regression_data(size_t n_samples, size_t n_features, int seed) {
    std::mt19937 gen(static_cast<unsigned>(seed));
    std::normal_distribution<double> feat_dist(0.0, 1.0);
    std::normal_distribution<double> noise_dist(0.0, 0.3);

    Matrix<double> X(n_samples, n_features);
    for (size_t i = 0; i < X.size(); i++) {
        X.at(i) = feat_dist(gen);
    }

    std::vector<double> weights = {1.5, -2.0, 0.5, 3.0, -1.0};
    Matrix<double> y(n_samples, 1);
    for (size_t i = 0; i < n_samples; i++) {
        double sum = 0.0;
        for (size_t j = 0; j < n_features; j++) {
            double w = j < weights.size() ? weights[j] : 1.0;
            sum += X(i, j) * w;
        }
        y(i, 0) = sum + noise_dist(gen);
    }
    return y;
}

Matrix<double> generate_classification_data(size_t n_samples, size_t n_features,
                                            size_t n_classes, int seed) {
    std::mt19937 gen(static_cast<unsigned>(seed));
    std::normal_distribution<double> dist(0.0, 1.0);

    Matrix<double> X(n_samples, n_features);
    for (size_t i = 0; i < X.size(); i++) {
        X.at(i) = dist(gen);
    }

    std::vector<std::vector<double>> true_w(n_features, std::vector<double>(n_classes));
    std::uniform_real_distribution<double> w_dist(-1.0, 1.0);
    for (size_t j = 0; j < n_features; j++) {
        for (size_t c = 0; c < n_classes; c++) {
            true_w[j][c] = w_dist(gen);
        }
    }

    Matrix<double> y(n_samples, n_classes, 0.0);
    for (size_t i = 0; i < n_samples; i++) {
        size_t best = 0;
        double best_logit = -1e18;
        for (size_t c = 0; c < n_classes; c++) {
            double logit = 0.0;
            for (size_t j = 0; j < n_features; j++) {
                logit += X(i, j) * true_w[j][c];
            }
            if (logit > best_logit) {
                best_logit = logit;
                best = c;
            }
        }
        y(i, best) = 1.0;
    }
    return y;
}

bool load_dataset(const TrainingConfig& cfg, Matrix<double>& X, Matrix<double>& y) {
    if (!cfg.data_path.empty() && std::filesystem::exists(cfg.data_path)) {
        try {
            Matrix<double> data = load_csv(cfg.data_path, true, ',');
            if (data.cols() < 2) {
                emit_log("CSV must have at least one feature column and one label column");
                return false;
            }
            size_t rows = data.rows();
            size_t feat_cols = data.cols() - 1;
            X = Matrix<double>(rows, feat_cols);
            y = Matrix<double>(rows, 1);
            for (size_t i = 0; i < rows; i++) {
                for (size_t j = 0; j < feat_cols; j++) {
                    X(i, j) = data(i, j);
                }
                y(i, 0) = data(i, feat_cols);
            }
            return true;
        } catch (const std::exception& e) {
            emit_log(std::string("Failed to load CSV: ") + e.what() + ", using synthetic data");
        }
    }
    return false;
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> master
void maybe_export_onnx(const TrainingConfig& cfg, const std::string& prefix) {
    if (!cfg.export_onnx) return;
    std::string manifest = prefix + "/export_manifest.json";
    if (write_export_manifest(prefix, manifest, cfg.task)) {
        emit_log("ONNX export manifest written: " + manifest);
    }
}

<<<<<<< HEAD
>>>>>>> v3.0
=======
>>>>>>> master
void configure_device(const TrainingConfig& cfg) {
    if (!std::getenv("CYBERHEX_DEVICE")) {
        std::string dev = cfg.device;
        std::transform(dev.begin(), dev.end(), dev.begin(),
                       [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
        if (dev == "cuda" || dev == "gpu") {
            set_default_device(DeviceType::CUDA);
        } else {
            set_default_device(DeviceType::CPU);
        }
    } else {
        init_device_from_env();
    }
}

int run_graph_training(const TrainingConfig& cfg, Matrix<double>& X, Matrix<double>& y,
                       size_t output_dim) {
    GraphTrainer trainer;
    trainer.set_mixed_precision(cfg.mixed_precision);
    trainer.graph().set_device(default_device());

    std::vector<size_t> layers = cfg.layers;
    if (layers.empty()) {
        layers = {X.cols(), 64, 32, output_dim};
    }
    if (layers[0] != X.cols()) layers.insert(layers.begin(), X.cols());
    if (layers.back() != output_dim) layers.back() = output_dim;

    NodeId out = trainer.build_mlp(layers, cfg.activations);
    auto loss = make_loss(cfg);
    auto opt = make_optimizer(cfg);
    DistributedContext dist = DistributedContext::from_env();

    int patience = cfg.early_stopping ? cfg.patience : 0;
    double val_split = cfg.validation_split;
    bool has_val = val_split > 0.0;

    double final_train = 0.0;
    double final_val = 0.0;

    trainer.fit(X, y, out, *loss, *opt, cfg.epochs, cfg.batch_size, val_split, patience,
                [&](int epoch, double train_loss, double val_loss, bool hv) {
                    final_train = train_loss;
                    if (hv) final_val = val_loss;
                    emit_epoch(epoch, train_loss, val_loss, hv);
                },
                dist.is_distributed() ? &dist : nullptr);

    if (!has_val) final_val = final_train;

    std::filesystem::path out_dir;
    if (const char* root = std::getenv("CYBERHEX_PROJECT_ROOT")) {
        out_dir = std::filesystem::path(root) / "ML" / "models" / "outputs";
    } else {
        out_dir = std::filesystem::current_path() / ".." / "outputs";
    }
    std::filesystem::create_directories(out_dir);
    std::ostringstream prefix;
    prefix << "graph_" << ::getpid();
    std::filesystem::path prefix_path = out_dir / prefix.str();
    trainer.save_weights(prefix_path.string());
    std::string model_path = prefix_path.string();
<<<<<<< HEAD
<<<<<<< HEAD
=======
    maybe_export_onnx(cfg, prefix_path.string());
>>>>>>> v3.0
=======
    maybe_export_onnx(cfg, prefix_path.string());
>>>>>>> master
    emit_training_complete(final_train, final_val, model_path);
    return 0;
}

int run_transformer_training(const TrainingConfig& cfg, Matrix<double>& X, Matrix<double>& y) {
    Model model;
    for (size_t i = 0; i < cfg.transformer_layers; i++) {
        model.add(std::make_unique<TransformerEncoderBlock>(
            cfg.d_model, cfg.num_heads, cfg.ffn_dim));
    }
    model.add(std::make_unique<Dense>(cfg.d_model, y.cols(), InitType::HE));
    model.compile(make_loss(cfg), make_optimizer(cfg));

    int patience = cfg.early_stopping ? cfg.patience : 0;
    double final_train = 0.0;
    double final_val = 0.0;
    bool has_val = cfg.validation_split > 0.0;

    model.set_on_epoch_end([&](const TrainingMetrics& m) {
        final_train = m.loss;
        if (has_val && m.val_loss >= 0.0) final_val = m.val_loss;
        emit_epoch(m.epoch + 1, m.loss, m.val_loss, has_val && m.val_loss >= 0.0);
    });

    if (X.cols() != cfg.d_model) {
        emit_log("Transformer expects feature dim == d_model; padding/truncating columns");
        Matrix<double> Xp(X.rows(), cfg.d_model, 0.0);
        size_t copy_cols = std::min(X.cols(), cfg.d_model);
        for (size_t i = 0; i < X.rows(); i++) {
            for (size_t j = 0; j < copy_cols; j++) Xp(i, j) = X(i, j);
        }
        X = std::move(Xp);
    }

    model.fit(X, y, cfg.epochs, cfg.batch_size, cfg.validation_split, patience, false);
    if (!has_val) final_val = final_train;

    std::filesystem::path out_dir;
    if (const char* root = std::getenv("CYBERHEX_PROJECT_ROOT")) {
        out_dir = std::filesystem::path(root) / "ML" / "models" / "outputs";
    } else {
        out_dir = std::filesystem::current_path() / ".." / "outputs";
    }
    std::filesystem::create_directories(out_dir);
    std::ostringstream prefix;
    prefix << "transformer_" << ::getpid();
    std::filesystem::path prefix_path = out_dir / prefix.str();
    model.save_weights(prefix_path.string());
<<<<<<< HEAD
<<<<<<< HEAD
=======
    model.save_weights_binary(prefix_path.string());
    maybe_export_onnx(cfg, prefix_path.string());
>>>>>>> v3.0
=======
    model.save_weights_binary(prefix_path.string());
    maybe_export_onnx(cfg, prefix_path.string());
>>>>>>> master
    emit_training_complete(final_train, final_val, prefix_path.string() + "_weights");
    return 0;
}

} // namespace

int main() {
    TrainingConfig cfg = load_config_from_env();
    configure_device(cfg);

    {
        std::ostringstream oss;
        oss << "CyberHex C++ trainer starting (task=" << cfg.task
            << ", epochs=" << cfg.epochs << ")";
        emit_log(oss.str());
    }

    Matrix<double> X;
    Matrix<double> y;
    const size_t default_features = 5;
    const size_t n_samples = 1000;

  if (!load_dataset(cfg, X, y)) {
        if (cfg.task == "classification") {
            size_t n_classes = cfg.layers.empty() ? 3 : std::max(cfg.layers.back(), size_t(2));
            X = Matrix<double>(n_samples, 10);
            std::mt19937 gen(static_cast<unsigned>(cfg.seed));
            std::normal_distribution<double> dist(0.0, 1.0);
            for (size_t i = 0; i < X.size(); i++) X.at(i) = dist(gen);
            y = generate_classification_data(n_samples, 10, n_classes, cfg.seed);
            emit_log("Generated synthetic classification data (1000 x 10)");
        } else {
            X = Matrix<double>(n_samples, default_features);
            std::mt19937 gen(static_cast<unsigned>(cfg.seed));
            std::normal_distribution<double> dist(0.0, 1.0);
            for (size_t i = 0; i < X.size(); i++) X.at(i) = dist(gen);
            y = generate_regression_data(n_samples, default_features, cfg.seed);
            emit_log("Generated synthetic regression data (1000 x 5)");
        }
    } else {
        std::ostringstream oss;
        oss << "Loaded data from " << cfg.data_path << " shape=" << X.rows() << "x" << X.cols();
        emit_log(oss.str());
    }

    size_t output_dim = (cfg.task == "classification")
        ? (cfg.layers.empty() ? 3 : cfg.layers.back())
        : 1;
    if (cfg.task == "classification" && y.cols() == 1) {
        size_t max_class = 0;
        for (size_t i = 0; i < y.rows(); i++) {
            max_class = std::max(max_class, static_cast<size_t>(y(i, 0)));
        }
        size_t n_classes = max_class + 1;
        Matrix<double> y_oh(y.rows(), n_classes, 0.0);
        for (size_t i = 0; i < y.rows(); i++) {
            size_t c = static_cast<size_t>(y(i, 0));
            if (c < n_classes) y_oh(i, c) = 1.0;
        }
        y = std::move(y_oh);
        output_dim = n_classes;
    }

    std::string engine = cfg.engine;
    std::transform(engine.begin(), engine.end(), engine.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    std::string arch = cfg.architecture;
    std::transform(arch.begin(), arch.end(), arch.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });

    if (engine == "graph") {
        return run_graph_training(cfg, X, y, output_dim);
    }
    if (arch == "transformer") {
        return run_transformer_training(cfg, X, y);
    }

    Model model;
    build_model(model, cfg, X.cols(), output_dim);
    model.compile(make_loss(cfg), make_optimizer(cfg));

    int patience = cfg.early_stopping ? cfg.patience : 0;
    double val_split = cfg.validation_split;

    double final_train = 0.0;
    double final_val = 0.0;
    bool has_val = val_split > 0.0;

    model.set_on_epoch_end([&](const TrainingMetrics& m) {
        final_train = m.loss;
        if (has_val && m.val_loss >= 0.0) {
            final_val = m.val_loss;
        }
        emit_epoch(m.epoch + 1, m.loss, m.val_loss, has_val && m.val_loss >= 0.0);
    });

    model.fit(X, y, cfg.epochs, cfg.batch_size, val_split, patience, false);

    if (!has_val) {
        final_val = final_train;
    }

    std::filesystem::path out_dir;
    if (const char* root = std::getenv("CYBERHEX_PROJECT_ROOT")) {
        out_dir = std::filesystem::path(root) / "ML" / "models" / "outputs";
    } else {
        out_dir = std::filesystem::current_path() / ".." / "outputs";
    }
    std::error_code ec;
    std::filesystem::create_directories(out_dir, ec);

    std::ostringstream prefix;
    prefix << "model_" << ::getpid();
    std::filesystem::path prefix_path = out_dir / prefix.str();
    model.save_weights(prefix_path.string());
<<<<<<< HEAD
<<<<<<< HEAD
=======
    model.save_weights_binary(prefix_path.string());
    maybe_export_onnx(cfg, prefix_path.string());
>>>>>>> v3.0
=======
    model.save_weights_binary(prefix_path.string());
    maybe_export_onnx(cfg, prefix_path.string());
>>>>>>> master

    std::string model_path = prefix_path.string() + "_weights";
    emit_training_complete(final_train, final_val, model_path);
    return 0;
}

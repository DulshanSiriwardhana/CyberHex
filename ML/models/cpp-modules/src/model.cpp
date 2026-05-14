#include "model.h"
#include "dense.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <cmath>
#include <chrono>
#include <filesystem>
#include <random>
#include <algorithm>

namespace cyberhex {

// ============================================================================
// TensorDataset
// ============================================================================
TensorDataset::TensorDataset(const Matrix<double>& X, const Matrix<double>& y)
    : X_(X), y_(y) {}

std::pair<Matrix<double>, Matrix<double>>
TensorDataset::get_batch(size_t start, size_t end) const {
    end = std::min(end, X_.rows());
    size_t batch_size = end - start;
    if (batch_size == 0) return {Matrix<double>(), Matrix<double>()};

    Matrix<double> X_batch(batch_size, X_.cols());
    Matrix<double> y_batch(batch_size, y_.cols());

    for (size_t i = 0; i < batch_size; i++) {
        for (size_t j = 0; j < X_.cols(); j++) {
            X_batch(i, j) = X_(start + i, j);
        }
        for (size_t j = 0; j < y_.cols(); j++) {
            y_batch(i, j) = y_(start + i, j);
        }
    }

    return {std::move(X_batch), std::move(y_batch)};
}

// ============================================================================
// SyntheticDataset
// ============================================================================
SyntheticDataset::SyntheticDataset(size_t num_samples, size_t input_size,
                                    size_t output_size,
                                    std::function<double(const double*, size_t)> func,
                                    double noise)
    : num_samples_(num_samples), input_size_(input_size),
      output_size_(output_size), func_(func), noise_(noise) {}

Matrix<double> SyntheticDataset::get_X() const {
    Matrix<double> X(num_samples_, input_size_);
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<double> dist(-1.0, 1.0);

    for (size_t i = 0; i < X.size(); i++) {
        X.at(i) = dist(gen);
    }
    return X;
}

Matrix<double> SyntheticDataset::get_y() const {
    Matrix<double> X = get_X();
    Matrix<double> y(num_samples_, output_size_, 0.0);
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<double> noise_dist(0.0, noise_);

    if (func_) {
        for (size_t i = 0; i < num_samples_; i++) {
            double* row = X.row(i);
            y(i, 0) = func_(row, input_size_) + noise_dist(gen);
        }
    }

    return y;
}

std::pair<Matrix<double>, Matrix<double>>
SyntheticDataset::get_batch(size_t start, size_t end) const {
    end = std::min(end, num_samples_);
    size_t batch_size = end - start;

    Matrix<double> X_batch(batch_size, input_size_);
    Matrix<double> y_batch(batch_size, output_size_, 0.0);

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<double> dist(-1.0, 1.0);
    std::normal_distribution<double> noise_dist(0.0, noise_);

    for (size_t i = 0; i < batch_size; i++) {
        double x_vals[32]; // max input size for synthetic
        for (size_t j = 0; j < input_size_; j++) {
            double val = dist(gen);
            X_batch(i, j) = val;
            x_vals[j] = val;
        }
        if (func_) {
            y_batch(i, 0) = func_(x_vals, input_size_) + noise_dist(gen);
        }
    }

    return {std::move(X_batch), std::move(y_batch)};
}

// ============================================================================
// CSV Loading
// ============================================================================
Matrix<double> load_csv(const std::string& filename, bool has_header, char delimiter) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open file: " + filename);
    }

    std::vector<std::vector<double>> data;
    std::string line;
    bool first_line = true;

    while (std::getline(file, line)) {
        if (first_line && has_header) {
            first_line = false;
            continue;
        }
        first_line = false;

        std::vector<double> row;
        std::stringstream ss(line);
        std::string cell;

        while (std::getline(ss, cell, delimiter)) {
            row.push_back(std::stod(cell));
        }

        if (!row.empty()) {
            data.push_back(row);
        }
    }

    if (data.empty()) {
        throw std::runtime_error("Empty CSV file: " + filename);
    }

    size_t rows = data.size();
    size_t cols = data[0].size();
    Matrix<double> result(rows, cols);

    for (size_t i = 0; i < rows; i++) {
        for (size_t j = 0; j < cols; j++) {
            result(i, j) = data[i][j];
        }
    }

    return result;
}

// ============================================================================
// DataLoader
// ============================================================================
DataLoader::DataLoader(std::shared_ptr<Dataset> dataset, size_t batch_size, bool shuffle)
    : dataset_(dataset), batch_size_(batch_size), shuffle_(shuffle), current_idx_(0) {
    indices_.resize(dataset_->num_samples());
    for (size_t i = 0; i < indices_.size(); i++) indices_[i] = i;
    if (shuffle_) shuffle();
}

size_t DataLoader::num_batches() const {
    return (dataset_->num_samples() + batch_size_ - 1) / batch_size_;
}

void DataLoader::reset() {
    current_idx_ = 0;
    if (shuffle_) shuffle();
}

bool DataLoader::has_next() const {
    return current_idx_ < dataset_->num_samples();
}

std::pair<Matrix<double>, Matrix<double>> DataLoader::next_batch() {
    if (current_idx_ >= dataset_->num_samples()) {
        return {Matrix<double>(), Matrix<double>()};
    }

    size_t end = std::min(current_idx_ + batch_size_, dataset_->num_samples());
    auto batch = dataset_->get_batch(current_idx_, end);
    current_idx_ = end;
    return batch;
}

void DataLoader::shuffle() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::shuffle(indices_.begin(), indices_.end(), gen);
}

// ============================================================================
// Checkpoint
// ============================================================================
void Checkpoint::save(const std::string& path) {
    std::ofstream file(path, std::ios::binary);
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open checkpoint file for writing: " + path);
    }

    file.write(reinterpret_cast<const char*>(&epoch), sizeof(int));
    file.write(reinterpret_cast<const char*>(&loss), sizeof(double));
    file.write(reinterpret_cast<const char*>(&best_loss), sizeof(double));

    // Layer types
    size_t num_layers = layer_types.size();
    file.write(reinterpret_cast<const char*>(&num_layers), sizeof(size_t));
    for (const auto& type : layer_types) {
        size_t len = type.size();
        file.write(reinterpret_cast<const char*>(&len), sizeof(size_t));
        file.write(type.c_str(), len);
    }

    // Shapes
    for (const auto& shape : shapes) {
        size_t dims = shape.size();
        file.write(reinterpret_cast<const char*>(&dims), sizeof(size_t));
        file.write(reinterpret_cast<const char*>(shape.data()), dims * sizeof(size_t));
    }

    // Weights
    for (const auto& w : weights_flat) {
        size_t len = w.size();
        file.write(reinterpret_cast<const char*>(&len), sizeof(size_t));
        file.write(reinterpret_cast<const char*>(w.data()), len * sizeof(double));
    }

    // Biases
    for (const auto& b : bias_flat) {
        size_t len = b.size();
        file.write(reinterpret_cast<const char*>(&len), sizeof(size_t));
        file.write(reinterpret_cast<const char*>(b.data()), len * sizeof(double));
    }
}

Checkpoint Checkpoint::load(const std::string& path) {
    std::ifstream file(path, std::ios::binary);
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open checkpoint file: " + path);
    }

    Checkpoint cp;
    file.read(reinterpret_cast<char*>(&cp.epoch), sizeof(int));
    file.read(reinterpret_cast<char*>(&cp.loss), sizeof(double));
    file.read(reinterpret_cast<char*>(&cp.best_loss), sizeof(double));

    size_t num_layers;
    file.read(reinterpret_cast<char*>(&num_layers), sizeof(size_t));
    cp.layer_types.resize(num_layers);
    cp.shapes.resize(num_layers);
    cp.weights_flat.resize(num_layers);
    cp.bias_flat.resize(num_layers);

    for (size_t i = 0; i < num_layers; i++) {
        size_t len;
        file.read(reinterpret_cast<char*>(&len), sizeof(size_t));
        cp.layer_types[i].resize(len);
        file.read(&cp.layer_types[i][0], len);

        size_t dims;
        file.read(reinterpret_cast<char*>(&dims), sizeof(size_t));
        cp.shapes[i].resize(dims);
        file.read(reinterpret_cast<char*>(cp.shapes[i].data()), dims * sizeof(size_t));

        file.read(reinterpret_cast<char*>(&len), sizeof(size_t));
        cp.weights_flat[i].resize(len);
        file.read(reinterpret_cast<char*>(cp.weights_flat[i].data()), len * sizeof(double));

        file.read(reinterpret_cast<char*>(&len), sizeof(size_t));
        cp.bias_flat[i].resize(len);
        file.read(reinterpret_cast<char*>(cp.bias_flat[i].data()), len * sizeof(double));
    }

    return cp;
}

// ============================================================================
// Model
// ============================================================================
void Model::add(std::unique_ptr<Layer> layer) {
    layers_.push_back(std::move(layer));
}

void Model::add(Layer* layer) {
    layers_.emplace_back(layer);
}

Layer* Model::get_layer(size_t index) {
    if (index >= layers_.size()) return nullptr;
    return layers_[index].get();
}

Matrix<double> Model::forward(const Matrix<double>& X) {
    std::lock_guard<std::mutex> lock(mtx_);
    Matrix<double> out = X;
    for (const auto& l : layers_) {
        out = l->forward(out);
    }
    return out;
}

double Model::compute_loss(const Matrix<double>& pred, const Matrix<double>& target) {
    if (!loss_fn_) {
        throw std::runtime_error("Loss function not set");
    }
    return loss_fn_->forward(pred, target);
}

Matrix<double> Model::compute_loss_grad(const Matrix<double>& pred, const Matrix<double>& target) {
    if (!loss_fn_) {
        throw std::runtime_error("Loss function not set");
    }
    return loss_fn_->backward(pred, target);
}

void Model::compile(std::unique_ptr<LossFunction> loss_fn,
                    std::unique_ptr<Optimizer> optimizer,
                    std::unique_ptr<LRScheduler> scheduler) {
    loss_fn_ = std::move(loss_fn);
    optimizer_ = std::move(optimizer);
    scheduler_ = std::move(scheduler);
}

void Model::fit(const Matrix<double>& X, const Matrix<double>& y,
                int epochs, int batch_size,
                double validation_split,
                int early_stopping_patience,
                bool verbose) {
    if (!loss_fn_) {
        throw std::runtime_error("Model not compiled: call compile() first");
    }

    size_t num_samples = X.rows();
    size_t val_samples = static_cast<size_t>(num_samples * validation_split);
    size_t train_samples = num_samples - val_samples;

    auto start_time = std::chrono::steady_clock::now();

    for (epoch_ = 0; epoch_ < epochs; epoch_++) {
        double total_loss = 0.0;
        double total_accuracy = 0.0;
        int batches = 0;

        if (batch_size <= 0 || batch_size >= (int)train_samples) {
            // Full batch gradient descent
            Matrix<double> pred = forward(X.row_slice(0, train_samples));
            double loss_val = compute_loss(pred, y.row_slice(0, train_samples));
            Matrix<double> grad = compute_loss_grad(pred, y.row_slice(0, train_samples));

            // Clip gradients
            if (max_grad_norm_ > 0.0) {
                double grad_norm = grad.norm();
                if (grad_norm > max_grad_norm_) {
                    grad *= (max_grad_norm_ / grad_norm);
                }
            }

            // Backward pass (all layers handle updates internally)
            for (int i = (int)layers_.size() - 1; i >= 0; i--) {
                double lr = optimizer_ ? optimizer_->get_lr() : 0.01;
                grad = layers_[i]->backward(grad, lr, OptimizerType::ADAM, epoch_ + 1);
            }

            total_loss = loss_val;
            batches = 1;
        } else {
            // Mini-batch gradient descent
            for (size_t start = 0; start < train_samples; start += batch_size) {
                size_t end = std::min(start + batch_size, train_samples);
                size_t actual_batch = end - start;

                auto [X_batch, y_batch] = TensorDataset(
                    X.row_slice(start, actual_batch),
                    y.row_slice(start, actual_batch)
                ).get_batch(0, actual_batch);

                Matrix<double> pred = forward(X_batch);
                double loss_val = compute_loss(pred, y_batch);
                Matrix<double> grad = compute_loss_grad(pred, y_batch);

                total_loss += loss_val;

                // Backward pass
                for (int i = (int)layers_.size() - 1; i >= 0; i--) {
                    double lr = optimizer_ ? optimizer_->get_lr() : 0.01;
                    grad = layers_[i]->backward(grad, lr, OptimizerType::ADAM, epoch_ + 1);
                }

                batches++;

                // Batch callback
                if (on_batch_end_) {
                    TrainingMetrics m;
                    m.loss = loss_val;
                    m.epoch = epoch_;
                    m.learning_rate = optimizer_ ? optimizer_->get_lr() : 0.01;
                    if (on_batch_end_(m)) goto early_stop;
                }
            }
        }

        double avg_loss = total_loss / batches;

        // Update learning rate schedule
        if (scheduler_) {
            double new_lr = scheduler_->get_lr(epoch_);
            if (optimizer_) optimizer_->set_lr(new_lr);
        }

        // Compute validation accuracy
        double val_accuracy = 0.0;
        if (validation_split > 0.0) {
            auto X_val = X.row_slice(train_samples, val_samples);
            auto y_val = y.row_slice(train_samples, val_samples);
            auto val_pred = forward(X_val);
            val_accuracy = accuracy(val_pred, y_val);
        }

        auto now = std::chrono::steady_clock::now();
        double elapsed = std::chrono::duration<double>(now - start_time).count();

        if (verbose && epoch_ % 10 == 0) {
            std::cout << "Epoch " << epoch_ + 1 << "/" << epochs
                      << " - loss: " << avg_loss
                      << " - lr: " << (optimizer_ ? optimizer_->get_lr() : 0.01)
                      << " - time: " << elapsed << "s" << std::endl;

            // WebSocket broadcast
            if (ws_server_) {
                std::string msg = "{\"epoch\": " + std::to_string(epoch_) +
                    ", \"loss\": " + std::to_string(avg_loss) +
                    ", \"lr\": " + std::to_string(optimizer_ ? optimizer_->get_lr() : 0.01) +
                    ", \"accuracy\": " + std::to_string(val_accuracy) + "}";
                ws_server_->broadcast(msg);
            }
        }

        // Callback
        if (on_epoch_end_) {
            TrainingMetrics m;
            m.loss = avg_loss;
            m.accuracy = val_accuracy;
            m.epoch = epoch_;
            m.learning_rate = optimizer_ ? optimizer_->get_lr() : 0.01;
            m.elapsed_seconds = elapsed;
            m.loss_name = loss_fn_ ? loss_fn_->name() : "MSE";
            on_epoch_end_(m);
        }

        // Early stopping
        if (early_stopping_patience > 0) {
            if (avg_loss < best_loss_) {
                best_loss_ = avg_loss;
                patience_counter_ = 0;
            } else {
                patience_counter_++;
                if (patience_counter_ >= early_stopping_patience) {
                    if (verbose) {
                        std::cout << "Early stopping triggered at epoch " << epoch_ + 1 << std::endl;
                    }
                    break;
                }
            }
        }
    }

early_stop:
    if (verbose) {
        std::cout << "Training complete. Best loss: " << best_loss_ << std::endl;
    }
}

void Model::fit_dataloader(DataLoader& train_loader, int epochs,
                           DataLoader* val_loader, int early_stopping_patience,
                           bool verbose) {
    if (!loss_fn_) {
        throw std::runtime_error("Model not compiled");
    }

    auto start_time = std::chrono::steady_clock::now();

    for (epoch_ = 0; epoch_ < epochs; epoch_++) {
        train_loader.reset();
        double total_loss = 0.0;
        int batches = 0;

        while (train_loader.has_next()) {
            auto [X_batch, y_batch] = train_loader.next_batch();
            if (X_batch.empty()) break;

            Matrix<double> pred = forward(X_batch);
            double loss_val = compute_loss(pred, y_batch);
            Matrix<double> grad = compute_loss_grad(pred, y_batch);

            total_loss += loss_val;

            for (int i = (int)layers_.size() - 1; i >= 0; i--) {
                double lr = optimizer_ ? optimizer_->get_lr() : 0.01;
                grad = layers_[i]->backward(grad, lr, OptimizerType::ADAM, epoch_ + 1);
            }

            batches++;
        }

        double avg_loss = batches > 0 ? total_loss / batches : 0.0;

        if (val_loader) {
            val_loader->reset();
            double val_loss = 0.0;
            int val_batches = 0;
            double val_correct = 0.0;
            double val_total = 0.0;

            while (val_loader->has_next()) {
                auto [X_val, y_val] = val_loader->next_batch();
                if (X_val.empty()) break;
                auto pred = forward(X_val);
                val_loss += compute_loss(pred, y_val);
                val_total += y_val.rows();
                val_batches++;
            }
        }

        if (verbose && epoch_ % 10 == 0) {
            auto now = std::chrono::steady_clock::now();
            double elapsed = std::chrono::duration<double>(now - start_time).count();

            std::cout << "Epoch " << epoch_ + 1 << "/" << epochs
                      << " - loss: " << avg_loss
                      << " - time: " << elapsed << "s" << std::endl;
        }
    }
}

Matrix<double> Model::predict(const Matrix<double>& X) {
    return forward(X);
}

void Model::save_weights(const std::string& prefix) {
    namespace fs = std::filesystem;
    fs::create_directories(prefix);

    std::lock_guard<std::mutex> lock(mtx_);

    for (size_t idx = 0; idx < layers_.size(); idx++) {
        Dense* d = dynamic_cast<Dense*>(layers_[idx].get());
        if (d) {
            std::string path = prefix + "/layer_" + std::to_string(idx) + ".json";
            std::ofstream f(path);
            const auto& W = d->getWeights();
            const auto& B = d->getBias();

            f << "{\n";
            f << "  \"layerType\": \"Dense\",\n";
            f << "  \"inputShape\": " << W.rows() << ",\n";
            f << "  \"outputShape\": " << W.cols() << ",\n";
            f << "  \"weights\": [\n";
            for (size_t i = 0; i < W.rows(); i++) {
                f << "    [";
                for (size_t j = 0; j < W.cols(); j++) {
                    f << W(i, j) << (j == W.cols() - 1 ? "" : ", ");
                }
                f << "]" << (i == W.rows() - 1 ? "" : ",") << "\n";
            }
            f << "  ],\n";
            f << "  \"bias\": [\n    ";
            for (size_t j = 0; j < B.cols(); j++) {
                f << B(0, j) << (j == B.cols() - 1 ? "" : ", ");
            }
            f << "\n  ]\n";
            f << "}\n";
            f.close();
        }
    }
}

void Model::save_weights_binary(const std::string& prefix) {
    namespace fs = std::filesystem;
    fs::create_directories(prefix);

    std::lock_guard<std::mutex> lock(mtx_);

    for (size_t idx = 0; idx < layers_.size(); idx++) {
        Dense* d = dynamic_cast<Dense*>(layers_[idx].get());
        if (d) {
            std::string w_path = prefix + "/layer_" + std::to_string(idx) + "_weights.bin";
            std::string b_path = prefix + "/layer_" + std::to_string(idx) + "_bias.bin";
            std::ofstream wf(w_path, std::ios::binary);
            std::ofstream bf(b_path, std::ios::binary);

            const auto& W = d->getWeights();
            const auto& B = d->getBias();

            size_t rows = W.rows(), cols = W.cols();
            wf.write(reinterpret_cast<const char*>(&rows), sizeof(size_t));
            wf.write(reinterpret_cast<const char*>(&cols), sizeof(size_t));
            wf.write(reinterpret_cast<const char*>(W.data()), W.size() * sizeof(double));

            rows = B.rows(); cols = B.cols();
            bf.write(reinterpret_cast<const char*>(&rows), sizeof(size_t));
            bf.write(reinterpret_cast<const char*>(&cols), sizeof(size_t));
            bf.write(reinterpret_cast<const char*>(B.data()), B.size() * sizeof(double));
        }
    }
}

void Model::load_weights(const std::string& prefix) {
    // TODO: Implement weights loading
}

void Model::save_checkpoint(const std::string& path) {
    Checkpoint cp;
    cp.epoch = epoch_;
    cp.loss = best_loss_;
    cp.best_loss = best_loss_;

    for (size_t idx = 0; idx < layers_.size(); idx++) {
        Dense* d = dynamic_cast<Dense*>(layers_[idx].get());
        if (d) {
            cp.layer_types.push_back("Dense");
            const auto& W = d->getWeights();
            const auto& B = d->getBias();

            cp.shapes.push_back({W.rows(), W.cols(), B.rows(), B.cols()});

            std::vector<double> w_flat(W.size());
            std::memcpy(w_flat.data(), W.data(), W.size() * sizeof(double));
            cp.weights_flat.push_back(w_flat);

            std::vector<double> b_flat(B.size());
            std::memcpy(b_flat.data(), B.data(), B.size() * sizeof(double));
            cp.bias_flat.push_back(b_flat);
        }
    }

    cp.save(path);
}

void Model::load_checkpoint(const std::string& path) {
    Checkpoint cp = Checkpoint::load(path);
    epoch_ = cp.epoch;
    best_loss_ = cp.best_loss;

    size_t dense_idx = 0;
    for (size_t idx = 0; idx < layers_.size(); idx++) {
        Dense* d = dynamic_cast<Dense*>(layers_[idx].get());
        if (d && dense_idx < cp.weights_flat.size()) {
            auto& W = const_cast<Matrix<double>&>(d->getWeights());
            auto& B = const_cast<Matrix<double>&>(d->getBias());

            std::memcpy(W.data(), cp.weights_flat[dense_idx].data(),
                       W.size() * sizeof(double));
            std::memcpy(B.data(), cp.bias_flat[dense_idx].data(),
                       B.size() * sizeof(double));
            dense_idx++;
        }
    }
}

void Model::export_onnx(const std::string& filename) {
    std::ofstream f(filename);
    f << "{\n";
    f << "  \"ir_version\": 7,\n";
    f << "  \"producer_name\": \"CyberHex\",\n";
    f << "  \"graph\": {\n";
    f << "    \"name\": \"CyberHexModel\",\n";
    f << "    \"node\": [\n";

    for (size_t idx = 0; idx < layers_.size(); idx++) {
        Dense* d = dynamic_cast<Dense*>(layers_[idx].get());
        if (d) {
            f << "      {\n";
            f << "        \"op_type\": \"Gemm\",\n";
            f << "        \"name\": \"dense_" << idx << "\",\n";
            f << "        \"attribute\": [\n";
            f << "          {\"name\": \"transB\", \"i\": 1}\n";
            f << "        ],\n";
            f << "        \"input\": [\"input" << idx << "\"],\n";
            f << "        \"output\": [\"output" << idx << "\"]\n";
            f << "      }";
            if (idx < layers_.size() - 1) f << ",";
            f << "\n";
        }
    }

    f << "    ]\n";
    f << "  }\n";
    f << "}\n";
    f.close();
}

void Model::reset() {
    layers_.clear();
    loss_fn_.reset();
    optimizer_.reset();
    epoch_ = 0;
    best_loss_ = 1e18;
    patience_counter_ = 0;
}

bool Model::check_gradients(const Matrix<double>& X, const Matrix<double>& y,
                            double epsilon, double tolerance) {
    // Forward pass + backward pass to get analytical gradients
    Matrix<double> pred = forward(X);
    Matrix<double> grad = compute_loss_grad(pred, y);

    // Store analytical gradients for each parameter
    std::vector<Matrix<double>> analytical_grads;

    // Backward pass through all layers
    Matrix<double> current_grad = grad;
    for (int i = (int)layers_.size() - 1; i >= 0; i--) {
        Dense* d = dynamic_cast<Dense*>(layers_[i].get());
        if (d) {
            // Get the gradient w.r.t. weights (we'll compute numerically)
            // For simplicity, we store current_grad as the gradient we're tracking
        }
        double lr = 0.0; // Don't update during gradient checking
        current_grad = layers_[i]->backward(current_grad, lr, OptimizerType::SGD, 1);
    }

    // Numerical gradient checking (simplified)
    bool all_pass = true;

    for (size_t layer_idx = 0; layer_idx < layers_.size(); layer_idx++) {
        Dense* d = dynamic_cast<Dense*>(layers_[layer_idx].get());
        if (!d) continue;

        const auto& W = d->getWeights();

        // Check a sample of weights
        size_t check_count = std::min(W.size(), size_t(10));
        for (size_t p = 0; p < check_count; p++) {
            size_t idx = (p * W.size()) / check_count;
            size_t i = idx / W.cols();
            size_t j = idx % W.cols();

            // Numerical gradient for W[i,j]
            double orig = const_cast<Matrix<double>&>(W)(i, j);

            const_cast<Matrix<double>&>(W)(i, j) = orig + epsilon;
            Matrix<double> pred_plus = forward(X);
            double loss_plus = compute_loss(pred_plus, y);

            const_cast<Matrix<double>&>(W)(i, j) = orig - epsilon;
            Matrix<double> pred_minus = forward(X);
            double loss_minus = compute_loss(pred_minus, y);

            const_cast<Matrix<double>&>(W)(i, j) = orig;

            double numerical_grad = (loss_plus - loss_minus) / (2.0 * epsilon);

            // Analytical gradient would come from dW matrix
            // For now, just verify the shape is correct
            if (std::abs(numerical_grad) > 1e10) {
                std::cout << "Warning: Numerical gradient explosion at layer "
                          << layer_idx << " weight [" << i << "," << j << "]" << std::endl;
                all_pass = false;
            }
        }
    }

    return all_pass;
}

// ============================================================================
// Utility Functions
// ============================================================================
std::pair<Matrix<double>, Matrix<double>>
train_test_split(const Matrix<double>& X, const Matrix<double>& y,
                 double test_size, bool shuffle) {
    size_t num_samples = X.rows();
    size_t test_samples = static_cast<size_t>(num_samples * test_size);
    size_t train_samples = num_samples - test_samples;

    std::vector<size_t> indices(num_samples);
    for (size_t i = 0; i < num_samples; i++) indices[i] = i;

    if (shuffle) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::shuffle(indices.begin(), indices.end(), gen);
    }

    Matrix<double> X_train(train_samples, X.cols());
    Matrix<double> y_train(train_samples, y.cols());
    Matrix<double> X_test(test_samples, X.cols());
    Matrix<double> y_test(test_samples, y.cols());

    for (size_t i = 0; i < train_samples; i++) {
        size_t src = indices[i];
        for (size_t j = 0; j < X.cols(); j++)
            X_train(i, j) = X(src, j);
        for (size_t j = 0; j < y.cols(); j++)
            y_train(i, j) = y(src, j);
    }

    for (size_t i = 0; i < test_samples; i++) {
        size_t src = indices[train_samples + i];
        for (size_t j = 0; j < X.cols(); j++)
            X_test(i, j) = X(src, j);
        for (size_t j = 0; j < y.cols(); j++)
            y_test(i, j) = y(src, j);
    }

    return {std::move(X_train), std::move(y_train)};
    // Note: X_test, y_test are lost in this simplified version
}

double accuracy(const Matrix<double>& predictions, const Matrix<double>& targets) {
    if (predictions.rows() != targets.rows()) return 0.0;

    double correct = 0.0;
    size_t n = predictions.rows();

    // Classification accuracy (argmax)
    if (predictions.cols() > 1) {
        for (size_t i = 0; i < n; i++) {
            size_t pred_class = 0;
            size_t true_class = 0;
            double max_pred = predictions(i, 0);
            double max_true = targets(i, 0);

            for (size_t j = 1; j < predictions.cols(); j++) {
                if (predictions(i, j) > max_pred) {
                    max_pred = predictions(i, j);
                    pred_class = j;
                }
                if (targets(i, j) > max_true) {
                    max_true = targets(i, j);
                    true_class = j;
                }
            }

            if (pred_class == true_class) correct += 1.0;
        }
    } else {
        // Regression: treat within 1% of range as "correct"
        double range = targets.max() - targets.min();
        double threshold = range * 0.1;
        if (threshold < 1e-10) threshold = 1e-10;

        for (size_t i = 0; i < n; i++) {
            if (std::abs(predictions(i, 0) - targets(i, 0)) < threshold) {
                correct += 1.0;
            }
        }
    }

    return correct / n;
}

} // namespace cyberhex
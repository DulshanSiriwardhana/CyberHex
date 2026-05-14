#ifndef CYBERHEX_MODEL_H
#define CYBERHEX_MODEL_H

#include "layer.h"
#include "activations.h"
#include "dense.h"
#include <vector>
#include <mutex>
#include <string>
#include <memory>
#include <functional>

namespace cyberhex {

// Forward declarations
class WSServer;

// ============================================================================
// Dataset Base
// ============================================================================
class Dataset {
public:
    virtual ~Dataset() = default;
    virtual size_t num_samples() const = 0;
    virtual size_t input_size() const = 0;
    virtual size_t output_size() const = 0;
    virtual Matrix<double> get_X() const = 0;
    virtual Matrix<double> get_y() const = 0;
    virtual std::pair<Matrix<double>, Matrix<double>> get_batch(size_t start, size_t end) const = 0;
};

// ============================================================================
// TensorDataset — in-memory data
// ============================================================================
class TensorDataset : public Dataset {
private:
    Matrix<double> X_;
    Matrix<double> y_;
public:
    TensorDataset(const Matrix<double>& X, const Matrix<double>& y);
    size_t num_samples() const override { return X_.rows(); }
    size_t input_size() const override { return X_.cols(); }
    size_t output_size() const override { return y_.cols(); }
    Matrix<double> get_X() const override { return X_; }
    Matrix<double> get_y() const override { return y_; }
    std::pair<Matrix<double>, Matrix<double>> get_batch(size_t start, size_t end) const override;
};

// ============================================================================
// SyntheticDataset — generates data on the fly
// ============================================================================
class SyntheticDataset : public Dataset {
private:
    size_t num_samples_;
    size_t input_size_;
    size_t output_size_;
    std::function<double(const double*, size_t)> func_;
    double noise_;
public:
    SyntheticDataset(size_t num_samples, size_t input_size, size_t output_size = 1,
                     std::function<double(const double*, size_t)> func = nullptr,
                     double noise = 0.0);
    size_t num_samples() const override { return num_samples_; }
    size_t input_size() const override { return input_size_; }
    size_t output_size() const override { return output_size_; }
    Matrix<double> get_X() const override;
    Matrix<double> get_y() const override;
    std::pair<Matrix<double>, Matrix<double>> get_batch(size_t start, size_t end) const override;
};

// ============================================================================
// CSV utilities
// ============================================================================
Matrix<double> load_csv(const std::string& filename, bool has_header = true, char delimiter = ',');

// ============================================================================
// DataLoader — batches, shuffling
// ============================================================================
class DataLoader {
private:
    std::shared_ptr<Dataset> dataset_;
    size_t batch_size_;
    bool shuffle_;
    std::vector<size_t> indices_;
    size_t current_idx_;

public:
    DataLoader(std::shared_ptr<Dataset> dataset, size_t batch_size = 32, bool shuffle = true);

    size_t num_batches() const;
    size_t batch_size() const { return batch_size_; }
    void reset();
    bool has_next() const;
    std::pair<Matrix<double>, Matrix<double>> next_batch();
    void shuffle();
};

// ============================================================================
// Training Metrics
// ============================================================================
struct TrainingMetrics {
    double loss = 0.0;
    double accuracy = 0.0;
    double grad_norm = 0.0;
    double learning_rate = 0.0;
    int epoch = 0;
    double elapsed_seconds = 0.0;
    std::string loss_name = "MSE";
};

// ============================================================================
// Checkpoint
// ============================================================================
struct Checkpoint {
    int epoch;
    double loss;
    double best_loss;
    std::vector<std::vector<double>> weights_flat;
    std::vector<std::vector<double>> bias_flat;
    std::vector<std::vector<size_t>> shapes;
    std::vector<std::string> layer_types;

    void save(const std::string& path);
    static Checkpoint load(const std::string& path);
};

// ============================================================================
// Model — main training container
// ============================================================================
class Model {
private:
    std::vector<std::unique_ptr<Layer>> layers_;
    std::unique_ptr<LossFunction> loss_fn_;
    std::unique_ptr<Optimizer> optimizer_;
    std::unique_ptr<LRScheduler> scheduler_;
    mutable std::mutex mtx_;
    WSServer* ws_server_ = nullptr;

    // Training state
    int epoch_ = 0;
    double best_loss_ = 1e18;
    int patience_counter_ = 0;

    // Gradient clipping
    double max_grad_norm_ = 0.0;

    // Callbacks
    std::function<void(const TrainingMetrics&)> on_epoch_end_;
    std::function<bool(const TrainingMetrics&)> on_batch_end_;

public:
    Model() = default;
    ~Model() = default;

    // Layer management
    void add(std::unique_ptr<Layer> layer);
    void add(Layer* layer); // Takes ownership
    Layer* get_layer(size_t index);
    size_t num_layers() const { return layers_.size(); }

    // Forward/backward
    Matrix<double> forward(const Matrix<double>& X);
    double compute_loss(const Matrix<double>& pred, const Matrix<double>& target);
    Matrix<double> compute_loss_grad(const Matrix<double>& pred, const Matrix<double>& target);

    // Training
    void compile(std::unique_ptr<LossFunction> loss_fn,
                 std::unique_ptr<Optimizer> optimizer,
                 std::unique_ptr<LRScheduler> scheduler = nullptr);

    void fit(const Matrix<double>& X, const Matrix<double>& y,
             int epochs, int batch_size = 0,  // 0 = full batch
             double validation_split = 0.0,
             int early_stopping_patience = 0,
             bool verbose = true);

    void fit_dataloader(DataLoader& train_loader,
                        int epochs,
                        DataLoader* val_loader = nullptr,
                        int early_stopping_patience = 0,
                        bool verbose = true);

    Matrix<double> predict(const Matrix<double>& X);

    // Serialization
    void save_weights(const std::string& prefix);
    void save_weights_binary(const std::string& prefix);
    void load_weights(const std::string& prefix);
    void save_checkpoint(const std::string& path);
    void load_checkpoint(const std::string& path);
    void export_onnx(const std::string& filename);

    // WebSocket
    void set_ws_server(WSServer* ws) { ws_server_ = ws; }

    // Gradient clipping
    void set_max_grad_norm(double max_norm) { max_grad_norm_ = max_norm; }

    // Callbacks
    void set_on_epoch_end(std::function<void(const TrainingMetrics&)> cb) { on_epoch_end_ = cb; }
    void set_on_batch_end(std::function<bool(const TrainingMetrics&)> cb) { on_batch_end_ = cb; }

    // Setters
    void set_loss_fn(std::unique_ptr<LossFunction> loss_fn) { loss_fn_ = std::move(loss_fn); }
    void set_optimizer(std::unique_ptr<Optimizer> opt) { optimizer_ = std::move(opt); }

    // Getters
    double get_best_loss() const { return best_loss_; }
    int get_epoch() const { return epoch_; }
    LossFunction* get_loss_fn() const { return loss_fn_.get(); }
    Optimizer* get_optimizer() const { return optimizer_.get(); }

    // Gradient checking (debugging)
    bool check_gradients(const Matrix<double>& X, const Matrix<double>& y,
                         double epsilon = 1e-5, double tolerance = 1e-4);

    // Reset
    void reset();
};

// ============================================================================
// Utility: train/test split
// ============================================================================
std::pair<Matrix<double>, Matrix<double>>
train_test_split(const Matrix<double>& X, const Matrix<double>& y,
                 double test_size = 0.2, bool shuffle = true);

// ============================================================================
// Utility: accuracy computation
// ============================================================================
double accuracy(const Matrix<double>& predictions, const Matrix<double>& targets);

} // namespace cyberhex

#endif // CYBERHEX_MODEL_H
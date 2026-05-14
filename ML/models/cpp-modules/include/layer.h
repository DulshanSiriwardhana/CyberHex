#ifndef CYBERHEX_LAYER_H
#define CYBERHEX_LAYER_H

#include "matrix.h"
#include <string>
#include <memory>
#include <functional>

namespace cyberhex {

// ============================================================================
// Optimizer Types
// ============================================================================
enum class OptimizerType {
    SGD,
    MOMENTUM,
    NESTEROV,
    RMSPROP,
    ADAM,
    ADAMW,
    NADAM
};

// ============================================================================
// Loss Function Types
// ============================================================================
enum class LossType {
    MSE,
    MAE,
    HUBER,
    BCE,
    CCE,       // Categorical Cross-Entropy
    BINARY_CCE
};

// ============================================================================
// Initialization Types
// ============================================================================
enum class InitType {
    HE,
    XAVIER,
    LECUN_NORMAL,
    HE_UNIFORM,
    XAVIER_UNIFORM,
    ORTHOGONAL
};

// ============================================================================
// Base Layer Class — extensible abstraction
// ============================================================================
class Layer {
public:
    virtual ~Layer() = default;

    // Forward pass: input → output
    virtual Matrix<double> forward(const Matrix<double>& input) = 0;

    // Backward pass: gradient from upstream → gradient to downstream
    // Returns gradient w.r.t. input
    virtual Matrix<double> backward(const Matrix<double>& grad_output,
                                     double learning_rate,
                                     OptimizerType opt = OptimizerType::ADAM,
                                     int timestep = 1) = 0;

    // Parameter access for serialization / gradient checking
    virtual std::vector<Matrix<double>*> parameters() { return {}; }
    virtual std::vector<Matrix<double>*> parameter_gradients() { return {}; }
    virtual std::vector<std::string> parameter_names() { return {}; }

    // Layer type name
    virtual std::string name() const = 0;

    // Reset optimizer state (for new training run)
    virtual void reset_state() {}

    // Training mode toggle (for Dropout, BatchNorm)
    virtual void set_training(bool training) { (void)training; }

    // Get output shape after forward
    virtual size_t output_size() const = 0;
};

// ============================================================================
// Loss Function Base Class
// ============================================================================
class LossFunction {
public:
    virtual ~LossFunction() = default;

    // Compute loss value
    virtual double forward(const Matrix<double>& predictions,
                           const Matrix<double>& targets) = 0;

    // Compute gradient w.r.t. predictions
    virtual Matrix<double> backward(const Matrix<double>& predictions,
                                    const Matrix<double>& targets) = 0;

    virtual std::string name() const = 0;
};

// ============================================================================
// Concrete Loss Functions
// ============================================================================
class MSELoss : public LossFunction {
public:
    double forward(const Matrix<double>& pred, const Matrix<double>& target) override;
    Matrix<double> backward(const Matrix<double>& pred, const Matrix<double>& target) override;
    std::string name() const override { return "MSE"; }
};

class MAELoss : public LossFunction {
public:
    double forward(const Matrix<double>& pred, const Matrix<double>& target) override;
    Matrix<double> backward(const Matrix<double>& pred, const Matrix<double>& target) override;
    std::string name() const override { return "MAE"; }
};

class HuberLoss : public LossFunction {
private:
    double delta_;
public:
    explicit HuberLoss(double delta = 1.0);
    double forward(const Matrix<double>& pred, const Matrix<double>& target) override;
    Matrix<double> backward(const Matrix<double>& pred, const Matrix<double>& target) override;
    std::string name() const override { return "Huber"; }
};

class BinaryCrossEntropyLoss : public LossFunction {
public:
    double forward(const Matrix<double>& pred, const Matrix<double>& target) override;
    Matrix<double> backward(const Matrix<double>& pred, const Matrix<double>& target) override;
    std::string name() const override { return "BCE"; }
};

class CategoricalCrossEntropyLoss : public LossFunction {
public:
    double forward(const Matrix<double>& pred, const Matrix<double>& target) override;
    Matrix<double> backward(const Matrix<double>& pred, const Matrix<double>& target) override;
    std::string name() const override { return "CCE"; }
};

// ============================================================================
// Optimizer Base Class
// ============================================================================
class Optimizer {
public:
    virtual ~Optimizer() = default;

    virtual void update(Matrix<double>& param, const Matrix<double>& grad,
                        size_t param_idx, int timestep) = 0;
    virtual void reset() = 0;
    virtual double get_lr() const = 0;
    virtual void set_lr(double lr) = 0;
    virtual std::string name() const = 0;

    // Learning rate scheduling
    virtual void schedule(int epoch, int total_epochs) {}
};

// ============================================================================
// Concrete Optimizers
// ============================================================================
class SGDOptimizer : public Optimizer {
private:
    double lr_;
    double momentum_;
    double weight_decay_;
    std::vector<Matrix<double>> velocities_;
public:
    SGDOptimizer(double lr = 0.01, double momentum = 0.0, double weight_decay = 0.0);
    void update(Matrix<double>& param, const Matrix<double>& grad,
                size_t param_idx, int timestep) override;
    void reset() override;
    double get_lr() const override { return lr_; }
    void set_lr(double lr) override { lr_ = lr; }
    std::string name() const override { return "SGD"; }
};

class AdamOptimizer : public Optimizer {
private:
    double lr_;
    double beta1_;
    double beta2_;
    double epsilon_;
    double weight_decay_;
    bool amsgrad_;
    std::vector<Matrix<double>> m_;
    std::vector<Matrix<double>> v_;
    std::vector<Matrix<double>> v_max_; // for AMSGrad
public:
    AdamOptimizer(double lr = 0.001, double beta1 = 0.9, double beta2 = 0.999,
                  double epsilon = 1e-8, double weight_decay = 0.0, bool amsgrad = false);
    void update(Matrix<double>& param, const Matrix<double>& grad,
                size_t param_idx, int timestep) override;
    void reset() override;
    double get_lr() const override { return lr_; }
    void set_lr(double lr) override { lr_ = lr; }
    void schedule(int epoch, int total_epochs) override;
    std::string name() const override { return amsgrad_ ? "AMSGrad" : "Adam"; }
};

class RMSpropOptimizer : public Optimizer {
private:
    double lr_;
    double beta_;
    double epsilon_;
    double weight_decay_;
    std::vector<Matrix<double>> v_;
public:
    RMSpropOptimizer(double lr = 0.001, double beta = 0.999, double epsilon = 1e-8,
                     double weight_decay = 0.0);
    void update(Matrix<double>& param, const Matrix<double>& grad,
                size_t param_idx, int timestep) override;
    void reset() override;
    double get_lr() const override { return lr_; }
    void set_lr(double lr) override { lr_ = lr; }
    std::string name() const override { return "RMSprop"; }
};

// ============================================================================
// Learning Rate Schedulers
// ============================================================================
class LRScheduler {
public:
    virtual ~LRScheduler() = default;
    virtual double get_lr(int epoch) const = 0;
    virtual std::string name() const = 0;
};

class StepDecayScheduler : public LRScheduler {
private:
    double initial_lr_;
    double decay_rate_;
    int step_size_;
public:
    StepDecayScheduler(double initial_lr, double decay_rate = 0.5, int step_size = 100);
    double get_lr(int epoch) const override;
    std::string name() const override { return "StepDecay"; }
};

class CosineAnnealingScheduler : public LRScheduler {
private:
    double initial_lr_;
    double min_lr_;
    int T_max_;
public:
    CosineAnnealingScheduler(double initial_lr, double min_lr = 1e-6, int T_max = 1000);
    double get_lr(int epoch) const override;
    std::string name() const override { return "CosineAnnealing"; }
};

class WarmupCosineScheduler : public LRScheduler {
private:
    double initial_lr_;
    double max_lr_;
    double min_lr_;
    int warmup_epochs_;
    int total_epochs_;
public:
    WarmupCosineScheduler(double max_lr, double min_lr, int warmup_epochs, int total_epochs);
    double get_lr(int epoch) const override;
    std::string name() const override { return "WarmupCosine"; }
};

class OneCycleScheduler : public LRScheduler {
private:
    double max_lr_;
    double min_lr_;
    int total_steps_;
    int pct_start_;
public:
    OneCycleScheduler(double max_lr, double min_lr, int total_steps, int pct_start = 30);
    double get_lr(int epoch) const override;
    std::string name() const override { return "OneCycle"; }
};

} // namespace cyberhex

#endif // CYBERHEX_LAYER_H
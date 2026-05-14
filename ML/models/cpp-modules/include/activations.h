#ifndef CYBERHEX_ACTIVATIONS_H
#define CYBERHEX_ACTIVATIONS_H

#include "layer.h"

namespace cyberhex {

// ============================================================================
// ReLU Activation
// ============================================================================
class ReLU : public Layer {
private:
    Matrix<double> input;
public:
    ReLU() = default;
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "ReLU"; }
    size_t output_size() const override { return input.cols(); }
};

// ============================================================================
// Sigmoid Activation (numerically stable)
// ============================================================================
class Sigmoid : public Layer {
private:
    Matrix<double> output;
public:
    Sigmoid() = default;
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "Sigmoid"; }
    size_t output_size() const override { return output.cols(); }
};

// ============================================================================
// Softmax Activation (numerically stable, log-softmax variant)
// ============================================================================
class Softmax : public Layer {
private:
    Matrix<double> output;
public:
    Softmax() = default;
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "Softmax"; }
    size_t output_size() const override { return output.cols(); }

    // Log-softmax for numerical stability with CCE
    Matrix<double> log_softmax() const;
};

// ============================================================================
// Tanh Activation
// ============================================================================
class Tanh : public Layer {
private:
    Matrix<double> output;
public:
    Tanh() = default;
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "Tanh"; }
    size_t output_size() const override { return output.cols(); }
};

// ============================================================================
// Leaky ReLU Activation
// ============================================================================
class LeakyReLU : public Layer {
private:
    Matrix<double> output;
    double alpha_;
public:
    explicit LeakyReLU(double alpha = 0.01);
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "LeakyReLU"; }
    size_t output_size() const override { return output.cols(); }
};

// ============================================================================
// ELU Activation
// ============================================================================
class ELU : public Layer {
private:
    Matrix<double> output;
    double alpha_;
public:
    explicit ELU(double alpha = 1.0);
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "ELU"; }
    size_t output_size() const override { return output.cols(); }
};

// ============================================================================
// Swish / SiLU Activation (x * sigmoid(x))
// ============================================================================
class Swish : public Layer {
private:
    Matrix<double> output;
public:
    Swish() = default;
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "Swish"; }
    size_t output_size() const override { return output.cols(); }
};

// ============================================================================
// GELU Activation (Gaussian Error Linear Unit)
// ============================================================================
class GELU : public Layer {
private:
    Matrix<double> input;
public:
    GELU() = default;
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "GELU"; }
    size_t output_size() const override { return input.cols(); }
};

// ============================================================================
// Softplus Activation (log(1 + exp(x)))
// ============================================================================
class Softplus : public Layer {
private:
    Matrix<double> input;
public:
    Softplus() = default;
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "Softplus"; }
    size_t output_size() const override { return input.cols(); }
};

// ============================================================================
// Identity (linear) Activation
// ============================================================================
class Identity : public Layer {
public:
    Identity() = default;
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    std::string name() const override { return "Identity"; }
    size_t output_size() const override { return 0; } // depends on input
};

// ============================================================================
// Dropout Layer
// ============================================================================
class Dropout : public Layer {
private:
    double rate_;
    Matrix<double> mask;
    bool training_ = true;
public:
    explicit Dropout(double rate = 0.5);
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    void set_training(bool training) override { training_ = training; }
    std::string name() const override { return "Dropout"; }
    size_t output_size() const override { return mask.cols(); }
};

// ============================================================================
// Batch Normalization Layer
// ============================================================================
class BatchNormalization : public Layer {
private:
    Matrix<double> gamma;
    Matrix<double> beta;
    Matrix<double> running_mean;
    Matrix<double> running_var;
    Matrix<double> x_hat;
    Matrix<double> ivar;
    Matrix<double> input_cache;
    double epsilon_;
    double momentum_;
    bool training_ = true;
public:
    explicit BatchNormalization(size_t input_size, double epsilon = 1e-5, double momentum = 0.9);
    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt, int t) override;
    void set_training(bool training) override { training_ = training; }
    std::vector<Matrix<double>*> parameters() override { return {&gamma, &beta}; }
    std::vector<std::string> parameter_names() override { return {"gamma", "beta"}; }
    std::string name() const override { return "BatchNorm"; }
    size_t output_size() const override { return gamma.cols(); }
    void reset_state() override;
};

} // namespace cyberhex

#endif // CYBERHEX_ACTIVATIONS_H
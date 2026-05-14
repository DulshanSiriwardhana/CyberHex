#include "layer.h"
#include <cmath>
#include <algorithm>

namespace cyberhex {

// ============================================================================
// SGD Optimizer
// ============================================================================
SGDOptimizer::SGDOptimizer(double lr, double momentum, double weight_decay)
    : lr_(lr), momentum_(momentum), weight_decay_(weight_decay) {}

void SGDOptimizer::update(Matrix<double>& param, const Matrix<double>& grad,
                          size_t param_idx, int timestep) {
    // Ensure velocities vector is large enough
    if (velocities_.size() <= param_idx) {
        velocities_.resize(param_idx + 1);
    }

    double wd = weight_decay_;

    if (momentum_ > 0.0) {
        if (velocities_[param_idx].empty()) {
            velocities_[param_idx] = Matrix<double>(param.rows(), param.cols(), 0.0);
        }
        auto& v = velocities_[param_idx];

        for (size_t i = 0; i < param.size(); i++) {
            double g = grad.at(i) + wd * param.at(i);
            v.at(i) = momentum_ * v.at(i) + lr_ * g;
            param.at(i) -= v.at(i);
        }
    } else {
        for (size_t i = 0; i < param.size(); i++) {
            double g = grad.at(i) + wd * param.at(i);
            param.at(i) -= lr_ * g;
        }
    }
}

void SGDOptimizer::reset() {
    velocities_.clear();
}

// ============================================================================
// Adam Optimizer
// ============================================================================
AdamOptimizer::AdamOptimizer(double lr, double beta1, double beta2,
                              double epsilon, double weight_decay, bool amsgrad)
    : lr_(lr), beta1_(beta1), beta2_(beta2), epsilon_(epsilon),
      weight_decay_(weight_decay), amsgrad_(amsgrad) {}

void AdamOptimizer::update(Matrix<double>& param, const Matrix<double>& grad,
                           size_t param_idx, int timestep) {
    // Ensure state vectors are large enough
    if (m_.size() <= param_idx) {
        m_.resize(param_idx + 1);
        v_.resize(param_idx + 1);
        if (amsgrad_) v_max_.resize(param_idx + 1);
    }

    if (m_[param_idx].empty()) {
        m_[param_idx] = Matrix<double>(param.rows(), param.cols(), 0.0);
        v_[param_idx] = Matrix<double>(param.rows(), param.cols(), 0.0);
        if (amsgrad_) v_max_[param_idx] = Matrix<double>(param.rows(), param.cols(), 0.0);
    }

    auto& m = m_[param_idx];
    auto& v = v_[param_idx];

    double bias_corr1 = 1.0 - std::pow(beta1_, timestep);
    double bias_corr2 = 1.0 - std::pow(beta2_, timestep);

    for (size_t i = 0; i < param.size(); i++) {
        double g = grad.at(i) + weight_decay_ * param.at(i);

        // Update biased first moment estimate
        m.at(i) = beta1_ * m.at(i) + (1.0 - beta1_) * g;

        // Update biased second raw moment estimate
        v.at(i) = beta2_ * v.at(i) + (1.0 - beta2_) * g * g;

        // Compute bias-corrected estimates
        double m_hat = m.at(i) / bias_corr1;
        double v_hat = v.at(i) / bias_corr2;

        if (amsgrad_) {
            v_max_[param_idx].at(i) = std::max(v_max_[param_idx].at(i), v_hat);
            v_hat = v_max_[param_idx].at(i);
        }

        param.at(i) -= lr_ * m_hat / (std::sqrt(v_hat) + epsilon_);
    }
}

void AdamOptimizer::reset() {
    m_.clear();
    v_.clear();
    v_max_.clear();
}

void AdamOptimizer::schedule(int epoch, int total_epochs) {
    // Simple cosine decay schedule
    double progress = static_cast<double>(epoch) / total_epochs;
    lr_ = lr_ * 0.5 * (1.0 + std::cos(M_PI * progress));
}

// ============================================================================
// RMSprop Optimizer
// ============================================================================
RMSpropOptimizer::RMSpropOptimizer(double lr, double beta, double epsilon,
                                    double weight_decay)
    : lr_(lr), beta_(beta), epsilon_(epsilon), weight_decay_(weight_decay) {}

void RMSpropOptimizer::update(Matrix<double>& param, const Matrix<double>& grad,
                              size_t param_idx, int timestep) {
    if (v_.size() <= param_idx) {
        v_.resize(param_idx + 1);
    }

    if (v_[param_idx].empty()) {
        v_[param_idx] = Matrix<double>(param.rows(), param.cols(), 0.0);
    }

    auto& v = v_[param_idx];

    for (size_t i = 0; i < param.size(); i++) {
        double g = grad.at(i) + weight_decay_ * param.at(i);
        v.at(i) = beta_ * v.at(i) + (1.0 - beta_) * g * g;
        param.at(i) -= lr_ * g / (std::sqrt(v.at(i)) + epsilon_);
    }
}

void RMSpropOptimizer::reset() {
    v_.clear();
}

// ============================================================================
// Learning Rate Schedulers
// ============================================================================
StepDecayScheduler::StepDecayScheduler(double initial_lr, double decay_rate, int step_size)
    : initial_lr_(initial_lr), decay_rate_(decay_rate), step_size_(step_size) {}

double StepDecayScheduler::get_lr(int epoch) const {
    int decay_count = epoch / step_size_;
    return initial_lr_ * std::pow(decay_rate_, decay_count);
}

CosineAnnealingScheduler::CosineAnnealingScheduler(double initial_lr, double min_lr, int T_max)
    : initial_lr_(initial_lr), min_lr_(min_lr), T_max_(T_max) {}

double CosineAnnealingScheduler::get_lr(int epoch) const {
    double progress = static_cast<double>(epoch) / T_max_;
    return min_lr_ + 0.5 * (initial_lr_ - min_lr_) * (1.0 + std::cos(M_PI * progress));
}

WarmupCosineScheduler::WarmupCosineScheduler(double max_lr, double min_lr,
                                              int warmup_epochs, int total_epochs)
    : max_lr_(max_lr), min_lr_(min_lr),
      warmup_epochs_(warmup_epochs), total_epochs_(total_epochs) {}

double WarmupCosineScheduler::get_lr(int epoch) const {
    if (epoch < warmup_epochs_) {
        return max_lr_ * static_cast<double>(epoch) / warmup_epochs_;
    }
    double progress = static_cast<double>(epoch - warmup_epochs_) /
                      (total_epochs_ - warmup_epochs_);
    return min_lr_ + 0.5 * (max_lr_ - min_lr_) * (1.0 + std::cos(M_PI * progress));
}

OneCycleScheduler::OneCycleScheduler(double max_lr, double min_lr,
                                      int total_steps, int pct_start)
    : max_lr_(max_lr), min_lr_(min_lr),
      total_steps_(total_steps), pct_start_(pct_start) {}

double OneCycleScheduler::get_lr(int epoch) const {
    double progress = static_cast<double>(epoch) / total_steps_;
    double phase_progress;
    if (progress < 0.3) {
        phase_progress = progress / 0.3;
        return min_lr_ + (max_lr_ - min_lr_) * phase_progress;
    } else {
        phase_progress = (progress - 0.3) / 0.7;
        double cos_anneal = 0.5 * (1.0 + std::cos(M_PI * phase_progress));
        return min_lr_ + (max_lr_ - min_lr_) * cos_anneal;
    }
}

} // namespace cyberhex
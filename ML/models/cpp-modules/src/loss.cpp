#include "layer.h"
#include <cmath>
#include <algorithm>

namespace cyberhex {

// ============================================================================
// MSE Loss
// ============================================================================
double MSELoss::forward(const Matrix<double>& pred, const Matrix<double>& target) {
    double loss = 0.0;
    for (size_t i = 0; i < pred.size(); i++) {
        double diff = pred.at(i) - target.at(i);
        loss += diff * diff;
    }
    loss /= static_cast<double>(pred.rows()); // mean over batch
    return loss;
}

Matrix<double> MSELoss::backward(const Matrix<double>& pred, const Matrix<double>& target) {
    Matrix<double> grad = pred - target;
    double scale = 2.0 / static_cast<double>(pred.rows());
    return grad * scale;
}

// ============================================================================
// MAE Loss
// ============================================================================
double MAELoss::forward(const Matrix<double>& pred, const Matrix<double>& target) {
    double loss = 0.0;
    for (size_t i = 0; i < pred.size(); i++) {
        loss += std::abs(pred.at(i) - target.at(i));
    }
    loss /= static_cast<double>(pred.rows());
    return loss;
}

Matrix<double> MAELoss::backward(const Matrix<double>& pred, const Matrix<double>& target) {
    Matrix<double> grad(pred.rows(), pred.cols());
    double scale = 1.0 / static_cast<double>(pred.rows());
    for (size_t i = 0; i < pred.size(); i++) {
        double diff = pred.at(i) - target.at(i);
        grad.at(i) = scale * (diff > 0 ? 1.0 : (diff < 0 ? -1.0 : 0.0));
    }
    return grad;
}

// ============================================================================
// Huber Loss
// ============================================================================
HuberLoss::HuberLoss(double delta) : delta_(delta) {}

double HuberLoss::forward(const Matrix<double>& pred, const Matrix<double>& target) {
    double loss = 0.0;
    for (size_t i = 0; i < pred.size(); i++) {
        double diff = std::abs(pred.at(i) - target.at(i));
        if (diff <= delta_) {
            loss += 0.5 * diff * diff;
        } else {
            loss += delta_ * (diff - 0.5 * delta_);
        }
    }
    loss /= static_cast<double>(pred.rows());
    return loss;
}

Matrix<double> HuberLoss::backward(const Matrix<double>& pred, const Matrix<double>& target) {
    Matrix<double> grad(pred.rows(), pred.cols());
    double scale = 1.0 / static_cast<double>(pred.rows());
    for (size_t i = 0; i < pred.size(); i++) {
        double diff = pred.at(i) - target.at(i);
        double abs_diff = std::abs(diff);
        if (abs_diff <= delta_) {
            grad.at(i) = scale * diff;
        } else {
            grad.at(i) = scale * delta_ * (diff > 0 ? 1.0 : -1.0);
        }
    }
    return grad;
}

// ============================================================================
// Binary Cross-Entropy Loss
// ============================================================================
double BinaryCrossEntropyLoss::forward(const Matrix<double>& pred,
                                        const Matrix<double>& target) {
    double loss = 0.0;
    const double eps = 1e-15;
    for (size_t i = 0; i < pred.size(); i++) {
        double p = std::max(eps, std::min(1.0 - eps, pred.at(i)));
        double t = target.at(i);
        loss -= t * std::log(p) + (1.0 - t) * std::log(1.0 - p);
    }
    loss /= static_cast<double>(pred.rows());
    return loss;
}

Matrix<double> BinaryCrossEntropyLoss::backward(const Matrix<double>& pred,
                                                 const Matrix<double>& target) {
    Matrix<double> grad(pred.rows(), pred.cols());
    const double eps = 1e-15;
    double scale = 1.0 / static_cast<double>(pred.rows());
    for (size_t i = 0; i < pred.size(); i++) {
        double p = std::max(eps, std::min(1.0 - eps, pred.at(i)));
        double t = target.at(i);
        // BCE derivative: dL/dp = (p - t) / (p * (1 - p))
        // Guard denominator against underflow near 0 or 1
        double denom = p * (1.0 - p);
        if (denom < eps) denom = eps;
        grad.at(i) = scale * (p - t) / denom;
    }
    return grad;
}

// ============================================================================
// Categorical Cross-Entropy Loss (for one-hot or class indices)
// ============================================================================
double CategoricalCrossEntropyLoss::forward(const Matrix<double>& pred,
                                             const Matrix<double>& target) {
    double loss = 0.0;
    const double eps = 1e-15;

    for (size_t i = 0; i < pred.rows(); i++) {
        for (size_t j = 0; j < pred.cols(); j++) {
            double p = std::max(eps, pred(i, j));
            double t = target(i, j);
            loss -= t * std::log(p);
        }
    }
    loss /= static_cast<double>(pred.rows());
    return loss;
}

Matrix<double> CategoricalCrossEntropyLoss::backward(const Matrix<double>& pred,
                                                      const Matrix<double>& target) {
    Matrix<double> grad(pred.rows(), pred.cols());
    const double eps = 1e-15;
    double scale = 1.0 / static_cast<double>(pred.rows());

    for (size_t i = 0; i < pred.size(); i++) {
        double p = std::max(eps, pred.at(i));
        grad.at(i) = scale * (-target.at(i) / p);
    }
    return grad;
}

} // namespace cyberhex
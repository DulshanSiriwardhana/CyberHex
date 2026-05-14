#ifndef CYBERHEX_DENSE_H
#define CYBERHEX_DENSE_H

#include "layer.h"

namespace cyberhex {

// ============================================================================
// Dense (Fully Connected) Layer
// ============================================================================
class Dense : public Layer {
private:
    size_t in_features_;
    size_t out_features_;
    Matrix<double> weights;
    Matrix<double> bias;
    Matrix<double> input;

    // Optimizer state
    Matrix<double> m_W, v_W;
    Matrix<double> m_B, v_B;

    // Regularization
    double l1_lambda_ = 0.0;
    double l2_lambda_ = 0.0;

    // Weight constraint
    double max_norm_ = 0.0;

public:
    Dense(size_t in_features, size_t out_features,
          InitType init_type = InitType::HE);

    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt = OptimizerType::ADAM,
                            int t = 1) override;

    std::vector<Matrix<double>*> parameters() override { return {&weights, &bias}; }
    std::vector<Matrix<double>*> parameter_gradients() override;
    std::vector<std::string> parameter_names() override { return {"weights", "bias"}; }

    // Accessors
    const Matrix<double>& getWeights() const { return weights; }
    const Matrix<double>& getBias() const { return bias; }

    // Regularization
    void set_l1(double lambda) { l1_lambda_ = lambda; }
    void set_l2(double lambda) { l2_lambda_ = lambda; }
    void set_regularization(double l1, double l2) { l1_lambda_ = l1; l2_lambda_ = l2; }

    // Weight constraint (max norm)
    void set_max_norm(double max_norm) { max_norm_ = max_norm; }

    std::string name() const override { return "Dense"; }
    size_t output_size() const override { return out_features_; }
    void reset_state() override;

    // Save/load
    void save(std::ofstream& file) const;
    static Dense load(std::ifstream& file);

    void initialize(InitType type);
};

} // namespace cyberhex

#endif // CYBERHEX_DENSE_H
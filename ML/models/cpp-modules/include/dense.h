#ifndef DENSE_H
#define DENSE_H

#include "layer.h"

enum class InitType {
    HE,
    XAVIER
};

class Dense : public Layer {
    private:
        Matrix<double> weights;
        Matrix<double> bias;
        Matrix<double> m_W, v_W;
        Matrix<double> m_B, v_B;
        Matrix<double> input;
    
    public:
        Dense(double in, double out, InitType init_type = InitType::HE);

        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;

        const Matrix<double>& getWeights() const;
        const Matrix<double>& getBias() const;
};

#endif
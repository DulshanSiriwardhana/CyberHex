#ifndef ACTIVATIONS_H
#define ACTIVATIONS_H

#include "layer.h"

class ReLU : public Layer {
    private:
        Matrix input;

    public:
        ReLU();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Sigmoid : public Layer {
    private:
        Matrix output;

    public:
        Sigmoid();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Softmax : public Layer {
    private:
        Matrix output;

    public:
        Softmax();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Identity : public Layer {
    private:
        Matrix output;

    public:
        Identity();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Generalized_Sigmoid : public Layer {
    private:
        Matrix output;

    public:
        Generalized_Sigmoid();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Tanh : public Layer {
    private:
        Matrix output;

    public:
        Tanh();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class LeakyReLU : public Layer {
    private:
        Matrix output;

    public:
        LeakyReLU();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

#endif
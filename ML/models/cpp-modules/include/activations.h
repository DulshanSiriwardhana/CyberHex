#ifndef ACTIVATIONS_H
#define ACTIVATIONS_H

#include "layer.h"

class ReLU : public Layer {
    private:
        Matrix<double> input;

    public:
        ReLU();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Sigmoid : public Layer {
    private:
        Matrix<double> output;

    public:
        Sigmoid();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Softmax : public Layer {
    private:
        Matrix<double> output;

    public:
        Softmax();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Identity : public Layer {
    private:
        Matrix<double> output;

    public:
        Identity();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Generalized_Sigmoid : public Layer {
    private:
        Matrix<double> output;

    public:
        Generalized_Sigmoid();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Tanh : public Layer {
    private:
        Matrix<double> output;

    public:
        Tanh();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class LeakyReLU : public Layer {
    private:
        Matrix<double> output;

    public:
        LeakyReLU();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};


class Softplus : public Layer {
    private:
        Matrix<double> input;
    public:
        Softplus();
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class Dropout : public Layer {
    private:
        double rate;
        Matrix<double> mask;
    public:
        Dropout(double rate = 0.5);
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};

class BatchNormalization : public Layer {
    private:
        Matrix<double> gamma;
        Matrix<double> beta;
        Matrix<double> running_mean;
        Matrix<double> running_var;
        Matrix<double> x_hat;
        Matrix<double> ivar;
        double epsilon;
    public:
        BatchNormalization(size_t input_size);
        Matrix<double> forward(const Matrix<double>& input) override;
        Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) override;
};


#endif
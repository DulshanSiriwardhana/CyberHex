#ifndef ACTIVATIONS_H
#define ACTIVATIONS_H

#include "layer.h"

class ReLU : public Layer {
    private:
        Matrix input;

    public:
        ReLU();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr) override;
};

class Sigmoid : public Layer {
    private:
        Matrix output;

    public:
        Sigmoid();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr) override;
};

class Softmax : public Layer {
    private:
        Matrix output;

    public:
        Softmax();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr) override;
};

class Identity : public Layer {
    private:
        Matrix output;

    public:
        Identity();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr) override;
};

class Generalized_Sigmoid : public Layer {
    private:
        Matrix output;

    public:
        Generalized_Sigmoid();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr) override;
};

class Tanh : public Layer {
    private:
        Matrix output;

    public:
        Tanh();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr) override;
};

class LeakyReLU : public Layer {
    private:
        Matrix output;

    public:
        LeakyReLU();
        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr) override;
};

#endif
#ifndef LAYER_H
#define LAYER_H

#include "matrix.h"

#include "matrix.h"

enum class OptimizerType {
    SGD,
    MOMENTUM,
    RMSPROP,
    ADAM
};

class Layer {
    public:
        virtual Matrix forward(const Matrix& input) = 0;
        virtual Matrix backward(const Matrix& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) = 0;
        virtual ~Layer() = default;
};

#endif
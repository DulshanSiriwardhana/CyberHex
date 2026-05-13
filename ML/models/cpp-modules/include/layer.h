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
        
        virtual Matrix<double> forward(const Matrix<double>& input) = 0;
        virtual Matrix<double> backward(const Matrix<double>& grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1) = 0;
        virtual ~Layer() = default;
};

#endif
#ifndef LAYER_H
#define LAYER_H

#include "matrix.h"

class Layer {
    public:
        virtual Matrix forward(const Matrix& input) = 0;
        virtual Matrix backward(const Matrix& grad, double lr) = 0;
        virtual ~Layer() {};
};

#endif
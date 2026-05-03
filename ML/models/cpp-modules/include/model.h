#ifndef MODEL_H
#define MODEL_H

#include <vector>
#include "layer.h"
#include <string>

class Model {
    private:
        std::vector<Layer*> layers;

    public:
        void add(Layer* layer);
        Matrix forward(const Matrix& X);
        void backward(Matrix grad, double lr);
        void train(const Matrix& X, const Matrix& y, int epochs, double lr);
        void saveWeights(const std::string& prefix);
};

#endif
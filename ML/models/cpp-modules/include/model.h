#ifndef MODEL_H
#define MODEL_H

#include <vector>
#include "layer.h"
#include <string>

enum class LossType {
    MSE,
    BCE,
    CCE
};

class Model {
    private:
        std::vector<Layer*> layers;

    public:
        void add(Layer* layer);
        Matrix forward(const Matrix& X);
        void backward(Matrix grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1);
        void train(const Matrix& X, const Matrix& y, int epochs, double lr, LossType loss_type = LossType::MSE, int early_stopping_patience = 0, OptimizerType opt = OptimizerType::SGD, double lr_decay = 1.0);
        void saveWeights(const std::string& prefix);
        void saveWeightsBinary(const std::string& prefix);
};

#endif
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
        Matrix<double> forward(const Matrix<double>& X);
        void backward(Matrix<double> grad, double lr, OptimizerType opt = OptimizerType::SGD, int t = 1);
        void train(const Matrix<double>& X, const Matrix<double>& y, int epochs, double lr, LossType loss_type = LossType::MSE, int early_stopping_patience = 0, OptimizerType opt = OptimizerType::SGD, double lr_decay = 1.0);
        void saveWeights(const std::string& prefix);
        void saveWeightsBinary(const std::string& prefix);
};

#endif
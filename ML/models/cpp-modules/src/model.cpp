#include "model.h"
#include <iostream>
#include <cmath>

void Model::add(Layer* layer) {
    layers.push_back(layer);
}

Matrix Model::forward(const Matrix& X) {
    Matrix out = X;
    for (auto l : layers)
        out = l->forward(out);
    return out;
}

void Model::backward(Matrix grad, double lr) {
    for (int i = layers.size() - 1; i >= 0; i--)
        grad = layers[i]->backward(grad, lr);
}

void Model::train(const Matrix& X, const Matrix& y, int epochs, double lr) {
    double min_loss = 0;
    int best_epoch = 0;
    for (int e = 0; e < epochs; e++) {
        Matrix pred = forward(X);

        double loss = 0;
        for (int i = 0; i < y.rows; i++)
            loss += y.matrix[i][0] * log(pred.matrix[i][0] + 1e-8)
                  + (1 - y.matrix[i][0]) * log(1 - pred.matrix[i][0] + 1e-8);

        loss = -loss / y.rows;

        std::cout << "Epoch :" << e+1 << " -> " << " loss = " << loss << std::endl;
        Matrix grad = pred - y;

        if(e==0){
            min_loss = loss;
        }

        if((min_loss > loss)){
            best_epoch = e;
            min_loss = loss;
        }

        backward(grad, lr);
    }
    std::cout<< "Golden values: epoch -> " << best_epoch << ", loss = " << min_loss <<std::endl;
}
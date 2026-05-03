#ifndef DENSE_H
#define DENSE_H

#include "layer.h"

class Dense : public Layer {
    private:
        Matrix weights;
        Matrix bias;
        Matrix input;
    
    public:
        Dense(double in, double out);

        Matrix forward(const Matrix& input) override;
        Matrix backward(const Matrix& grad, double lr) override;

        const Matrix& getWeights() const;
        const Matrix& getBias() const;
};

#endif
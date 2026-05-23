#ifndef CYBERHEX_TRANSFORMER_H
#define CYBERHEX_TRANSFORMER_H

#include "layer.h"
#include "activations.h"
#include "matrix.h"
#include <cstddef>
#include <memory>

namespace cyberhex {

class MultiHeadSelfAttention : public Layer {
public:
    MultiHeadSelfAttention(size_t d_model, size_t num_heads);

    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad) override;

    std::vector<Matrix<double>*> parameters() override;
    std::vector<Matrix<double>*> parameter_gradients() override;
    std::vector<std::string> parameter_names() override;
    std::string name() const override { return "MultiHeadSelfAttention"; }
    size_t output_size() const override { return d_model_; }

private:
    size_t d_model_;
    size_t num_heads_;
    size_t head_dim_;

    Matrix<double> W_q_, W_k_, W_v_, W_o_;
    Matrix<double> dW_q_, dW_k_, dW_v_, dW_o_;

    Matrix<double> input_;
    Matrix<double> context_;
};

class TransformerEncoderBlock : public Layer {
public:
    TransformerEncoderBlock(size_t d_model, size_t num_heads, size_t ffn_dim);

    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad) override;

    std::vector<Matrix<double>*> parameters() override;
    std::vector<Matrix<double>*> parameter_gradients() override;
    std::vector<std::string> parameter_names() override;
    std::string name() const override { return "TransformerEncoderBlock"; }
    size_t output_size() const override { return d_model_; }

private:
    size_t d_model_;
    std::unique_ptr<MultiHeadSelfAttention> attention_;
    std::unique_ptr<LayerNormalization> norm1_;
    Matrix<double> W1_, b1_, W2_, b2_;
    Matrix<double> dW1_, db1_, dW2_, db2_;
    std::unique_ptr<LayerNormalization> norm2_;

    Matrix<double> residual1_;
    Matrix<double> ffn_linear_;
    Matrix<double> ffn_hidden_;
    Matrix<double> residual2_;
};

}

#endif

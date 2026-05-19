#ifndef CYBERHEX_CONV2D_H
#define CYBERHEX_CONV2D_H

#include "layer.h"

namespace cyberhex {

/**
 * 2D convolution (NHWC-style layout flattened to 2D matrix).
 *
 * Input X:  (batch, in_channels * input_height * input_width)
 * Output:   (batch, out_channels * output_height * output_width)
 *
 * Weights: (kernel_h * kernel_w * in_channels, out_channels) for im2col matmul.
 */
class Conv2D : public Layer {
public:
    Conv2D(size_t in_channels, size_t out_channels,
           size_t input_h, size_t input_w,
           size_t kernel_h, size_t kernel_w,
           size_t stride = 1, size_t pad = 0,
           InitType init = InitType::HE);

    Matrix<double> forward(const Matrix<double>& X) override;
    Matrix<double> backward(const Matrix<double>& grad, double lr,
                            OptimizerType opt = OptimizerType::ADAM,
                            int t = 1) override;

    std::vector<Matrix<double>*> parameters() override { return {&weights_, &bias_}; }
    std::vector<Matrix<double>*> parameter_gradients() override;
    std::vector<std::string> parameter_names() override { return {"weights", "bias"}; }

    const Matrix<double>& getWeights() const { return weights_; }
    const Matrix<double>& getBias() const { return bias_; }

    std::string name() const override { return "Conv2D"; }
    size_t output_size() const override { return out_channels_ * out_h_ * out_w_; }
    void reset_state() override;

    size_t in_channels() const { return in_channels_; }
    size_t out_channels() const { return out_channels_; }
    size_t output_height() const { return out_h_; }
    size_t output_width() const { return out_w_; }

private:
    size_t in_channels_, out_channels_;
    size_t in_h_, in_w_, kernel_h_, kernel_w_;
    size_t stride_, pad_;
    size_t out_h_, out_w_;
    size_t patch_size_;

    Matrix<double> weights_;
    Matrix<double> bias_;
    Matrix<double> input_cache_;
    Matrix<double> col_cache_;
    Matrix<double> grad_W_;
    Matrix<double> grad_B_;

    Matrix<double> im2col(const Matrix<double>& X) const;
    void col2im(const Matrix<double>& col_grad, Matrix<double>& input_grad) const;
};

} // namespace cyberhex

#endif // CYBERHEX_CONV2D_H

#include "conv2d.h"
#include <cmath>
#include <algorithm>
#include <random>

namespace cyberhex {

namespace {

size_t conv_out_dim(size_t in, size_t kernel, size_t stride, size_t pad) {
    return (in + 2 * pad - kernel) / stride + 1;
}

} // namespace

Conv2D::Conv2D(size_t in_channels, size_t out_channels,
               size_t input_h, size_t input_w,
               size_t kernel_h, size_t kernel_w,
               size_t stride, size_t pad, InitType init)
    : in_channels_(in_channels), out_channels_(out_channels),
      in_h_(input_h), in_w_(input_w), kernel_h_(kernel_h), kernel_w_(kernel_w),
      stride_(stride), pad_(pad),
      out_h_(conv_out_dim(input_h, kernel_h, stride, pad)),
      out_w_(conv_out_dim(input_w, kernel_w, stride, pad)),
      patch_size_(kernel_h * kernel_w * in_channels),
      weights_(patch_size_, out_channels, 0.0),
      bias_(1, out_channels, 0.0),
      grad_W_(patch_size_, out_channels, 0.0),
      grad_B_(1, out_channels, 0.0) {
    if (out_h_ == 0 || out_w_ == 0) {
        throw DimensionMismatchException("Conv2D: invalid output dimensions");
    }

  // He initialization on fan-in per output channel
    std::random_device rd;
    std::mt19937 gen(rd());
    double stddev = std::sqrt(2.0 / static_cast<double>(patch_size_));
    std::normal_distribution<double> dist(0.0, stddev);
    for (size_t i = 0; i < weights_.size(); i++) {
        weights_.at(i) = dist(gen);
    }
    (void)init;
}

Matrix<double> Conv2D::im2col(const Matrix<double>& X) const {
    const size_t batch = X.rows();
    const size_t spatial_out = out_h_ * out_w_;
    Matrix<double> col(batch * spatial_out, patch_size_, 0.0);

    for (size_t n = 0; n < batch; n++) {
        for (size_t oh = 0; oh < out_h_; oh++) {
            for (size_t ow = 0; ow < out_w_; ow++) {
                size_t col_row = n * spatial_out + oh * out_w_ + ow;
                size_t patch_idx = 0;
                for (size_t kh = 0; kh < kernel_h_; kh++) {
                    for (size_t kw = 0; kw < kernel_w_; kw++) {
                        for (size_t c = 0; c < in_channels_; c++) {
                            int ih = static_cast<int>(oh * stride_ + kh) - static_cast<int>(pad_);
                            int iw = static_cast<int>(ow * stride_ + kw) - static_cast<int>(pad_);
                            double val = 0.0;
                            if (ih >= 0 && iw >= 0 &&
                                ih < static_cast<int>(in_h_) && iw < static_cast<int>(in_w_)) {
                                size_t flat = c * in_h_ * in_w_ +
                                              static_cast<size_t>(ih) * in_w_ +
                                              static_cast<size_t>(iw);
                                val = X(n, flat);
                            }
                            col(col_row, patch_idx++) = val;
                        }
                    }
                }
            }
        }
    }
    return col;
}

void Conv2D::col2im(const Matrix<double>& col_grad, Matrix<double>& input_grad) const {
    const size_t batch = input_grad.rows();
    const size_t spatial_out = out_h_ * out_w_;

    for (size_t n = 0; n < batch; n++) {
        for (size_t oh = 0; oh < out_h_; oh++) {
            for (size_t ow = 0; ow < out_w_; ow++) {
                size_t col_row = n * spatial_out + oh * out_w_ + ow;
                size_t patch_idx = 0;
                for (size_t kh = 0; kh < kernel_h_; kh++) {
                    for (size_t kw = 0; kw < kernel_w_; kw++) {
                        for (size_t c = 0; c < in_channels_; c++) {
                            int ih = static_cast<int>(oh * stride_ + kh) - static_cast<int>(pad_);
                            int iw = static_cast<int>(ow * stride_ + kw) - static_cast<int>(pad_);
                            if (ih >= 0 && iw >= 0 &&
                                ih < static_cast<int>(in_h_) && iw < static_cast<int>(in_w_)) {
                                size_t flat = c * in_h_ * in_w_ +
                                              static_cast<size_t>(ih) * in_w_ +
                                              static_cast<size_t>(iw);
                                input_grad(n, flat) += col_grad(col_row, patch_idx);
                            }
                            patch_idx++;
                        }
                    }
                }
            }
        }
    }
}

Matrix<double> Conv2D::forward(const Matrix<double>& X) {
    if (X.cols() != in_channels_ * in_h_ * in_w_) {
        throw DimensionMismatchException("Conv2D forward: input feature size mismatch");
    }

    input_cache_ = X;
    col_cache_ = im2col(X);
    Matrix<double> out_col = col_cache_.dot(weights_);
    for (size_t i = 0; i < out_col.rows(); i++) {
        for (size_t j = 0; j < out_col.cols(); j++) {
            out_col(i, j) += bias_(0, j);
        }
    }

    const size_t batch = X.rows();
    Matrix<double> output(batch, out_channels_ * out_h_ * out_w_);
    for (size_t n = 0; n < batch; n++) {
        for (size_t oc = 0; oc < out_channels_; oc++) {
            for (size_t oh = 0; oh < out_h_; oh++) {
                for (size_t ow = 0; ow < out_w_; ow++) {
                    size_t col_row = n * out_h_ * out_w_ + oh * out_w_ + ow;
                    size_t out_flat = oc * out_h_ * out_w_ + oh * out_w_ + ow;
                    output(n, out_flat) = out_col(col_row, oc);
                }
            }
        }
    }
    return output;
}

Matrix<double> Conv2D::backward(const Matrix<double>& grad, double lr,
                                OptimizerType opt, int t) {
    const size_t batch = grad.rows();
    const size_t spatial_out = out_h_ * out_w_;

    Matrix<double> grad_col(batch * spatial_out, out_channels_, 0.0);
    for (size_t n = 0; n < batch; n++) {
        for (size_t oc = 0; oc < out_channels_; oc++) {
            for (size_t oh = 0; oh < out_h_; oh++) {
                for (size_t ow = 0; ow < out_w_; ow++) {
                    size_t col_row = n * spatial_out + oh * out_w_ + ow;
                    size_t out_flat = oc * out_h_ * out_w_ + oh * out_w_ + ow;
                    grad_col(col_row, oc) = grad(n, out_flat);
                }
            }
        }
    }

    grad_W_ = col_cache_.transpose().dot(grad_col);
    grad_B_ = Matrix<double>(1, out_channels_, 0.0);
    for (size_t j = 0; j < out_channels_; j++) {
        double sum = 0.0;
        for (size_t i = 0; i < grad_col.rows(); i++) {
            sum += grad_col(i, j);
        }
        grad_B_(0, j) = sum;
    }

    if (lr > 0.0) {
        weights_ = weights_ - grad_W_ * lr;
        bias_ = bias_ - grad_B_ * lr;
        (void)opt;
        (void)t;
    }

    Matrix<double> grad_col_input = grad_col.dot(weights_.transpose());
    Matrix<double> input_grad(batch, in_channels_ * in_h_ * in_w_, 0.0);
    col2im(grad_col_input, input_grad);
    return input_grad;
}

std::vector<Matrix<double>*> Conv2D::parameter_gradients() {
    return {&grad_W_, &grad_B_};
}

void Conv2D::reset_state() {
    grad_W_.fill(0.0);
    grad_B_.fill(0.0);
}

} // namespace cyberhex

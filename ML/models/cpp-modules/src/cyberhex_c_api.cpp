// CyberHex ML Engine - C API Implementation
// Item 59: C API implementation for FFI compatibility
#include "cyberhex_c_api.h"
#include "model.h"
#include "dense.h"
#include "activations.h"
#include "matrix.h"
#include <cstring>
#include <stdexcept>

static const char* CYBERHEX_VERSION_STR = "1.0.0";

extern "C" {

const char* cyberhex_version(void) {
    return CYBERHEX_VERSION_STR;
}

void* cyberhex_model_create(void) {
    return new Model();
}

void cyberhex_model_destroy(void* model) {
    delete static_cast<Model*>(model);
}

void* cyberhex_dense_create(int in, int out, int init_he) {
    InitType init = init_he ? InitType::HE : InitType::XAVIER;
    return new Dense(static_cast<double>(in), static_cast<double>(out), init);
}

void* cyberhex_relu_create(void)      { return new ReLU(); }
void* cyberhex_sigmoid_create(void)   { return new Sigmoid(); }
void* cyberhex_tanh_create(void)      { return new Tanh(); }
void* cyberhex_softmax_create(void)   { return new Softmax(); }
void* cyberhex_leakyrelu_create(void) { return new LeakyReLU(); }
void* cyberhex_dropout_create(double rate) { return new Dropout(rate); }
void* cyberhex_batchnorm_create(size_t input_size) { return new BatchNormalization(input_size); }

void cyberhex_model_add(void* model, void* layer) {
    static_cast<Model*>(model)->add(static_cast<Layer*>(layer));
}

void cyberhex_model_train(
    void* model,
    const double* X, size_t X_rows, size_t X_cols,
    const double* y, size_t y_rows, size_t y_cols,
    int epochs, double lr,
    int loss_type,
    int early_stopping_patience,
    int opt_type,
    double lr_decay
) {
    Matrix<double> mX(X_rows, X_cols);
    for (size_t i = 0; i < X_rows * X_cols; i++) mX.data[i] = X[i];

    Matrix<double> my(y_rows, y_cols);
    for (size_t i = 0; i < y_rows * y_cols; i++) my.data[i] = y[i];

    LossType lt = (loss_type == 1) ? LossType::BCE : (loss_type == 2) ? LossType::CCE : LossType::MSE;
    OptimizerType ot = (opt_type == 1) ? OptimizerType::MOMENTUM :
                       (opt_type == 2) ? OptimizerType::RMSPROP :
                       (opt_type == 3) ? OptimizerType::ADAM : OptimizerType::SGD;

    static_cast<Model*>(model)->train(mX, my, epochs, lr, lt, early_stopping_patience, ot, lr_decay);
}

int cyberhex_model_predict(
    void* model,
    const double* X, size_t X_rows, size_t X_cols,
    double* out_buf, size_t* out_cols
) {
    try {
        Matrix<double> mX(X_rows, X_cols);
        for (size_t i = 0; i < X_rows * X_cols; i++) mX.data[i] = X[i];

        Matrix<double> result = static_cast<Model*>(model)->forward(mX);
        *out_cols = result.cols;
        for (size_t i = 0; i < result.rows * result.cols; i++)
            out_buf[i] = result.data[i];
        return 0;
    } catch (...) {
        return -1;
    }
}

void cyberhex_model_save_json(void* model, const char* folder) {
    static_cast<Model*>(model)->saveWeights(std::string(folder));
}

void cyberhex_model_save_binary(void* model, const char* folder) {
    static_cast<Model*>(model)->saveWeightsBinary(std::string(folder));
}

} // extern "C"

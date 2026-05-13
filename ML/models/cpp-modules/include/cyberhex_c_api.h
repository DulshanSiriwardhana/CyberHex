
#ifndef CYBERHEX_C_API_H
#define CYBERHEX_C_API_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stddef.h>
#include <stdint.h>


void* cyberhex_model_create(void);
void  cyberhex_model_destroy(void* model);


void* cyberhex_dense_create(int in, int out, int init_he);  
void* cyberhex_relu_create(void);
void* cyberhex_sigmoid_create(void);
void* cyberhex_tanh_create(void);
void* cyberhex_softmax_create(void);
void* cyberhex_leakyrelu_create(void);
void* cyberhex_dropout_create(double rate);
void* cyberhex_batchnorm_create(size_t input_size);

void  cyberhex_model_add(void* model, void* layer);




void cyberhex_model_train(
    void*        model,
    const double* X, size_t X_rows, size_t X_cols,
    const double* y, size_t y_rows, size_t y_cols,
    int epochs, double lr,
    int loss_type,
    int early_stopping_patience,
    int opt_type,
    double lr_decay
);




int cyberhex_model_predict(
    void*        model,
    const double* X, size_t X_rows, size_t X_cols,
    double*       out_buf, size_t* out_cols
);


void cyberhex_model_save_json(void* model, const char* folder);
void cyberhex_model_save_binary(void* model, const char* folder);


const char* cyberhex_version(void);

#ifdef __cplusplus
}
#endif

#endif 

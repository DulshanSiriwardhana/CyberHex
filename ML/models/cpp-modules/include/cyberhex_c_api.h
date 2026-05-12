/**
 * CyberHex ML Engine - C API
 * Item 59: Expose C API for Node.js/Python FFI bindings
 * 
 * All functions use extern "C" linkage for ABI compatibility.
 * Opaque handle model: callers get void* handles, eliminating C++ header dependency.
 */
#ifndef CYBERHEX_C_API_H
#define CYBERHEX_C_API_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stddef.h>
#include <stdint.h>

/* ── Model lifecycle ─────────────────────────────────────────────── */
void* cyberhex_model_create(void);
void  cyberhex_model_destroy(void* model);

/* ── Layer factory ───────────────────────────────────────────────── */
void* cyberhex_dense_create(int in, int out, int init_he);  // init_he=1 → He, 0 → Xavier
void* cyberhex_relu_create(void);
void* cyberhex_sigmoid_create(void);
void* cyberhex_tanh_create(void);
void* cyberhex_softmax_create(void);
void* cyberhex_leakyrelu_create(void);
void* cyberhex_dropout_create(double rate);
void* cyberhex_batchnorm_create(size_t input_size);

void  cyberhex_model_add(void* model, void* layer);

/* ── Training ────────────────────────────────────────────────────── */
// loss_type: 0=MSE, 1=BCE, 2=CCE
// opt_type:  0=SGD, 1=MOMENTUM, 2=RMSPROP, 3=ADAM
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

/* ── Inference ───────────────────────────────────────────────────── */
// Caller allocates out_buf of size (X_rows * out_cols) doubles.
// Returns 0 on success, -1 on error.
int cyberhex_model_predict(
    void*        model,
    const double* X, size_t X_rows, size_t X_cols,
    double*       out_buf, size_t* out_cols
);

/* ── IO ──────────────────────────────────────────────────────────── */
void cyberhex_model_save_json(void* model, const char* folder);
void cyberhex_model_save_binary(void* model, const char* folder);

/* ── Version ─────────────────────────────────────────────────────── */
const char* cyberhex_version(void);

#ifdef __cplusplus
}
#endif

#endif // CYBERHEX_C_API_H

#ifndef CYBERHEX_TRAINING_PROTOCOL_H
#define CYBERHEX_TRAINING_PROTOCOL_H

#include <string>
#include <vector>
#include <cstddef>

namespace cyberhex {

struct TrainingConfig {
    std::string task = "regression";
    std::vector<size_t> layers = {64, 32, 1};
    std::vector<std::string> activations = {"relu", "relu", "linear"};
    std::string loss = "mse";
    int batch_size = 32;
    int epochs = 100;
    double learning_rate = 0.001;
    std::string optimizer = "adam";
    double validation_split = 0.2;
    bool early_stopping = true;
    int patience = 10;
    std::string data_path;
    int seed = 42;

    std::string engine = "imperative";

    std::string device = "cpu";
    bool mixed_precision = false;

    std::string architecture = "mlp";
    size_t d_model = 64;
    size_t num_heads = 4;
    size_t transformer_layers = 2;
    size_t ffn_dim = 256;

    bool export_onnx = false;
};

TrainingConfig load_config_from_env();

TrainingConfig parse_training_config(const std::string& json);

void emit_log(const std::string& message);
void emit_epoch(int epoch, double train_loss, double val_loss, bool has_val_loss);
void emit_training_complete(double final_train_loss, double final_val_loss,
                            const std::string& model_path);

}

#endif

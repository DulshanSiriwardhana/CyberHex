#include "training_protocol.h"
#include <cstdlib>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <cmath>
#include <cctype>
#include <algorithm>

namespace cyberhex {

namespace {

std::string trim(const std::string& s) {
    size_t start = 0;
    while (start < s.size() && std::isspace(static_cast<unsigned char>(s[start]))) start++;
    size_t end = s.size();
    while (end > start && std::isspace(static_cast<unsigned char>(s[end - 1]))) end--;
    return s.substr(start, end - start);
}

std::string unquote(const std::string& s) {
    std::string t = trim(s);
    if (t.size() >= 2 && t.front() == '"' && t.back() == '"') {
        return t.substr(1, t.size() - 2);
    }
    return t;
}

bool find_key(const std::string& json, const std::string& key, size_t& value_start) {
    std::string needle = "\"" + key + "\"";
    size_t pos = json.find(needle);
    if (pos == std::string::npos) return false;
    pos = json.find(':', pos + needle.size());
    if (pos == std::string::npos) return false;
    value_start = pos + 1;
    return true;
}

std::string extract_string(const std::string& json, const std::string& key) {
    size_t start = 0;
    if (!find_key(json, key, start)) return "";
    while (start < json.size() && std::isspace(static_cast<unsigned char>(json[start]))) {
        start++;
    }
    size_t end = start;
    if (end < json.size() && json[end] == '"') {
        end++;
        while (end < json.size() && json[end] != '"') {
            if (json[end] == '\\') end++;
            end++;
        }
        if (end < json.size()) end++;
        return unquote(json.substr(start, end - start));
    }
    while (end < json.size() && json[end] != ',' && json[end] != '}' && json[end] != '\n') end++;
    return trim(json.substr(start, end - start));
}

bool extract_bool(const std::string& json, const std::string& key, bool default_val) {
    size_t start = 0;
    if (!find_key(json, key, start)) return default_val;
<<<<<<< HEAD
    std::string tail = json.substr(start, 12);
    if (tail.find("true") == 0) return true;
    if (tail.find("false") == 0) return false;
=======
    while (start < json.size() && std::isspace(static_cast<unsigned char>(json[start]))) {
        start++;
    }
    if (json.compare(start, 4, "true") == 0) return true;
    if (json.compare(start, 5, "false") == 0) return false;
>>>>>>> v3.0
    return default_val;
}

double extract_number(const std::string& json, const std::string& key, double default_val) {
    size_t start = 0;
    if (!find_key(json, key, start)) return default_val;
    while (start < json.size() && std::isspace(static_cast<unsigned char>(json[start]))) {
        start++;
    }
    size_t end = start;
    while (end < json.size() && (std::isdigit(static_cast<unsigned char>(json[end])) ||
           json[end] == '-' || json[end] == '+' || json[end] == '.' || json[end] == 'e' ||
           json[end] == 'E')) {
        end++;
    }
    try {
        return std::stod(trim(json.substr(start, end - start)));
    } catch (...) {
        return default_val;
    }
}

int extract_int(const std::string& json, const std::string& key, int default_val) {
    return static_cast<int>(extract_number(json, key, static_cast<double>(default_val)));
}

std::vector<size_t> extract_size_t_array(const std::string& json, const std::string& key) {
    std::vector<size_t> out;
    size_t start = 0;
    if (!find_key(json, key, start)) return out;
    size_t bracket = json.find('[', start);
    if (bracket == std::string::npos) return out;
    size_t close = json.find(']', bracket);
    if (close == std::string::npos) return out;
    std::string inner = json.substr(bracket + 1, close - bracket - 1);
    std::stringstream ss(inner);
    std::string token;
    while (std::getline(ss, token, ',')) {
        token = trim(token);
        if (token.empty()) continue;
        try {
            out.push_back(static_cast<size_t>(std::stoul(token)));
        } catch (...) {}
    }
    return out;
}

std::vector<std::string> extract_string_array(const std::string& json, const std::string& key) {
    std::vector<std::string> out;
    size_t start = 0;
    if (!find_key(json, key, start)) return out;
    size_t bracket = json.find('[', start);
    if (bracket == std::string::npos) return out;
    size_t close = json.find(']', bracket);
    if (close == std::string::npos) return out;
    std::string inner = json.substr(bracket + 1, close - bracket - 1);
    size_t i = 0;
    while (i < inner.size()) {
        while (i < inner.size() && inner[i] != '"') i++;
        if (i >= inner.size()) break;
        size_t j = i + 1;
        while (j < inner.size() && inner[j] != '"') j++;
        if (j < inner.size()) {
            out.push_back(inner.substr(i + 1, j - i - 1));
            i = j + 1;
        } else {
            break;
        }
    }
    return out;
}

std::string json_escape(const std::string& s) {
    std::ostringstream oss;
    for (char c : s) {
        switch (c) {
            case '"': oss << "\\\""; break;
            case '\\': oss << "\\\\"; break;
            case '\n': oss << "\\n"; break;
            case '\r': oss << "\\r"; break;
            default: oss << c;
        }
    }
    return oss.str();
}

} // namespace

TrainingConfig parse_training_config(const std::string& json) {
    TrainingConfig cfg;
    if (json.empty() || trim(json) == "{}") return cfg;

    std::string task = extract_string(json, "task");
    if (!task.empty()) cfg.task = task;

    auto layers = extract_size_t_array(json, "layers");
    if (!layers.empty()) cfg.layers = layers;

    auto activations = extract_string_array(json, "activations");
    if (!activations.empty()) cfg.activations = activations;

    std::string loss = extract_string(json, "loss");
    if (!loss.empty()) cfg.loss = loss;

    {
        size_t pos = 0;
        if (find_key(json, "batchSize", pos)) {
            cfg.batch_size = extract_int(json, "batchSize", cfg.batch_size);
        } else if (find_key(json, "batch_size", pos)) {
            cfg.batch_size = extract_int(json, "batch_size", cfg.batch_size);
        }
    }

    cfg.epochs = extract_int(json, "epochs", cfg.epochs);
    cfg.learning_rate = extract_number(json, "learningRate", cfg.learning_rate);
    double lr_snake = extract_number(json, "learning_rate", -1.0);
    if (lr_snake > 0) cfg.learning_rate = lr_snake;

    std::string opt = extract_string(json, "optimizer");
    if (!opt.empty()) cfg.optimizer = opt;

    cfg.validation_split = extract_number(json, "validationSplit", cfg.validation_split);
    double vs = extract_number(json, "validation_split", -1.0);
    if (vs >= 0.0 && vs <= 1.0) cfg.validation_split = vs;

    cfg.early_stopping = extract_bool(json, "earlyStopping", cfg.early_stopping);
    cfg.patience = extract_int(json, "patience", cfg.patience);

    std::string data_path = extract_string(json, "dataPath");
    if (data_path.empty() || data_path == "null") {
        data_path = extract_string(json, "data_path");
    }
    if (!data_path.empty() && data_path != "null") cfg.data_path = data_path;

    cfg.seed = extract_int(json, "seed", cfg.seed);
<<<<<<< HEAD
=======
    cfg.export_onnx = extract_bool(json, "exportOnnx", cfg.export_onnx);
    cfg.export_onnx = extract_bool(json, "export_onnx", cfg.export_onnx);
>>>>>>> v3.0

    std::string engine = extract_string(json, "engine");
    if (!engine.empty()) cfg.engine = engine;

    std::string device = extract_string(json, "device");
    if (!device.empty()) cfg.device = device;

    cfg.mixed_precision = extract_bool(json, "mixedPrecision", cfg.mixed_precision);
    cfg.mixed_precision = extract_bool(json, "mixed_precision", cfg.mixed_precision);

    std::string arch = extract_string(json, "architecture");
    if (arch.empty()) arch = extract_string(json, "modelType");
    if (!arch.empty()) cfg.architecture = arch;

    {
        double dm = extract_number(json, "dModel", -1.0);
        if (dm < 0) dm = extract_number(json, "d_model", -1.0);
        if (dm > 0) cfg.d_model = static_cast<size_t>(dm);
    }
    {
        double nh = extract_number(json, "numHeads", -1.0);
        if (nh < 0) nh = extract_number(json, "num_heads", -1.0);
        if (nh > 0) cfg.num_heads = static_cast<size_t>(nh);
    }
    {
        double tl = extract_number(json, "transformerLayers", -1.0);
        if (tl < 0) tl = extract_number(json, "transformer_layers", -1.0);
        if (tl > 0) cfg.transformer_layers = static_cast<size_t>(tl);
    }
    {
        double fd = extract_number(json, "ffnDim", -1.0);
        if (fd < 0) fd = extract_number(json, "ffn_dim", -1.0);
        if (fd > 0) cfg.ffn_dim = static_cast<size_t>(fd);
    }

    return cfg;
}

TrainingConfig load_config_from_env() {
    const char* raw = std::getenv("CYBERHEX_CONFIG");
    if (!raw || !*raw) return TrainingConfig{};
    return parse_training_config(raw);
}

void emit_log(const std::string& message) {
    std::cout << "{\"type\":\"log\",\"message\":\"" << json_escape(message) << "\"}" << std::endl;
}

void emit_epoch(int epoch, double train_loss, double val_loss, bool has_val_loss) {
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "{\"type\":\"epoch\",\"epoch\":" << epoch
              << ",\"train_loss\":" << train_loss;
    if (has_val_loss && std::isfinite(val_loss)) {
        std::cout << ",\"val_loss\":" << val_loss;
    }
    std::cout << "}" << std::endl;
}

void emit_training_complete(double final_train_loss, double final_val_loss,
                            const std::string& model_path) {
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "{\"type\":\"training_complete\""
              << ",\"final_train_loss\":" << final_train_loss
              << ",\"final_val_loss\":" << final_val_loss
              << ",\"model_path\":\"" << json_escape(model_path) << "\"}" << std::endl;
}

} // namespace cyberhex

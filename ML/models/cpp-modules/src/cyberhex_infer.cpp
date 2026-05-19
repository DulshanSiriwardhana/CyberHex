// CyberHex C++ inference CLI — cyberhex.infer.v1
// CYBERHEX_INFER_CONFIG='{"model_path":"/path/prefix","features":[[...]],"task":"regression"}'

#include "weight_io.h"
#include "activations.h"
#include <algorithm>
#include <cctype>
#include <vector>
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <sstream>
#include <vector>

using namespace cyberhex;

namespace {

std::string extract_string(const std::string& json, const std::string& key) {
    std::string needle = "\"" + key + "\"";
    size_t pos = json.find(needle);
    if (pos == std::string::npos) return "";
    pos = json.find(':', pos);
    if (pos == std::string::npos) return "";
    pos = json.find('"', pos);
    if (pos == std::string::npos) return "";
    size_t end = json.find('"', pos + 1);
    return json.substr(pos + 1, end - pos - 1);
}

std::vector<std::vector<double>> extract_features(const std::string& json) {
    std::vector<std::vector<double>> rows;
    size_t pos = json.find("\"features\"");
    if (pos == std::string::npos) return rows;
    pos = json.find('[', pos);
    if (pos == std::string::npos) return rows;

    std::vector<double> current_row;
    size_t i = pos + 1;
    while (i < json.size()) {
        char c = json[i];
        if (c == '[') {
            if (!current_row.empty()) rows.push_back(current_row);
            current_row.clear();
            i++;
            continue;
        }
        if (c == ']') {
            if (!current_row.empty()) {
                rows.push_back(current_row);
                current_row.clear();
            }
            if (i + 1 < json.size() && json[i + 1] == ']') break;
            i++;
            continue;
        }
        if ((c >= '0' && c <= '9') || c == '-' || c == '+' || c == '.') {
            size_t j = i;
            while (j < json.size() && json[j] != ',' && json[j] != ']' && json[j] != ' ') j++;
            try {
                current_row.push_back(std::stod(json.substr(i, j - i)));
            } catch (...) {}
            i = j;
            continue;
        }
        i++;
    }
    return rows;
}

struct DenseWeights {
    Matrix<double> W;
    Matrix<double> b;
};

std::vector<DenseWeights> load_mlp_prefix(const std::string& prefix) {
    namespace fs = std::filesystem;
    std::vector<int> indices;
    for (const auto& entry : fs::directory_iterator(prefix)) {
        std::string name = entry.path().filename().string();
        if (name.rfind("layer_", 0) != 0) continue;
        if (name.find(".json") != std::string::npos) {
            indices.push_back(std::stoi(name.substr(6, name.find('.') - 6)));
        }
    }
    std::sort(indices.begin(), indices.end());
    indices.erase(std::unique(indices.begin(), indices.end()), indices.end());

    std::vector<DenseWeights> layers;
    for (int idx : indices) {
        std::string json_path = prefix + "/layer_" + std::to_string(idx) + ".json";
        std::string w_bin = prefix + "/layer_" + std::to_string(idx) + "_weights.bin";
        std::string b_bin = prefix + "/layer_" + std::to_string(idx) + "_bias.bin";

        DenseWeights dw;
        if (fs::exists(w_bin) && fs::exists(b_bin)) {
            dw.W = load_matrix_binary(w_bin);
            dw.b = load_matrix_binary(b_bin);
        } else if (fs::exists(json_path)) {
            if (!load_dense_json(json_path, dw.W, dw.b)) continue;
        } else {
            continue;
        }
        layers.push_back(std::move(dw));
    }
    return layers;
}

Matrix<double> forward_mlp(const std::vector<DenseWeights>& layers,
                           const Matrix<double>& X,
                           const std::string& task) {
    Matrix<double> act = X;
    for (size_t i = 0; i < layers.size(); i++) {
        act = act.dot(layers[i].W);
        for (size_t r = 0; r < act.rows(); r++) {
            for (size_t c = 0; c < act.cols(); c++) {
                act(r, c) += layers[i].b(0, c);
            }
        }
        const bool last = (i + 1 == layers.size());
        if (!last) {
            for (size_t k = 0; k < act.size(); k++) {
                act.at(k) = act.at(k) > 0.0 ? act.at(k) : 0.0;
            }
        } else if (task == "classification") {
            for (size_t r = 0; r < act.rows(); r++) {
                double maxv = act(r, 0);
                for (size_t c = 1; c < act.cols(); c++) {
                    maxv = std::max(maxv, act(r, c));
                }
                double sum = 0.0;
                for (size_t c = 0; c < act.cols(); c++) {
                    act(r, c) = std::exp(act(r, c) - maxv);
                    sum += act(r, c);
                }
                for (size_t c = 0; c < act.cols(); c++) act(r, c) /= sum;
            }
        }
    }
    return act;
}

void emit_error(const std::string& msg) {
    std::cout << "{\"error\":\"" << msg << "\"}" << std::endl;
}

} // namespace

int main() {
    const char* raw = std::getenv("CYBERHEX_INFER_CONFIG");
    if (!raw) {
        emit_error("CYBERHEX_INFER_CONFIG not set");
        return 1;
    }

    std::string json(raw);
    std::string model_path = extract_string(json, "model_path");
    std::string task = extract_string(json, "task");
    if (task.empty()) task = "regression";

    std::string prefix = model_path;
    if (prefix.size() > 8 && prefix.substr(prefix.size() - 8) == "_weights") {
        prefix = prefix.substr(0, prefix.size() - 8);
    }

    if (!std::filesystem::exists(prefix)) {
        emit_error("Model prefix not found: " + prefix);
        return 1;
    }

    auto layers = load_mlp_prefix(prefix);
    if (layers.empty()) {
        emit_error("No Dense layers found under prefix");
        return 1;
    }

    auto feat_rows = extract_features(json);
    if (feat_rows.empty()) {
        emit_error("features array required");
        return 1;
    }

    Matrix<double> X(feat_rows.size(), feat_rows[0].size());
    for (size_t i = 0; i < feat_rows.size(); i++) {
        for (size_t j = 0; j < feat_rows[i].size(); j++) {
            X(i, j) = feat_rows[i][j];
        }
    }

    Matrix<double> pred = forward_mlp(layers, X, task);

    std::cout << "{\"success\":true,\"backend\":\"cpp\","
              << "\"shape\":[" << pred.rows() << "," << pred.cols() << "],"
              << "\"predictions\":[";
    for (size_t i = 0; i < pred.rows(); i++) {
        if (i) std::cout << ",";
        std::cout << "[";
        for (size_t j = 0; j < pred.cols(); j++) {
            if (j) std::cout << ",";
            std::cout << pred(i, j);
        }
        std::cout << "]";
    }
    std::cout << "]}" << std::endl;
    return 0;
}

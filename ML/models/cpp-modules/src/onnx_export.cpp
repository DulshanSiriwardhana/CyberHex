#include "onnx_export.h"
#include <algorithm>
#include <vector>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>

namespace cyberhex {

namespace fs = std::filesystem;

namespace {

std::string json_escape(const std::string& s) {
    std::ostringstream oss;
    for (char c : s) {
        switch (c) {
            case '"': oss << "\\\""; break;
            case '\\': oss << "\\\\"; break;
            default: oss << c;
        }
    }
    return oss.str();
}

} // namespace

bool write_export_manifest(const std::string& weights_prefix,
                           const std::string& manifest_path,
                           const std::string& task) {
    if (!fs::exists(weights_prefix)) return false;

    std::vector<std::string> layers;
    for (const auto& entry : fs::directory_iterator(weights_prefix)) {
        std::string name = entry.path().filename().string();
        if (name.find("layer_") == 0 && name.find(".json") != std::string::npos) {
            layers.push_back(entry.path().string());
        }
    }
    std::sort(layers.begin(), layers.end());

    std::ofstream f(manifest_path);
    if (!f) return false;

    f << "{\n";
    f << "  \"version\": \"cyberhex.onnx.v1\",\n";
    f << "  \"task\": \"" << json_escape(task) << "\",\n";
    f << "  \"weights_prefix\": \"" << json_escape(weights_prefix) << "\",\n";
    f << "  \"layers\": [\n";
    for (size_t i = 0; i < layers.size(); i++) {
        f << "    \"" << json_escape(layers[i]) << "\"";
        if (i + 1 < layers.size()) f << ",";
        f << "\n";
    }
    f << "  ]\n";
    f << "}\n";
    return !layers.empty();
}

void emit_export_complete(const std::string& manifest_path,
                          const std::string& onnx_path_hint) {
    std::cout << "{\"type\":\"export_complete\""
              << ",\"manifest_path\":\"" << json_escape(manifest_path) << "\""
              << ",\"onnx_path_hint\":\"" << json_escape(onnx_path_hint) << "\"}"
              << std::endl;
}

} // namespace cyberhex

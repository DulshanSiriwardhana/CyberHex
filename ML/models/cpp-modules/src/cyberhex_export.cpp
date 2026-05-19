// CyberHex ONNX export CLI — writes manifest; run export_onnx.py for .onnx
// CYBERHEX_EXPORT_CONFIG='{"weightsPrefix":"/path/model_123","onnxPath":"/path/out.onnx"}'

#include "onnx_export.h"
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <string>

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

} // namespace

int main() {
    const char* raw = std::getenv("CYBERHEX_EXPORT_CONFIG");
    if (!raw) {
        std::cout << "{\"error\":\"CYBERHEX_EXPORT_CONFIG not set\"}" << std::endl;
        return 1;
    }

    std::string json(raw);
    std::string prefix = extract_string(json, "weightsPrefix");
    if (prefix.empty()) prefix = extract_string(json, "weights_prefix");
    std::string onnx_path = extract_string(json, "onnxPath");
    if (onnx_path.empty()) onnx_path = extract_string(json, "onnx_path");
    std::string task = extract_string(json, "task");
    if (task.empty()) task = "regression";

    if (prefix.empty() || !std::filesystem::exists(prefix)) {
        std::cout << "{\"error\":\"weightsPrefix not found\"}" << std::endl;
        return 1;
    }

    std::string manifest = prefix + "/export_manifest.json";
    if (!write_export_manifest(prefix, manifest, task)) {
        std::cout << "{\"error\":\"No layer JSON weights to export\"}" << std::endl;
        return 1;
    }

    if (onnx_path.empty()) {
        onnx_path = prefix + "/model.onnx";
    }

    emit_export_complete(manifest, onnx_path);
    return 0;
}

#ifndef CYBERHEX_ONNX_EXPORT_H
#define CYBERHEX_ONNX_EXPORT_H

#include <string>

namespace cyberhex {

bool write_export_manifest(const std::string& weights_prefix,
                           const std::string& manifest_path,
                           const std::string& task = "regression");

bool write_graph_export_manifest(const std::string& weights_prefix,
                                 const std::string& manifest_path,
                                 const std::string& task = "regression");

bool write_any_export_manifest(const std::string& weights_prefix,
                               const std::string& manifest_path,
                               const std::string& task = "regression");

void emit_export_complete(const std::string& manifest_path,
                          const std::string& onnx_path_hint);

}

#endif

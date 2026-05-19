#ifndef CYBERHEX_ONNX_EXPORT_H
#define CYBERHEX_ONNX_EXPORT_H

#include <string>

namespace cyberhex {

/**
 * Write cyberhex.onnx.v1 manifest JSON describing Dense+ReLU MLP weights on disk.
 * Pair with ML/scripts/export_onnx.py to produce a .onnx file.
 */
bool write_export_manifest(const std::string& weights_prefix,
                           const std::string& manifest_path,
                           const std::string& task = "regression");

/** Emit manifest path to stdout as JSON (for backend / CLI). */
void emit_export_complete(const std::string& manifest_path,
                          const std::string& onnx_path_hint);

} // namespace cyberhex

#endif // CYBERHEX_ONNX_EXPORT_H

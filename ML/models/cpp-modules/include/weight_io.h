#ifndef CYBERHEX_WEIGHT_IO_H
#define CYBERHEX_WEIGHT_IO_H

#include "matrix.h"
#include <string>
#include <fstream>

namespace cyberhex {

/** Load a matrix from binary format written by Model::save_weights_binary. */
Matrix<double> load_matrix_binary(const std::string& path);

/** Load Dense weights from JSON file produced by Model::save_weights. */
bool load_dense_json(const std::string& path, Matrix<double>& weights, Matrix<double>& bias);

} // namespace cyberhex

#endif // CYBERHEX_WEIGHT_IO_H

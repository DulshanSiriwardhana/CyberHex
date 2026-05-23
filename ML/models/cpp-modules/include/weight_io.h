#ifndef CYBERHEX_WEIGHT_IO_H
#define CYBERHEX_WEIGHT_IO_H

#include "matrix.h"
#include <string>
#include <fstream>

namespace cyberhex {

Matrix<double> load_matrix_binary(const std::string& path);

bool load_dense_json(const std::string& path, Matrix<double>& weights, Matrix<double>& bias);

}

#endif

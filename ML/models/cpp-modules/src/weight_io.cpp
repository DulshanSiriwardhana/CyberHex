#include "weight_io.h"
#include <sstream>
#include <fstream>
#include <stdexcept>

namespace cyberhex {

Matrix<double> load_matrix_binary(const std::string& path) {
    std::ifstream file(path, std::ios::binary);
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open weight file: " + path);
    }
    size_t rows = 0, cols = 0;
    file.read(reinterpret_cast<char*>(&rows), sizeof(size_t));
    file.read(reinterpret_cast<char*>(&cols), sizeof(size_t));
    Matrix<double> m(rows, cols);
    file.read(reinterpret_cast<char*>(m.data()), m.size() * sizeof(double));
    if (!file) {
        throw std::runtime_error("Truncated weight file: " + path);
    }
    return m;
}

namespace {

std::vector<double> parse_number_list(const std::string& block) {
    std::vector<double> values;
    std::stringstream ss(block);
    std::string token;
    while (std::getline(ss, token, ',')) {
        size_t start = token.find_first_not_of(" \t\n\r");
        size_t end = token.find_last_not_of(" \t\n\r");
        if (start == std::string::npos) continue;
        values.push_back(std::stod(token.substr(start, end - start + 1)));
    }
    return values;
}

} // namespace

bool load_dense_json(const std::string& path, Matrix<double>& weights, Matrix<double>& bias) {
    std::ifstream file(path);
    if (!file.is_open()) return false;

    std::string content((std::istreambuf_iterator<char>(file)),
                        std::istreambuf_iterator<char>());

    size_t wpos = content.find("\"weights\"");
    if (wpos == std::string::npos) return false;
    size_t wstart = content.find('[', wpos);
    size_t wend = content.find("],", wstart);
    if (wstart == std::string::npos || wend == std::string::npos) return false;

    auto flat_rows = parse_number_list(content.substr(wstart + 1, wend - wstart));

    size_t inner_start = content.find('[', wstart + 1);
    size_t row_count = 0;
    size_t col_count = 0;
    size_t search = inner_start;
    while (search < wend) {
        size_t row_open = content.find('[', search);
        if (row_open == std::string::npos || row_open >= wend) break;
        size_t row_close = content.find(']', row_open);
        if (row_close == std::string::npos || row_close > wend) break;
        auto row_vals = parse_number_list(content.substr(row_open + 1, row_close - row_open - 1));
        if (row_count == 0) col_count = row_vals.size();
        row_count++;
        search = row_close + 1;
    }

    if (row_count == 0 || col_count == 0) return false;
    weights = Matrix<double>(row_count, col_count);
    size_t idx = 0;
    search = inner_start;
    for (size_t r = 0; r < row_count; r++) {
        size_t row_open = content.find('[', search);
        size_t row_close = content.find(']', row_open);
        auto row_vals = parse_number_list(content.substr(row_open + 1, row_close - row_open - 1));
        for (size_t c = 0; c < col_count && c < row_vals.size(); c++) {
            weights(r, c) = row_vals[c];
        }
        search = row_close + 1;
        idx++;
    }
    (void)idx;
    (void)flat_rows;

    size_t bpos = content.find("\"bias\"");
    if (bpos == std::string::npos) return false;
    size_t bstart = content.find('[', bpos);
    size_t bend = content.find(']', bstart);
    auto bvals = parse_number_list(content.substr(bstart + 1, bend - bstart - 1));
    bias = Matrix<double>(1, bvals.size());
    for (size_t j = 0; j < bvals.size(); j++) {
        bias(0, j) = bvals[j];
    }
    return true;
}

} // namespace cyberhex

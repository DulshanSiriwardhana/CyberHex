#include "model.h"
#include "dense.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <cmath>
#include <filesystem>

void Model::add(Layer* layer) {
    layers.push_back(layer);
}

Matrix<double> Model::forward(const Matrix<double>& X) {
    std::lock_guard<std::mutex> lock(mtx);
    Matrix<double> out = X;
    for (auto l : layers)
        out = l->forward(out);
    return out;
}

void Model::backward(Matrix<double> grad, double lr, OptimizerType opt, int t) {
    for (int i = (int)layers.size() - 1; i >= 0; i--)
        grad = layers[i]->backward(grad, lr, opt, t);
}

void Model::train(const Matrix<double>& X, const Matrix<double>& y, int epochs, double lr, LossType loss_type, int early_stopping_patience, OptimizerType opt, double lr_decay) {
    namespace fs = std::filesystem;

    std::string folder = "../../ui/visualizations/public/";
    fs::create_directories(folder);

    std::ofstream lossFile(folder + "/epoch_losses.csv");
    lossFile << "epoch,loss\n";

    double min_loss = 1e18;
    int best_epoch = 0;
    int patience_counter = 0;

    for (int e = 0; e < epochs; e++) {

        Matrix<double> pred = forward(X);

        double loss = 0;
        if (loss_type == LossType::MSE) {
            for (int i = 0; i < y.rows; i++) {
                for (int j = 0; j < y.cols; j++) {
                    double diff = pred(i, j) - y(i, j);
                    loss += diff * diff;
                }
            }
            loss /= y.rows;
        } else if (loss_type == LossType::BCE) {
            for (int i = 0; i < y.rows; i++) {
                for (int j = 0; j < y.cols; j++) {
                    double y_true = y(i, j);
                    double y_pred = std::max(1e-15, std::min(1.0 - 1e-15, pred(i, j)));
                    loss -= y_true * std::log(y_pred) + (1.0 - y_true) * std::log(1.0 - y_pred);
                }
            }
            loss /= y.rows;
        } else if (loss_type == LossType::CCE) {
            for (int i = 0; i < y.rows; i++) {
                for (int j = 0; j < y.cols; j++) {
                    double y_true = y(i, j);
                    double y_pred = std::max(1e-15, std::min(1.0 - 1e-15, pred(i, j)));
                    loss -= y_true * std::log(y_pred);
                }
            }
            loss /= y.rows;
        }

        std::cout << "Epoch :" << e + 1 << " -> loss = " << loss << std::endl;

        if (e % 100 == 0) {
            lossFile << (e / 100 + 1) << "," << loss << "\n";
            lossFile.flush();
        }

        Matrix<double> grad = pred - y;
        
        // Gradient Clipping bounds [-1.0, 1.0]
        for (size_t i = 0; i < grad.rows; i++) {
            for (size_t j = 0; j < grad.cols; j++) {
                grad(i, j) = std::max(-1.0, std::min(1.0, grad(i, j)));
            }
        }


        if (loss < min_loss) {
            min_loss = loss;
            best_epoch = e;
            patience_counter = 0;
            saveWeights(folder);
            saveWeightsBinary(folder);
        } else {
            patience_counter++;
            lr *= lr_decay; // LR Decay on patience failure
            std::cout << "Patience increased to " << patience_counter << ", LR decayed to " << lr << std::endl;
            if (early_stopping_patience > 0 && patience_counter >= early_stopping_patience) {
                std::cout << "Early stopping triggered at epoch " << e + 1 << "\n";
                break;
            }
        }

        backward(grad, lr, opt, e + 1);
    }

    lossFile.close();

    std::cout << "\nBest epoch: " << best_epoch + 1
              << " loss = " << min_loss << std::endl;
}

void Model::saveWeights(const std::string& folder) {
    std::lock_guard<std::mutex> lock(mtx);
    namespace fs = std::filesystem;
    fs::create_directories(folder);
    int idx = 0;
    for (auto l : layers) {
        Dense* d = dynamic_cast<Dense*>(l);
        if (d) {
            std::string path = folder + "/layer_" + std::to_string(idx) + ".json";
            std::ofstream f(path);
            const Matrix<double>& W = d->getWeights();
            const Matrix<double>& B = d->getBias();
            
            f << "{
";
            f << "  \"layerType\": \"Dense\",
";
            f << "  \"inputShape\": " << W.rows << ",
";
            f << "  \"outputShape\": " << W.cols << ",
";
            f << "  \"weights\": [
";
            for (size_t i = 0; i < W.rows; i++) {
                f << "    [";
                for (size_t j = 0; j < W.cols; j++) {
                    f << W(i, j) << (j == W.cols - 1 ? "" : ", ");
                }
                f << "]" << (i == W.rows - 1 ? "" : ",") << "
";
            }
            f << "  ],
";
            f << "  \"bias\": [
    ";
            for (size_t j = 0; j < B.cols; j++) {
                f << B(0, j) << (j == B.cols - 1 ? "" : ", ");
            }
            f << "
  ]
";
            f << "}
";
            f.close();
            idx++;
        }
    }
}
void Model::saveWeightsBinary(const std::string& folder) {
    std::lock_guard<std::mutex> lock(mtx);
    namespace fs = std::filesystem;
    fs::create_directories(folder);
    int idx = 0;
    for (auto l : layers) {
        Dense* d = dynamic_cast<Dense*>(l);
        if (d) {
            std::string w_path = folder + "/layer_" + std::to_string(idx) + "_weights.bin";
            std::string b_path = folder + "/layer_" + std::to_string(idx) + "_bias.bin";
            std::ofstream wf(w_path, std::ios::binary);
            std::ofstream bf(b_path, std::ios::binary);
            const Matrix<double>& W = d->getWeights();
            const Matrix<double>& B = d->getBias();
            
            int rows = W.rows, cols = W.cols;
            wf.write(reinterpret_cast<const char*>(&rows), sizeof(int));
            wf.write(reinterpret_cast<const char*>(&cols), sizeof(int));
            wf.write(reinterpret_cast<const char*>(W.data.data()), rows * cols * sizeof(double));
            
            rows = B.rows; cols = B.cols;
            bf.write(reinterpret_cast<const char*>(&rows), sizeof(int));
            bf.write(reinterpret_cast<const char*>(&cols), sizeof(int));
            bf.write(reinterpret_cast<const char*>(B.data.data()), rows * cols * sizeof(double));
            
            wf.close();
            bf.close();
            idx++;
        }
    }
}

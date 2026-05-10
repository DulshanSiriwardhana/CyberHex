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

Matrix Model::forward(const Matrix& X) {
    Matrix out = X;
    for (auto l : layers)
        out = l->forward(out);
    return out;
}

void Model::backward(Matrix grad, double lr) {
    for (int i = (int)layers.size() - 1; i >= 0; i--)
        grad = layers[i]->backward(grad, lr);
}

void Model::train(const Matrix& X, const Matrix& y, int epochs, double lr, LossType loss_type, int early_stopping_patience) {
    namespace fs = std::filesystem;

    std::string folder = "../../ui/visualizations/public/";
    fs::create_directories(folder);

    std::ofstream lossFile(folder + "/epoch_losses.csv");
    lossFile << "epoch,loss\n";

    double min_loss = 1e18;
    int best_epoch = 0;
    int patience_counter = 0;

    for (int e = 0; e < epochs; e++) {

        Matrix pred = forward(X);

        double loss = 0;
        if (loss_type == LossType::MSE) {
            for (int i = 0; i < y.rows; i++) {
                for (int j = 0; j < y.cols; j++) {
                    double diff = pred.matrix[i][j] - y.matrix[i][j];
                    loss += diff * diff;
                }
            }
            loss /= y.rows;
        } else if (loss_type == LossType::BCE) {
            for (int i = 0; i < y.rows; i++) {
                for (int j = 0; j < y.cols; j++) {
                    double y_true = y.matrix[i][j];
                    double y_pred = std::max(1e-15, std::min(1.0 - 1e-15, pred.matrix[i][j]));
                    loss -= y_true * std::log(y_pred) + (1.0 - y_true) * std::log(1.0 - y_pred);
                }
            }
            loss /= y.rows;
        } else if (loss_type == LossType::CCE) {
            for (int i = 0; i < y.rows; i++) {
                for (int j = 0; j < y.cols; j++) {
                    double y_true = y.matrix[i][j];
                    double y_pred = std::max(1e-15, std::min(1.0 - 1e-15, pred.matrix[i][j]));
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

        Matrix grad = pred - y;

        if (loss < min_loss) {
            min_loss = loss;
            best_epoch = e;
            patience_counter = 0;
            saveWeights(folder);
            saveWeightsBinary(folder);
        } else {
            patience_counter++;
            if (early_stopping_patience > 0 && patience_counter >= early_stopping_patience) {
                std::cout << "Early stopping triggered at epoch " << e + 1 << "\n";
                break;
            }
        }

        backward(grad, lr);
    }

    lossFile.close();

    std::cout << "\nBest epoch: " << best_epoch + 1
              << " loss = " << min_loss << std::endl;
}

void Model::saveWeights(const std::string& folder) {
    namespace fs = std::filesystem;

    fs::create_directories(folder);

    int idx = 0;

    for (auto l : layers) {
        Dense* d = dynamic_cast<Dense*>(l);

        if (d) {
            std::stringstream w, b;

            w << folder << "/layer_" << idx << "_weights.txt";
            b << folder << "/layer_" << idx << "_bias.txt";

            std::ofstream wf(w.str());
            std::ofstream bf(b.str());

            const Matrix& W = d->getWeights();
            const Matrix& B = d->getBias();

            for (int i = 0; i < W.rows; i++) {
                for (int j = 0; j < W.cols; j++)
                    wf << W.matrix[i][j] << " ";
                wf << "\n";
            }

            for (int j = 0; j < B.cols; j++)
                bf << B.matrix[0][j] << " ";

            wf.close();
            bf.close();

            idx++;
        }
    }
}
void Model::saveWeightsBinary(const std::string& folder) {
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
            const Matrix& W = d->getWeights();
            const Matrix& B = d->getBias();
            
            int rows = W.rows, cols = W.cols;
            wf.write(reinterpret_cast<const char*>(&rows), sizeof(int));
            wf.write(reinterpret_cast<const char*>(&cols), sizeof(int));
            for (int i = 0; i < rows; i++) {
                wf.write(reinterpret_cast<const char*>(W.matrix[i].data()), cols * sizeof(double));
            }
            
            rows = B.rows; cols = B.cols;
            bf.write(reinterpret_cast<const char*>(&rows), sizeof(int));
            bf.write(reinterpret_cast<const char*>(&cols), sizeof(int));
            for (int i = 0; i < rows; i++) {
                bf.write(reinterpret_cast<const char*>(B.matrix[i].data()), cols * sizeof(double));
            }
            
            wf.close();
            bf.close();
            idx++;
        }
    }
}

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

void Model::train(const Matrix& X, const Matrix& y, int epochs, double lr) {
    namespace fs = std::filesystem;

    std::string folder = "../../ui/visualizations/public/";
    fs::create_directories(folder);

    std::ofstream lossFile(folder + "/epoch_losses.csv");
    lossFile << "epoch,loss\n";

    double min_loss = 1e18;
    int best_epoch = 0;

    for (int e = 0; e < epochs; e++) {

        Matrix pred = forward(X);

        double loss = 0;
        for (int i = 0; i < y.rows; i++) {
            double diff = pred.matrix[i][0] - y.matrix[i][0];
            loss += diff * diff;
        }
        loss /= y.rows;

        std::cout << "Epoch :" << e + 1 << " -> loss = " << loss << std::endl;

        if(e%100==0){
            lossFile << (e/100 + 1) << "," << loss << "\n";
            lossFile.flush();
        }

        Matrix grad = pred - y;

        if (loss < min_loss) {
            min_loss = loss;
            best_epoch = e;
            saveWeights(folder);
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
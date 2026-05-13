import re
import os

dir_path = "/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules"


hdr = os.path.join(dir_path, "include/model.h")
with open(hdr, "r") as f:
    text = f.read()

text = text.replace("
text = text.replace("private:\n        std::vector<Layer*> layers;", "private:\n        std::vector<Layer*> layers;\n        mutable std::mutex mtx;")

with open(hdr, "w") as f:
    f.write(text)


cpp = os.path.join(dir_path, "src/model.cpp")
with open(cpp, "r") as f:
    text = f.read()

text = text.replace("Matrix<double> Model::forward(const Matrix<double>& X) {", "Matrix<double> Model::forward(const Matrix<double>& X) {\n    std::lock_guard<std::mutex> lock(mtx);")
text = text.replace("void Model::saveWeightsBinary(const std::string& folder) {", "void Model::saveWeightsBinary(const std::string& folder) {\n    std::lock_guard<std::mutex> lock(mtx);")


old_saveWeights = """void Model::saveWeights(const std::string& folder) {
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

            const Matrix<double>& W = d->getWeights();
            const Matrix<double>& B = d->getBias();

            for (int i = 0; i < W.rows; i++) {
                for (int j = 0; j < W.cols; j++)
                    wf << W(i, j) << " ";
                wf << "\\n";
            }

            for (int j = 0; j < B.cols; j++)
                bf << B(0, j) << " ";

            wf.close();
            bf.close();

            idx++;
        }
    }
}"""

new_saveWeights = """void Model::saveWeights(const std::string& folder) {
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
            
            f << "{\\n";
            f << "  \\"layerType\\": \\"Dense\\",\\n";
            f << "  \\"inputShape\\": " << W.rows << ",\\n";
            f << "  \\"outputShape\\": " << W.cols << ",\\n";
            f << "  \\"weights\\": [\\n";
            for (size_t i = 0; i < W.rows; i++) {
                f << "    [";
                for (size_t j = 0; j < W.cols; j++) {
                    f << W(i, j) << (j == W.cols - 1 ? "" : ", ");
                }
                f << "]" << (i == W.rows - 1 ? "" : ",") << "\\n";
            }
            f << "  ],\\n";
            f << "  \\"bias\\": [\\n    ";
            for (size_t j = 0; j < B.cols; j++) {
                f << B(0, j) << (j == B.cols - 1 ? "" : ", ");
            }
            f << "\\n  ]\\n";
            f << "}\\n";
            f.close();
            idx++;
        }
    }
}"""



import ast
text = re.sub(r"void Model::saveWeights\(const std::string& folder\) \{.*?\n\}\nvoid", new_saveWeights + "\nvoid", text, flags=re.DOTALL)

with open(cpp, "w") as f:
    f.write(text)

print("Done")

#include <emscripten/bind.h>
#include "matrix.h"
#include "layer.h"
#include "dense.h"
#include "activations.h"
#include "transformer.h"
#include "model.h"
#include <vector>
#include <string>
#include <memory>
#include <stdexcept>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(cyberhex_module) {

    register_vector<double>("VectorDouble");
    register_vector<std::string>("VectorString");

    enum_<cyberhex::InitType>("InitType")
        .value("HE", cyberhex::InitType::HE)
        .value("XAVIER", cyberhex::InitType::XAVIER)
        .value("LECUN_NORMAL", cyberhex::InitType::LECUN_NORMAL)
        .value("HE_UNIFORM", cyberhex::InitType::HE_UNIFORM)
        .value("XAVIER_UNIFORM", cyberhex::InitType::XAVIER_UNIFORM)
        .value("ORTHOGONAL", cyberhex::InitType::ORTHOGONAL)
        ;

    class_<cyberhex::Matrix<double>>("Matrix")
        .constructor<size_t, size_t>()
        .function("rows", &cyberhex::Matrix<double>::rows)
        .function("cols", &cyberhex::Matrix<double>::cols)
        .function("size", &cyberhex::Matrix<double>::size)
        .function("empty", &cyberhex::Matrix<double>::empty)
        .function("fill", &cyberhex::Matrix<double>::fill)
        .function("get", optional_override([](const cyberhex::Matrix<double>& self, size_t r, size_t c) {
            return self(r, c);
        }))
        .function("set", optional_override([](cyberhex::Matrix<double>& self, size_t r, size_t c, double val) {
            self(r, c) = val;
        }))
        .function("getData", optional_override([](const cyberhex::Matrix<double>& self) {
            std::vector<double> v(self.data(), self.data() + self.size());
            return v;
        }))
        .function("setData", optional_override([](cyberhex::Matrix<double>& self, const std::vector<double>& v) {
            if (v.size() != self.size()) {
                throw std::runtime_error("setData size mismatch: expected " + std::to_string(self.size()) + " but got " + std::to_string(v.size()));
            }
            std::copy(v.begin(), v.end(), self.data());
        }))
        .function("transpose", &cyberhex::Matrix<double>::transpose)
        .function("dot", &cyberhex::Matrix<double>::dot)
        .function("sum", &cyberhex::Matrix<double>::sum)
        .function("mean", &cyberhex::Matrix<double>::mean)
        .function("max", &cyberhex::Matrix<double>::max)
        .function("min", &cyberhex::Matrix<double>::min)
        .function("norm", &cyberhex::Matrix<double>::norm)
        ;

    class_<cyberhex::Layer>("Layer")
        .function("name", &cyberhex::Layer::name)
        .function("output_size", &cyberhex::Layer::output_size)
        ;

    class_<cyberhex::Dense, base<cyberhex::Layer>>("Dense")
        .constructor<size_t, size_t>()
        .constructor<size_t, size_t, cyberhex::InitType>()
        .function("getWeights", &cyberhex::Dense::getWeights)
        .function("getBias", &cyberhex::Dense::getBias)
        ;

    class_<cyberhex::ReLU, base<cyberhex::Layer>>("ReLU")
        .constructor<>()
        ;

    class_<cyberhex::Sigmoid, base<cyberhex::Layer>>("Sigmoid")
        .constructor<>()
        ;

    class_<cyberhex::Softmax, base<cyberhex::Layer>>("Softmax")
        .constructor<>()
        ;

    class_<cyberhex::Tanh, base<cyberhex::Layer>>("Tanh")
        .constructor<>()
        ;

    class_<cyberhex::LayerNormalization, base<cyberhex::Layer>>("LayerNormalization")
        .constructor<size_t>()
        .constructor<size_t, double>()
        ;

    class_<cyberhex::MultiHeadSelfAttention, base<cyberhex::Layer>>("MultiHeadSelfAttention")
        .constructor<size_t, size_t>()
        ;

    class_<cyberhex::TransformerEncoderBlock, base<cyberhex::Layer>>("TransformerEncoderBlock")
        .constructor<size_t, size_t, size_t>()
        ;

    class_<cyberhex::Model>("Model")
        .constructor<>()
        .function("add", select_overload<void(cyberhex::Layer*)>(&cyberhex::Model::add), allow_raw_pointers())
        .function("num_layers", &cyberhex::Model::num_layers)
        .function("get_epoch", &cyberhex::Model::get_epoch)
        .function("get_best_loss", &cyberhex::Model::get_best_loss)
        .function("forward", &cyberhex::Model::forward)
        .function("predict", &cyberhex::Model::predict)
        .function("save_weights", &cyberhex::Model::save_weights)
        .function("load_weights", &cyberhex::Model::load_weights)
        .function("compileWithLossAndOptimizer", optional_override([](cyberhex::Model& self, const std::string& loss_name, const std::string& opt_name, double lr) {
            std::unique_ptr<cyberhex::LossFunction> loss_fn;
            if (loss_name == "MSE") {
                loss_fn = std::make_unique<cyberhex::MSELoss>();
            } else if (loss_name == "MAE") {
                loss_fn = std::make_unique<cyberhex::MAELoss>();
            } else if (loss_name == "Huber") {
                loss_fn = std::make_unique<cyberhex::HuberLoss>();
            } else if (loss_name == "BCE") {
                loss_fn = std::make_unique<cyberhex::BinaryCrossEntropyLoss>();
            } else if (loss_name == "CCE") {
                loss_fn = std::make_unique<cyberhex::CategoricalCrossEntropyLoss>();
            } else {
                throw std::runtime_error("Unknown loss function: " + loss_name);
            }

            std::unique_ptr<cyberhex::Optimizer> optimizer;
            if (opt_name == "SGD") {
                optimizer = std::make_unique<cyberhex::SGDOptimizer>(lr);
            } else if (opt_name == "Adam") {
                optimizer = std::make_unique<cyberhex::AdamOptimizer>(lr);
            } else {
                throw std::runtime_error("Unknown optimizer: " + opt_name);
            }

            self.compile(std::move(loss_fn), std::move(optimizer), nullptr);
        }))
        .function("trainStep", optional_override([](cyberhex::Model& self, const cyberhex::Matrix<double>& X, const cyberhex::Matrix<double>& y, int epoch) {

            cyberhex::Matrix<double> pred = self.forward(X);

            double loss_val = self.compute_loss(pred, y);

            cyberhex::Matrix<double> grad = self.compute_loss_grad(pred, y);

            for (int i = (int)self.num_layers() - 1; i >= 0; i--) {
                grad = self.get_layer(i)->backward(grad);
            }

            cyberhex::Optimizer* optimizer = self.get_optimizer();
            if (optimizer) {
                size_t param_idx = 0;
                for (size_t i = 0; i < self.num_layers(); i++) {
                    cyberhex::Layer* layer = self.get_layer(i);
                    auto params = layer->parameters();
                    auto grads = layer->parameter_gradients();
                    for (size_t p = 0; p < params.size(); p++) {
                        optimizer->update(*(params[p]), *(grads[p]), param_idx++, epoch + 1);
                    }
                }
            }

            return loss_val;
        }))
        ;
}

#include "graph.h"
#include "fused_ops.h"
#include "dense.h"
#include "ops_dispatch.h"
#include "distributed.h"
#include <algorithm>
#include <cmath>
#include <random>
#include <stdexcept>
#include <unordered_set>
#include <fstream>
#include <filesystem>

namespace cyberhex {

namespace {

void he_init(Matrix<double>& W) {
    double fan_in = static_cast<double>(W.rows());
    double fan_out = static_cast<double>(W.cols());
    double stddev = std::sqrt(2.0 / fan_in);
    std::mt19937 gen(42);
    std::normal_distribution<double> dist(0.0, stddev);
    for (size_t i = 0; i < W.size(); i++) {
        W.at(i) = dist(gen);
    }
    (void)fan_out;
}

} // namespace

NodeId ComputationGraph::add_input() {
    GraphNode n;
    n.op = GraphOpType::Input;
    n.requires_grad = false;
    nodes_.push_back(std::move(n));
    return nodes_.size() - 1;
}

NodeId ComputationGraph::add_parameter(size_t rows, size_t cols, InitType init) {
    GraphNode n;
    n.op = GraphOpType::Parameter;
    n.weight = Matrix<double>(rows, cols, 0.0);
    n.grad_weight = Matrix<double>(rows, cols, 0.0);
    if (init == InitType::HE) {
        he_init(n.weight);
    }
    if (mixed_precision_) {
        n.mp.enabled = true;
        n.mp.fp16_cache = matrix_to_fp16(n.weight);
    }
    nodes_.push_back(std::move(n));
    return nodes_.size() - 1;
}

NodeId ComputationGraph::add_matmul(NodeId a, NodeId b) {
    GraphNode n;
    n.op = GraphOpType::MatMul;
    n.inputs = {a, b};
    nodes_.push_back(std::move(n));
    return nodes_.size() - 1;
}

NodeId ComputationGraph::add_bias_add(NodeId x, NodeId bias_param) {
    GraphNode n;
    n.op = GraphOpType::BiasAdd;
    n.inputs = {x, bias_param};
    nodes_.push_back(std::move(n));
    return nodes_.size() - 1;
}

NodeId ComputationGraph::add_add(NodeId a, NodeId b) {
    GraphNode n;
    n.op = GraphOpType::Add;
    n.inputs = {a, b};
    nodes_.push_back(std::move(n));
    return nodes_.size() - 1;
}

NodeId ComputationGraph::add_relu(NodeId x) {
    GraphNode n;
    n.op = GraphOpType::ReLU;
    n.inputs = {x};
    nodes_.push_back(std::move(n));
    return nodes_.size() - 1;
}

NodeId ComputationGraph::add_fused_linear_relu(NodeId input, NodeId weight_param, NodeId bias_param) {
    GraphNode n;
    n.op = GraphOpType::FusedLinearReLU;
    n.inputs = {input, weight_param, bias_param};
    nodes_.push_back(std::move(n));
    return nodes_.size() - 1;
}

void ComputationGraph::bind_input(NodeId id, const Matrix<double>& value) {
    nodes_.at(id).value = value;
}

Matrix<double> ComputationGraph::param_as_compute(const GraphNode& p) const {
    if (mixed_precision_ && p.mp.enabled) {
        return matrix_from_fp16(p.mp.fp16_cache);
    }
    return p.weight;
}

void ComputationGraph::forward_node(GraphNode& n) {
    switch (n.op) {
        case GraphOpType::Input:
        case GraphOpType::Parameter:
            break;
        case GraphOpType::MatMul: {
            const auto& A = nodes_.at(n.inputs[0]).value;
            const auto& B = nodes_.at(n.inputs[1]).op == GraphOpType::Parameter
                ? param_as_compute(nodes_.at(n.inputs[1]))
                : nodes_.at(n.inputs[1]).value;
            n.value = dispatch_matmul(device_, A, B);
            break;
        }
        case GraphOpType::BiasAdd: {
            const auto& X = nodes_.at(n.inputs[0]).value;
            const auto& b = nodes_.at(n.inputs[1]).op == GraphOpType::Parameter
                ? param_as_compute(nodes_.at(n.inputs[1]))
                : nodes_.at(n.inputs[1]).value;
            n.value = X;
            for (size_t i = 0; i < n.value.rows(); i++) {
                for (size_t j = 0; j < n.value.cols(); j++) {
                    n.value(i, j) += b(0, j);
                }
            }
            break;
        }
        case GraphOpType::Add:
            n.value = nodes_.at(n.inputs[0]).value + nodes_.at(n.inputs[1]).value;
            break;
        case GraphOpType::ReLU: {
            const auto& X = nodes_.at(n.inputs[0]).value;
            n.value = Matrix<double>(X.rows(), X.cols());
            for (size_t i = 0; i < X.size(); i++) {
                n.value.at(i) = X.at(i) > 0.0 ? X.at(i) : 0.0;
            }
            break;
        }
        case GraphOpType::FusedLinearReLU: {
            const auto& X = nodes_.at(n.inputs[0]).value;
            auto& Wnode = nodes_.at(n.inputs[1]);
            auto& Bnode = nodes_.at(n.inputs[2]);
            Matrix<double> W = Wnode.op == GraphOpType::Parameter ? param_as_compute(Wnode) : Wnode.value;
            Matrix<double> b = Bnode.op == GraphOpType::Parameter ? param_as_compute(Bnode) : Bnode.value;
            n.weight = Matrix<double>(); // pre_activation cache in weight slot
            n.value = fused_linear_relu_forward(X, W, b, n.weight);
            break;
        }
        default:
            break;
    }
}

void ComputationGraph::backward_node(GraphNode& n) {
    switch (n.op) {
        case GraphOpType::Input:
            break;
        case GraphOpType::Parameter:
            break;
        case GraphOpType::MatMul: {
            const auto& A = nodes_.at(n.inputs[0]).value;
            Matrix<double> B = nodes_.at(n.inputs[1]).op == GraphOpType::Parameter
                ? param_as_compute(nodes_.at(n.inputs[1]))
                : nodes_.at(n.inputs[1]).value;
            auto& gA = nodes_.at(n.inputs[0]).grad;
            auto& gBnode = nodes_.at(n.inputs[1]);

            Matrix<double> dA = n.grad.dot(B.transpose());
            Matrix<double> dB = A.transpose().dot(n.grad);

            if (gA.empty()) gA = dA; else gA = gA + dA;

            if (gBnode.op == GraphOpType::Parameter) {
                gBnode.grad_weight = gBnode.grad_weight.empty() ? dB : gBnode.grad_weight + dB;
            } else {
                if (gBnode.grad.empty()) gBnode.grad = dB; else gBnode.grad = gBnode.grad + dB;
            }
            break;
        }
        case GraphOpType::BiasAdd: {
            auto& gX = nodes_.at(n.inputs[0]).grad;
            auto& gB = nodes_.at(n.inputs[1]).grad_weight;
            if (gX.empty()) gX = n.grad; else gX = gX + n.grad;
            Matrix<double> db(1, n.grad.cols(), 0.0);
            for (size_t j = 0; j < n.grad.cols(); j++) {
                for (size_t i = 0; i < n.grad.rows(); i++) db(0, j) += n.grad(i, j);
            }
            if (gB.empty()) gB = db; else gB = gB + db;
            break;
        }
        case GraphOpType::Add: {
            auto& g0 = nodes_.at(n.inputs[0]).grad;
            auto& g1 = nodes_.at(n.inputs[1]).grad;
            if (g0.empty()) g0 = n.grad; else g0 = g0 + n.grad;
            if (g1.empty()) g1 = n.grad; else g1 = g1 + n.grad;
            break;
        }
        case GraphOpType::ReLU: {
            const auto& X = nodes_.at(n.inputs[0]).value;
            auto& gX = nodes_.at(n.inputs[0]).grad;
            Matrix<double> dX(X.rows(), X.cols());
            for (size_t i = 0; i < X.size(); i++) {
                dX.at(i) = X.at(i) > 0.0 ? n.grad.at(i) : 0.0;
            }
            if (gX.empty()) gX = dX; else gX = gX + dX;
            break;
        }
        case GraphOpType::FusedLinearReLU: {
            const auto& X = nodes_.at(n.inputs[0]).value;
            auto& Wnode = nodes_.at(n.inputs[1]);
            auto& Bnode = nodes_.at(n.inputs[2]);
            Matrix<double> W = Wnode.op == GraphOpType::Parameter ? param_as_compute(Wnode) : Wnode.value;
            auto fg = fused_linear_relu_backward(n.grad, X, W, n.weight);
            auto& gX = nodes_.at(n.inputs[0]).grad;
            if (gX.empty()) gX = fg.grad_X; else gX = gX + fg.grad_X;
            Wnode.grad_weight = Wnode.grad_weight.empty() ? fg.grad_W : Wnode.grad_weight + fg.grad_W;
            Bnode.grad_weight = Bnode.grad_weight.empty() ? fg.grad_b : Bnode.grad_weight + fg.grad_b;
            break;
        }
        default:
            break;
    }
}

std::vector<NodeId> ComputationGraph::topo_order(NodeId output_id) const {
    std::vector<NodeId> order;
    std::unordered_set<NodeId> visited;

    std::function<void(NodeId)> dfs = [&](NodeId id) {
        if (visited.count(id)) return;
        visited.insert(id);
        for (NodeId in : nodes_.at(id).inputs) {
            dfs(in);
        }
        order.push_back(id);
    };

    dfs(output_id);
    return order;
}

Matrix<double> ComputationGraph::forward(NodeId output_id) {
    if (device_.is_cuda() && !Device::cuda_available()) {
        throw std::runtime_error("CUDA device requested but not available");
    }

    auto order = topo_order(output_id);
    for (NodeId id : order) {
        forward_node(nodes_.at(id));
    }
    return nodes_.at(output_id).value;
}

void ComputationGraph::backward(NodeId output_id, const Matrix<double>& grad_out) {
    auto order = topo_order(output_id);
    if (!grad_out.empty()) {
        nodes_.at(output_id).grad = grad_out;
    } else {
        nodes_.at(output_id).grad = Matrix<double>(nodes_.at(output_id).value.rows(),
                                                   nodes_.at(output_id).value.cols(), 1.0);
    }

    for (auto it = order.rbegin(); it != order.rend(); ++it) {
        backward_node(nodes_.at(*it));
    }
}

void ComputationGraph::zero_grad() {
    for (auto& n : nodes_) {
        n.grad = Matrix<double>();
        n.grad_weight = Matrix<double>();
        n.grad_bias = Matrix<double>();
    }
}

const Matrix<double>& ComputationGraph::value(NodeId id) const {
    return nodes_.at(id).value;
}

// ============================================================================
// GraphTrainer
// ============================================================================

NodeId GraphTrainer::build_mlp(const std::vector<size_t>& layers,
                               const std::vector<std::string>& activations) {
    if (layers.size() < 2) {
        throw std::runtime_error("build_mlp requires at least 2 layer sizes");
    }

    input_id_ = graph_.add_input();
    param_ids_.clear();

    NodeId current = input_id_;
    for (size_t i = 0; i + 1 < layers.size(); i++) {
        NodeId W = graph_.add_parameter(layers[i], layers[i + 1], InitType::HE);
        NodeId b = graph_.add_parameter(1, layers[i + 1], InitType::HE);
        graph_.mutable_node(b).weight.fill(0.0);
        param_ids_.push_back(W);
        param_ids_.push_back(b);

        const bool is_last = (i + 1 == layers.size() - 1);
        std::string act = (i < activations.size()) ? activations[i] : (is_last ? "linear" : "relu");
        const bool use_fused = !is_last && (act == "relu" || act == "ReLU");

        if (use_fused) {
            current = graph_.add_fused_linear_relu(current, W, b);
        } else {
            current = graph_.add_matmul(current, W);
            current = graph_.add_bias_add(current, b);
            if (!is_last && (act == "relu" || act == "ReLU")) {
                current = graph_.add_relu(current);
            }
        }
    }
    return current;
}

double GraphTrainer::train_step(const Matrix<double>& X, const Matrix<double>& y,
                                LossFunction& loss,
                                Optimizer& optimizer,
                                NodeId output_id,
<<<<<<< HEAD
                                const DistributedContext* dist) {
=======
                                const DistributedContext* dist,
                                int step) {
>>>>>>> v3.0
    graph_.bind_input(input_id_, X);
    Matrix<double> pred = graph_.forward(output_id);
    double loss_val = loss.forward(pred, y);
    Matrix<double> grad = loss.backward(pred, y);

    graph_.zero_grad();
    graph_.backward(output_id, grad);

    if (dist && dist->is_distributed()) {
<<<<<<< HEAD
        std::vector<Matrix<double>*> grads;
        for (NodeId pid : param_ids_) {
            auto& n = graph_.mutable_node(pid);
            if (!n.grad_weight.empty()) grads.push_back(&n.grad_weight);
        }
        allreduce_mean(grads, *dist);
=======
        int pid_idx = 0;
        for (NodeId pid : param_ids_) {
            auto& n = graph_.mutable_node(pid);
            if (!n.grad_weight.empty()) {
                allreduce_mean_collective(n.grad_weight, *dist, step, pid_idx++);
            }
        }
>>>>>>> v3.0
    }

    int t = 1;
    for (NodeId pid : param_ids_) {
        auto& n = graph_.mutable_node(pid);
        if (!n.grad_weight.empty()) {
            optimizer.update(n.weight, n.grad_weight, pid, t);
            if (graph_.mixed_precision()) {
                n.mp.fp16_cache = matrix_to_fp16(n.weight);
            }
        }
    }

    return loss_val;
}

double GraphTrainer::fit(const Matrix<double>& X, const Matrix<double>& y,
                         NodeId output_id,
                         LossFunction& loss,
                         Optimizer& optimizer,
                         int epochs,
                         int batch_size,
                         double validation_split,
                         int patience,
                         EpochCallback on_epoch,
                         const DistributedContext* dist) {
    const size_t n = X.rows();
    const size_t val_n = static_cast<size_t>(n * validation_split);
    const size_t train_n = n - val_n;

    double best_val = 1e300;
    int stale = 0;
    double last_train = 0.0;
    double last_val = 0.0;

<<<<<<< HEAD
=======
    int global_step = 0;
>>>>>>> v3.0
    for (int epoch = 0; epoch < epochs; epoch++) {
        double total_loss = 0.0;
        int batches = 0;
        const int bs = (batch_size <= 0) ? static_cast<int>(train_n) : batch_size;

        for (size_t start = 0; start < train_n; start += static_cast<size_t>(bs)) {
            size_t end = std::min(start + static_cast<size_t>(bs), train_n);
            size_t count = end - start;
            double step_loss = train_step(X.row_slice(start, count), y.row_slice(start, count),
<<<<<<< HEAD
                                          loss, optimizer, output_id, dist);
=======
                                          loss, optimizer, output_id, dist, global_step++);
>>>>>>> v3.0
            total_loss += step_loss;
            batches++;
        }
        last_train = total_loss / std::max(batches, 1);

        bool has_val = val_n > 0;
        if (has_val) {
            graph_.bind_input(input_id_, X.row_slice(train_n, val_n));
            Matrix<double> pred = graph_.forward(output_id);
            last_val = loss.forward(pred, y.row_slice(train_n, val_n));
        } else {
            last_val = last_train;
        }

        if (on_epoch) {
            on_epoch(epoch + 1, last_train, last_val, has_val);
        }

        if (patience > 0 && has_val) {
            if (last_val < best_val) {
                best_val = last_val;
                stale = 0;
            } else {
                stale++;
                if (stale >= patience) break;
            }
        }
    }

    return val_n > 0 ? last_val : last_train;
}

bool GraphTrainer::save_weights(const std::string& prefix) const {
    namespace fs = std::filesystem;
    std::error_code ec;
    fs::create_directories(prefix, ec);

    for (size_t i = 0; i < param_ids_.size(); i++) {
        const auto& w = graph_.node(param_ids_[i]).weight;
        std::string path = prefix + "/param_" + std::to_string(i) + ".bin";
        std::ofstream f(path, std::ios::binary);
        if (!f) return false;
        uint64_t rows = w.rows();
        uint64_t cols = w.cols();
        f.write(reinterpret_cast<const char*>(&rows), sizeof(rows));
        f.write(reinterpret_cast<const char*>(&cols), sizeof(cols));
        f.write(reinterpret_cast<const char*>(w.data()),
                static_cast<std::streamsize>(w.size() * sizeof(double)));
    }
    return true;
}

} // namespace cyberhex

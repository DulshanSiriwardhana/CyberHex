#ifndef CYBERHEX_GRAPH_H
#define CYBERHEX_GRAPH_H

#include "matrix.h"
#include "device.h"
#include "precision.h"
#include "layer.h"
#include "distributed.h"
#include <cstddef>
#include <functional>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

namespace cyberhex {

using NodeId = size_t;
static constexpr NodeId kInvalidNode = static_cast<NodeId>(-1);

enum class GraphOpType {
    Input,
    Parameter,
    MatMul,
    Add,
    BiasAdd,
    ReLU,
    FusedLinearReLU,  // X·W + b → ReLU (operator fusion)
    Identity
};

struct GraphNode {
    GraphOpType op = GraphOpType::Identity;
    std::vector<NodeId> inputs;
    Matrix<double> value;
    Matrix<double> grad;
    bool requires_grad = true;

    // Parameter / fused op storage
    Matrix<double> weight;
    Matrix<double> bias;
    Matrix<double> grad_weight;
    Matrix<double> grad_bias;
    MixedPrecisionState mp;
};

/**
 * Static computational graph with reverse-mode automatic differentiation.
 * Coexists with imperative Model — use for research and fused execution.
 */
class ComputationGraph {
public:
    NodeId add_input();
    NodeId add_parameter(size_t rows, size_t cols, InitType init = InitType::HE);
    NodeId add_matmul(NodeId a, NodeId b);
    NodeId add_bias_add(NodeId x, NodeId bias_param);
    NodeId add_add(NodeId a, NodeId b);
    NodeId add_relu(NodeId x);
    /** Fused: ReLU(X·W + b). weight_param: (in, out), bias_param: (1, out) */
    NodeId add_fused_linear_relu(NodeId input, NodeId weight_param, NodeId bias_param);

    void bind_input(NodeId id, const Matrix<double>& value);
    Matrix<double> forward(NodeId output_id);
    void backward(NodeId output_id, const Matrix<double>& grad_out = Matrix<double>());

    void zero_grad();
    const Matrix<double>& value(NodeId id) const;
    const GraphNode& node(NodeId id) const { return nodes_.at(id); }
    GraphNode& mutable_node(NodeId id) { return nodes_.at(id); }

    void set_device(Device device) { device_ = device; }
    void set_mixed_precision(bool enabled) { mixed_precision_ = enabled; }
    bool mixed_precision() const { return mixed_precision_; }

    size_t num_nodes() const { return nodes_.size(); }

    /** Topological order from inputs to output (cached). */
    std::vector<NodeId> topo_order(NodeId output_id) const;

private:
    std::vector<GraphNode> nodes_;
    Device device_ = Device::cpu();
    bool mixed_precision_ = false;

    void forward_node(GraphNode& n);
    void backward_node(GraphNode& n);
    Matrix<double> param_as_compute(const GraphNode& p) const;
};

/**
 * High-level trainer: build graph, compile loss, run Adam on Parameter nodes.
 */
class GraphTrainer {
public:
    void set_device(Device d) { graph_.set_device(d); }
    void set_mixed_precision(bool on) { graph_.set_mixed_precision(on); }

    NodeId build_mlp(const std::vector<size_t>& layers,
                     const std::vector<std::string>& activations = {});

    double train_step(const Matrix<double>& X, const Matrix<double>& y,
                      LossFunction& loss,
                      Optimizer& optimizer,
                      NodeId output_id,
                      const DistributedContext* dist = nullptr,
                      int step = 0);

    using EpochCallback = std::function<void(int epoch, double train_loss, double val_loss, bool has_val)>;

    /** Full training loop with validation split and optional early stopping. */
    double fit(const Matrix<double>& X, const Matrix<double>& y,
               NodeId output_id,
               LossFunction& loss,
               Optimizer& optimizer,
               int epochs,
               int batch_size,
               double validation_split,
               int patience,
               EpochCallback on_epoch = nullptr,
               const DistributedContext* dist = nullptr);

    bool save_weights(const std::string& prefix) const;

    ComputationGraph& graph() { return graph_; }
    const ComputationGraph& graph() const { return graph_; }

private:
    ComputationGraph graph_;
    std::vector<NodeId> param_ids_;
    NodeId input_id_ = kInvalidNode;
};

} // namespace cyberhex

#endif // CYBERHEX_GRAPH_H

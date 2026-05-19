#include "distributed.h"
#include <cstdlib>
#include <stdexcept>

namespace cyberhex {

DistributedContext DistributedContext::from_env() {
    DistributedContext ctx;
    if (const char* r = std::getenv("CYBERHEX_RANK")) {
        ctx.rank = std::atoi(r);
    }
    if (const char* w = std::getenv("CYBERHEX_WORLD_SIZE")) {
        ctx.world_size = std::atoi(w);
    }
    if (ctx.world_size < 1) ctx.world_size = 1;
    if (ctx.rank < 0 || ctx.rank >= ctx.world_size) {
        throw std::runtime_error("CYBERHEX_RANK out of range for CYBERHEX_WORLD_SIZE");
    }
    return ctx;
}

void allreduce_mean(Matrix<double>& grad, const DistributedContext& ctx) {
    if (!ctx.is_distributed() || grad.empty()) return;
    for (size_t i = 0; i < grad.size(); i++) {
        grad.at(i) /= static_cast<double>(ctx.world_size);
    }
}

void allreduce_mean(std::vector<Matrix<double>*>& grads, const DistributedContext& ctx) {
    for (Matrix<double>* g : grads) {
        if (g) allreduce_mean(*g, ctx);
    }
}

} // namespace cyberhex

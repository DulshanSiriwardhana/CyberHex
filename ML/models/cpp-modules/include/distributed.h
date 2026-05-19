#ifndef CYBERHEX_DISTRIBUTED_H
#define CYBERHEX_DISTRIBUTED_H

#include "matrix.h"
#include <cstddef>
#include <vector>

namespace cyberhex {

/**
 * Minimal distributed training context (cyberhex.dist.v1).
 * Ranks coordinate via CYBERHEX_RANK / CYBERHEX_WORLD_SIZE env vars.
 * Phase 4: in-process mean all-reduce; multi-node hooks for Phase 5.
 */
struct DistributedContext {
    int rank = 0;
    int world_size = 1;

    bool is_distributed() const { return world_size > 1; }
    bool is_root() const { return rank == 0; }

    static DistributedContext from_env();
};

/** In-place mean all-reduce of gradient matrix across ranks (no-op if world_size==1). */
void allreduce_mean(Matrix<double>& grad, const DistributedContext& ctx);

/** Mean all-reduce for a list of parameter gradients (graph / manual training). */
void allreduce_mean(std::vector<Matrix<double>*>& grads, const DistributedContext& ctx);

} // namespace cyberhex

#endif // CYBERHEX_DISTRIBUTED_H

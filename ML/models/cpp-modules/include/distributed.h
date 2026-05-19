#ifndef CYBERHEX_DISTRIBUTED_H
#define CYBERHEX_DISTRIBUTED_H

#include "matrix.h"
#include <cstddef>
<<<<<<< HEAD
<<<<<<< HEAD
=======
#include <string>
>>>>>>> v3.0
=======
#include <string>
>>>>>>> master
#include <vector>

namespace cyberhex {

<<<<<<< HEAD
<<<<<<< HEAD
/**
 * Minimal distributed training context (cyberhex.dist.v1).
 * Ranks coordinate via CYBERHEX_RANK / CYBERHEX_WORLD_SIZE env vars.
 * Phase 4: in-process mean all-reduce; multi-node hooks for Phase 5.
 */
=======
=======
>>>>>>> master
enum class CollectiveBackend {
    LOCAL,   /** grad /= world_size in-process */
    FILE,    /** CYBERHEX_DIST_DIR shared filesystem */
    MPI      /** CYBERHEX_MPI build + multi-process launch */
};

<<<<<<< HEAD
>>>>>>> v3.0
=======
>>>>>>> master
struct DistributedContext {
    int rank = 0;
    int world_size = 1;

    bool is_distributed() const { return world_size > 1; }
    bool is_root() const { return rank == 0; }

    static DistributedContext from_env();
};

<<<<<<< HEAD
<<<<<<< HEAD
/** In-place mean all-reduce of gradient matrix across ranks (no-op if world_size==1). */
void allreduce_mean(Matrix<double>& grad, const DistributedContext& ctx);

/** Mean all-reduce for a list of parameter gradients (graph / manual training). */
void allreduce_mean(std::vector<Matrix<double>*>& grads, const DistributedContext& ctx);
=======
CollectiveBackend detect_collective_backend();

=======
CollectiveBackend detect_collective_backend();

>>>>>>> master
/**
 * Mean all-reduce: sum gradients across ranks, divide by world_size.
 * @param step  Training step id (for file backend barrier paths)
 * @param param_id  Parameter bucket id (graph node id or dense index)
 */
void allreduce_mean_collective(Matrix<double>& grad,
                               const DistributedContext& ctx,
                               int step = 0,
                               int param_id = 0);

void allreduce_mean(std::vector<Matrix<double>*>& grads,
                    const DistributedContext& ctx,
                    int step = 0);
<<<<<<< HEAD
>>>>>>> v3.0
=======
>>>>>>> master

} // namespace cyberhex

#endif // CYBERHEX_DISTRIBUTED_H

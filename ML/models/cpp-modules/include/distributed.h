#ifndef CYBERHEX_DISTRIBUTED_H
#define CYBERHEX_DISTRIBUTED_H

#include "matrix.h"
#include <cstddef>
#include <string>
#include <vector>

namespace cyberhex {

enum class CollectiveBackend {
    LOCAL,
    FILE,
    MPI
};

struct DistributedContext {
    int rank = 0;
    int world_size = 1;

    bool is_distributed() const { return world_size > 1; }
    bool is_root() const { return rank == 0; }

    static DistributedContext from_env();
};

CollectiveBackend detect_collective_backend();

void allreduce_mean_collective(Matrix<double>& grad,
                               const DistributedContext& ctx,
                               int step = 0,
                               int param_id = 0);

void allreduce_mean(std::vector<Matrix<double>*>& grads,
                    const DistributedContext& ctx,
                    int step = 0);

} // namespace cyberhex

#endif // CYBERHEX_DISTRIBUTED_H

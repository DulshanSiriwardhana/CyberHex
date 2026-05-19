#include "distributed.h"
#include <cstdlib>
<<<<<<< HEAD
<<<<<<< HEAD
=======
#include <chrono>
#include <filesystem>
#include <fstream>
>>>>>>> master
#include <stdexcept>
#include <thread>

#ifdef CYBERHEX_MPI
#include <mpi.h>
#endif

namespace cyberhex {

<<<<<<< HEAD
=======
#include <chrono>
#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <thread>

#ifdef CYBERHEX_MPI
#include <mpi.h>
#endif

namespace cyberhex {

namespace fs = std::filesystem;

>>>>>>> v3.0
=======
namespace fs = std::filesystem;

>>>>>>> master
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

<<<<<<< HEAD
<<<<<<< HEAD
void allreduce_mean(Matrix<double>& grad, const DistributedContext& ctx) {
    if (!ctx.is_distributed() || grad.empty()) return;
=======
CollectiveBackend detect_collective_backend() {
#ifdef CYBERHEX_MPI
    int initialized = 0;
    MPI_Initialized(&initialized);
    if (initialized) return CollectiveBackend::MPI;
#endif
    if (const char* dir = std::getenv("CYBERHEX_DIST_DIR")) {
        if (dir[0] != '\0') return CollectiveBackend::FILE;
    }
    return CollectiveBackend::LOCAL;
}

namespace {

void local_scale(Matrix<double>& grad, int world_size) {
    if (grad.empty() || world_size <= 1) return;
>>>>>>> master
    for (size_t i = 0; i < grad.size(); i++) {
        grad.at(i) /= static_cast<double>(world_size);
    }
}

void write_grad_file(const fs::path& path, const Matrix<double>& grad) {
    std::ofstream f(path, std::ios::binary);
    uint64_t rows = grad.rows();
    uint64_t cols = grad.cols();
    f.write(reinterpret_cast<const char*>(&rows), sizeof(rows));
    f.write(reinterpret_cast<const char*>(&cols), sizeof(cols));
    f.write(reinterpret_cast<const char*>(grad.data()),
            static_cast<std::streamsize>(grad.size() * sizeof(double)));
}

Matrix<double> read_grad_file(const fs::path& path) {
    std::ifstream f(path, std::ios::binary);
    if (!f) throw std::runtime_error("Cannot read grad file: " + path.string());
    uint64_t rows = 0, cols = 0;
    f.read(reinterpret_cast<char*>(&rows), sizeof(rows));
    f.read(reinterpret_cast<char*>(&cols), sizeof(cols));
    Matrix<double> m(static_cast<size_t>(rows), static_cast<size_t>(cols));
    f.read(reinterpret_cast<char*>(m.data()),
            static_cast<std::streamsize>(m.size() * sizeof(double)));
    return m;
}

void file_allreduce_mean(Matrix<double>& grad, const DistributedContext& ctx,
                         int step, int param_id) {
    const char* root = std::getenv("CYBERHEX_DIST_DIR");
    if (!root || !*root) {
        local_scale(grad, ctx.world_size);
        return;
    }

    fs::path bucket = fs::path(root) / ("step_" + std::to_string(step)) /
                       ("param_" + std::to_string(param_id));
    fs::create_directories(bucket);

    fs::path my_file = bucket / ("rank_" + std::to_string(ctx.rank) + ".bin");
    write_grad_file(my_file, grad);

    const auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(60);
    while (std::chrono::steady_clock::now() < deadline) {
        int found = 0;
        for (int r = 0; r < ctx.world_size; r++) {
            if (fs::exists(bucket / ("rank_" + std::to_string(r) + ".bin"))) {
                found++;
            }
        }
        if (found >= ctx.world_size) break;
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }

    Matrix<double> sum;
    bool first = true;
    for (int r = 0; r < ctx.world_size; r++) {
        fs::path p = bucket / ("rank_" + std::to_string(r) + ".bin");
        if (!fs::exists(p)) {
            throw std::runtime_error("File allreduce timeout: missing " + p.string());
        }
        Matrix<double> part = read_grad_file(p);
        if (first) {
            sum = part;
            first = false;
        } else {
            sum = sum + part;
        }
    }

    for (size_t i = 0; i < sum.size(); i++) {
        sum.at(i) /= static_cast<double>(ctx.world_size);
    }
    grad = std::move(sum);
}

#ifdef CYBERHEX_MPI
void mpi_allreduce_mean(Matrix<double>& grad, const DistributedContext& ctx) {
    if (grad.empty()) return;
    MPI_Allreduce(MPI_IN_PLACE, grad.data(), static_cast<int>(grad.size()),
                  MPI_DOUBLE, MPI_SUM, MPI_COMM_WORLD);
    for (size_t i = 0; i < grad.size(); i++) {
        grad.at(i) /= static_cast<double>(ctx.world_size);
    }
    (void)ctx;
}
#endif

} // namespace

void allreduce_mean_collective(Matrix<double>& grad,
                               const DistributedContext& ctx,
                               int step,
                               int param_id) {
    if (!ctx.is_distributed() || grad.empty()) return;

    switch (detect_collective_backend()) {
#ifdef CYBERHEX_MPI
        case CollectiveBackend::MPI:
            mpi_allreduce_mean(grad, ctx);
            return;
#endif
        case CollectiveBackend::FILE:
            file_allreduce_mean(grad, ctx, step, param_id);
            return;
        case CollectiveBackend::LOCAL:
        default:
            local_scale(grad, ctx.world_size);
            return;
    }
}

void allreduce_mean(std::vector<Matrix<double>*>& grads,
                    const DistributedContext& ctx,
                    int step) {
    int pid = 0;
    for (Matrix<double>* g : grads) {
<<<<<<< HEAD
        if (g) allreduce_mean(*g, ctx);
=======
CollectiveBackend detect_collective_backend() {
#ifdef CYBERHEX_MPI
    int initialized = 0;
    MPI_Initialized(&initialized);
    if (initialized) return CollectiveBackend::MPI;
#endif
    if (const char* dir = std::getenv("CYBERHEX_DIST_DIR")) {
        if (dir[0] != '\0') return CollectiveBackend::FILE;
    }
    return CollectiveBackend::LOCAL;
}

namespace {

void local_scale(Matrix<double>& grad, int world_size) {
    if (grad.empty() || world_size <= 1) return;
    for (size_t i = 0; i < grad.size(); i++) {
        grad.at(i) /= static_cast<double>(world_size);
    }
}

void write_grad_file(const fs::path& path, const Matrix<double>& grad) {
    std::ofstream f(path, std::ios::binary);
    uint64_t rows = grad.rows();
    uint64_t cols = grad.cols();
    f.write(reinterpret_cast<const char*>(&rows), sizeof(rows));
    f.write(reinterpret_cast<const char*>(&cols), sizeof(cols));
    f.write(reinterpret_cast<const char*>(grad.data()),
            static_cast<std::streamsize>(grad.size() * sizeof(double)));
}

Matrix<double> read_grad_file(const fs::path& path) {
    std::ifstream f(path, std::ios::binary);
    if (!f) throw std::runtime_error("Cannot read grad file: " + path.string());
    uint64_t rows = 0, cols = 0;
    f.read(reinterpret_cast<char*>(&rows), sizeof(rows));
    f.read(reinterpret_cast<char*>(&cols), sizeof(cols));
    Matrix<double> m(static_cast<size_t>(rows), static_cast<size_t>(cols));
    f.read(reinterpret_cast<char*>(m.data()),
            static_cast<std::streamsize>(m.size() * sizeof(double)));
    return m;
}

void file_allreduce_mean(Matrix<double>& grad, const DistributedContext& ctx,
                         int step, int param_id) {
    const char* root = std::getenv("CYBERHEX_DIST_DIR");
    if (!root || !*root) {
        local_scale(grad, ctx.world_size);
        return;
    }

    fs::path bucket = fs::path(root) / ("step_" + std::to_string(step)) /
                       ("param_" + std::to_string(param_id));
    fs::create_directories(bucket);

    fs::path my_file = bucket / ("rank_" + std::to_string(ctx.rank) + ".bin");
    write_grad_file(my_file, grad);

    const auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(60);
    while (std::chrono::steady_clock::now() < deadline) {
        int found = 0;
        for (int r = 0; r < ctx.world_size; r++) {
            if (fs::exists(bucket / ("rank_" + std::to_string(r) + ".bin"))) {
                found++;
            }
        }
        if (found >= ctx.world_size) break;
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }

    Matrix<double> sum;
    bool first = true;
    for (int r = 0; r < ctx.world_size; r++) {
        fs::path p = bucket / ("rank_" + std::to_string(r) + ".bin");
        if (!fs::exists(p)) {
            throw std::runtime_error("File allreduce timeout: missing " + p.string());
        }
        Matrix<double> part = read_grad_file(p);
        if (first) {
            sum = part;
            first = false;
        } else {
            sum = sum + part;
        }
    }

    for (size_t i = 0; i < sum.size(); i++) {
        sum.at(i) /= static_cast<double>(ctx.world_size);
    }
    grad = std::move(sum);
}

#ifdef CYBERHEX_MPI
void mpi_allreduce_mean(Matrix<double>& grad, const DistributedContext& ctx) {
    if (grad.empty()) return;
    MPI_Allreduce(MPI_IN_PLACE, grad.data(), static_cast<int>(grad.size()),
                  MPI_DOUBLE, MPI_SUM, MPI_COMM_WORLD);
    for (size_t i = 0; i < grad.size(); i++) {
        grad.at(i) /= static_cast<double>(ctx.world_size);
    }
    (void)ctx;
}
#endif

} // namespace

void allreduce_mean_collective(Matrix<double>& grad,
                               const DistributedContext& ctx,
                               int step,
                               int param_id) {
    if (!ctx.is_distributed() || grad.empty()) return;

    switch (detect_collective_backend()) {
#ifdef CYBERHEX_MPI
        case CollectiveBackend::MPI:
            mpi_allreduce_mean(grad, ctx);
            return;
#endif
        case CollectiveBackend::FILE:
            file_allreduce_mean(grad, ctx, step, param_id);
            return;
        case CollectiveBackend::LOCAL:
        default:
            local_scale(grad, ctx.world_size);
            return;
    }
}

void allreduce_mean(std::vector<Matrix<double>*>& grads,
                    const DistributedContext& ctx,
                    int step) {
    int pid = 0;
    for (Matrix<double>* g : grads) {
        if (g) allreduce_mean_collective(*g, ctx, step, pid++);
>>>>>>> v3.0
=======
        if (g) allreduce_mean_collective(*g, ctx, step, pid++);
>>>>>>> master
    }
}

} // namespace cyberhex

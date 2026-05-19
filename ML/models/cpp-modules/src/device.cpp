#include "device.h"
#include <cctype>
#include <cstdlib>
#include <string>

namespace cyberhex {

namespace {
Device g_device = Device::cpu();
}

Device& default_device() { return g_device; }

void set_default_device(DeviceType type) {
    g_device = Device(type);
}

#ifdef CYBERHEX_CUDA
extern "C" bool cyberhex_cuda_runtime_available();
#endif

bool Device::cuda_available() {
#ifdef CYBERHEX_CUDA
    return cyberhex_cuda_runtime_available();
#else
    return false;
#endif
}

namespace {
DeviceType parse_device_type(const char* raw) {
    if (!raw) return DeviceType::CPU;
    std::string s(raw);
    for (char& c : s) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    if (s == "cuda" || s == "gpu") return DeviceType::CUDA;
    return DeviceType::CPU;
}
} // namespace

void init_device_from_env() {
    if (const char* d = std::getenv("CYBERHEX_DEVICE")) {
        set_default_device(parse_device_type(d));
    }
}

std::string Device::name() const {
    switch (type_) {
        case DeviceType::CPU: return "cpu";
        case DeviceType::CUDA: return cuda_available() ? "cuda" : "cuda(unavailable)";
    }
    return "unknown";
}

} // namespace cyberhex

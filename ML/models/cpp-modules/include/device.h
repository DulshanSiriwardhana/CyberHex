#ifndef CYBERHEX_DEVICE_H
#define CYBERHEX_DEVICE_H

#include <string>

namespace cyberhex {

enum class DeviceType {
    CPU,
    CUDA  // reserved — Phase 3 stub; kernels land in Phase 4
};

class Device {
public:
    explicit Device(DeviceType type = DeviceType::CPU) : type_(type) {}

    DeviceType type() const { return type_; }
    bool is_cpu() const { return type_ == DeviceType::CPU; }
    bool is_cuda() const { return type_ == DeviceType::CUDA; }

    static Device cpu() { return Device(DeviceType::CPU); }
    static Device cuda() { return Device(DeviceType::CUDA); }

    /** True when built with CYBERHEX_CUDA and runtime init succeeds. */
    static bool cuda_available();

    std::string name() const;

private:
    DeviceType type_;
};

/** Global default device for graph execution (thread-local friendly later). */
Device& default_device();
void set_default_device(DeviceType type);

/** Apply CYBERHEX_DEVICE env (cpu|cuda) at process start. */
void init_device_from_env();

} // namespace cyberhex

#endif // CYBERHEX_DEVICE_H

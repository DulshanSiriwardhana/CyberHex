#ifndef CYBERHEX_DEVICE_H
#define CYBERHEX_DEVICE_H

#include <string>

namespace cyberhex {

enum class DeviceType {
    CPU,
    CUDA
};

class Device {
public:
    explicit Device(DeviceType type = DeviceType::CPU) : type_(type) {}

    DeviceType type() const { return type_; }
    bool is_cpu() const { return type_ == DeviceType::CPU; }
    bool is_cuda() const { return type_ == DeviceType::CUDA; }

    static Device cpu() { return Device(DeviceType::CPU); }
    static Device cuda() { return Device(DeviceType::CUDA); }

    static bool cuda_available();

    std::string name() const;

private:
    DeviceType type_;
};

Device& default_device();
void set_default_device(DeviceType type);

void init_device_from_env();

}

#endif

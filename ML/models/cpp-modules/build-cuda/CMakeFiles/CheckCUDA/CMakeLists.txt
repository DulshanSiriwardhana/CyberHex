cmake_minimum_required(VERSION 3.30.3)
set(CMAKE_MODULE_PATH "/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules/build-cuda/_deps/catch2-src/extras")
project(CheckCUDA CUDA)
file(WRITE "${CMAKE_CURRENT_BINARY_DIR}/result.cmake"
  "set(CMAKE_CUDA_COMPILER \"${CMAKE_CUDA_COMPILER}\")\n"
  "set(CMAKE_CUDA_HOST_COMPILER \"${CMAKE_CUDA_HOST_COMPILER}\")\n"
  )
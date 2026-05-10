cmake_minimum_required(VERSION 3.10)
project(CyberHexML VERSION 1.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Enable OpenMP
find_package(OpenMP REQUIRED)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")

include_directories(include)

file(GLOB SOURCES "src/*.cpp")

# Shared Library
add_library(cyberhex SHARED ${SOURCES})
target_link_libraries(cyberhex PRIVATE OpenMP::OpenMP_CXX)

# Set output path or install rules
set_target_properties(cyberhex PROPERTIES VERSION ${PROJECT_VERSION} SOVERSION 1)

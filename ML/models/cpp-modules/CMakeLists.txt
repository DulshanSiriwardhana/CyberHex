cmake_minimum_required(VERSION 3.10)
project(CyberHex VERSION 2.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Build flags
# Base flags for all build types (warnings only; optimizations per-config)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wpedantic -Wshadow -Wno-unused-parameter")

# Release flags: aggressive optimization, keep denormals-flush for performance
# Note: -ffast-math disables NaN checking — only enable if you don't need IEEE compliance
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 -march=native -ffast-math -DNDEBUG")

# Debug flags: no optimization, frame pointers for profiling, debug symbols
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 -g3 -fno-omit-frame-pointer -DDEBUG -DCYBERHEX_DEBUG")
# RelWithDebInfo: optimized but with debug symbols for profiling
set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "${CMAKE_CXX_FLAGS_RELWITHDEBINFO} -O2 -march=native -g -DNDEBUG")

# Boost (optional - only for WebSocket server)
# Comment out if Boost not available, WebSocket will be disabled
option(USE_BOOST "Use Boost for WebSocket server" OFF)

if(USE_BOOST)
    set(Boost_INCLUDE_DIRS "/home/dulshan/boost_1_83_0")
    include_directories(${Boost_INCLUDE_DIRS})
    add_definitions(-DBOOST_BIND_GLOBAL_PLACEHOLDERS -DCYBERHEX_USE_BOOST)
endif()

# Optional CUDA matmul (off by default; CI uses CPU)
option(CYBERHEX_ENABLE_CUDA "Build with CYBERHEX_CUDA matmul dispatch" OFF)

# OpenMP
find_package(OpenMP)
if(OpenMP_CXX_FOUND)
    message(STATUS "OpenMP found - parallelism enabled")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
    add_definitions(-D_OPENMP)
else()
    message(WARNING "OpenMP NOT found - falling back to sequential execution")
endif()

# SIMD detection
include(CheckCXXCompilerFlag)
check_cxx_compiler_flag("-mavx2" COMPILER_HAS_AVX2)
if(COMPILER_HAS_AVX2)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -mavx2")
    message(STATUS "AVX2 enabled")
else()
    check_cxx_compiler_flag("-msse4.1" COMPILER_HAS_SSE41)
    if(COMPILER_HAS_SSE41)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -msse4.1")
        message(STATUS "SSE4.1 enabled")
    else()
        message(WARNING "No SIMD extensions found")
    endif()
endif()

include_directories(include)

# Catch2 for unit tests
include(FetchContent)
FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.4.0
)
FetchContent_MakeAvailable(Catch2)

# Source files
file(GLOB SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")
list(FILTER SOURCES EXCLUDE REGEX ".*/(main|tests|cyberhex_ml)\\.cpp$")

# Shared library
add_library(cyberhex SHARED ${SOURCES})
if(CYBERHEX_ENABLE_CUDA)
    target_sources(cyberhex PRIVATE src/cuda_matmul_stub.cpp)
    target_compile_definitions(cyberhex PRIVATE CYBERHEX_CUDA)
    message(STATUS "CYBERHEX_CUDA enabled (host stub matmul)")
endif()
if(OpenMP_CXX_FOUND)
    target_link_libraries(cyberhex PRIVATE OpenMP::OpenMP_CXX)
endif()
if(USE_BOOST)
    target_link_libraries(cyberhex PRIVATE ${Boost_LIBRARIES} pthread)
endif()
target_link_libraries(cyberhex PRIVATE pthread)

# Version defines
target_compile_definitions(cyberhex PRIVATE
    CYBERHEX_VERSION_MAJOR=2
    CYBERHEX_VERSION_MINOR=0
    CYBERHEX_VERSION_PATCH=0
)

# Standalone executable (for experiments and development)
add_executable(app src/main.cpp)
target_link_libraries(app PRIVATE cyberhex)
if(OpenMP_CXX_FOUND)
    target_link_libraries(app PRIVATE OpenMP::OpenMP_CXX)
endif()
target_link_libraries(app PRIVATE pthread)

# Micro-benchmarks (JSON line to stdout)
add_executable(cyberhex_bench src/bench_main.cpp)
target_link_libraries(cyberhex_bench PRIVATE cyberhex pthread)

# Production training CLI (backend ML_ENGINE=cpp)
add_executable(cyberhex_ml src/cyberhex_ml.cpp)
target_link_libraries(cyberhex_ml PRIVATE cyberhex)
if(OpenMP_CXX_FOUND)
    target_link_libraries(cyberhex_ml PRIVATE OpenMP::OpenMP_CXX)
endif()
target_link_libraries(cyberhex_ml PRIVATE pthread)

# Unit tests
add_executable(unit_tests src/tests.cpp ${SOURCES})
target_include_directories(unit_tests PRIVATE ${catch2_SOURCE_DIR}/src)
if(CYBERHEX_ENABLE_CUDA)
    target_sources(unit_tests PRIVATE src/cuda_matmul_stub.cpp)
    target_compile_definitions(unit_tests PRIVATE CYBERHEX_CUDA)
endif()
if(OpenMP_CXX_FOUND)
    target_link_libraries(unit_tests PRIVATE OpenMP::OpenMP_CXX)
endif()
target_link_libraries(unit_tests PRIVATE Catch2::Catch2WithMain pthread)

# CTest
enable_testing()
add_test(NAME cyberhex_unit_tests COMMAND unit_tests)
set_tests_properties(cyberhex_unit_tests PROPERTIES LABELS "cpp")

# Install rules
install(TARGETS cyberhex
    LIBRARY DESTINATION lib
    PUBLIC_HEADER DESTINATION include
)
cmake_minimum_required(VERSION 3.10)
project(CyberHex VERSION 2.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wpedantic -Wshadow -Wno-unused-parameter")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 -march=native -ffast-math -DNDEBUG")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 -g3 -fno-omit-frame-pointer -DDEBUG -DCYBERHEX_DEBUG")
set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "${CMAKE_CXX_FLAGS_RELWITHDEBINFO} -O2 -march=native -g -DNDEBUG")

option(USE_BOOST "Use Boost for WebSocket server" OFF)
option(CYBERHEX_ENABLE_CUDA "Build CUDA matmul kernels" OFF)
option(CYBERHEX_USE_MPI "Link MPI for distributed all-reduce" OFF)

if(USE_BOOST)
    set(Boost_INCLUDE_DIRS "/home/dulshan/boost_1_83_0")
    include_directories(${Boost_INCLUDE_DIRS})
    add_definitions(-DBOOST_BIND_GLOBAL_PLACEHOLDERS -DCYBERHEX_USE_BOOST)
endif()

<<<<<<< HEAD
# Optional CUDA matmul (off by default; CI uses CPU)
option(CYBERHEX_ENABLE_CUDA "Build with CYBERHEX_CUDA matmul dispatch" OFF)

# OpenMP
=======
>>>>>>> v3.0
find_package(OpenMP)
if(OpenMP_CXX_FOUND)
    message(STATUS "OpenMP found - parallelism enabled")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
    add_definitions(-D_OPENMP)
else()
    message(WARNING "OpenMP NOT found - falling back to sequential execution")
endif()

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
    endif()
endif()

include_directories(include)

include(FetchContent)
FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.4.0
)
FetchContent_MakeAvailable(Catch2)

file(GLOB SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")
<<<<<<< HEAD
list(FILTER SOURCES EXCLUDE REGEX ".*/(main|tests|cyberhex_ml)\\.cpp$")
=======
list(FILTER SOURCES EXCLUDE REGEX ".*/(main|tests|cyberhex_ml|cyberhex_infer|cyberhex_export|bench_main|cuda_matmul_stub)\\.cpp$")
>>>>>>> v3.0

add_library(cyberhex SHARED ${SOURCES})
<<<<<<< HEAD
if(CYBERHEX_ENABLE_CUDA)
    target_sources(cyberhex PRIVATE src/cuda_matmul_stub.cpp)
    target_compile_definitions(cyberhex PRIVATE CYBERHEX_CUDA)
    message(STATUS "CYBERHEX_CUDA enabled (host stub matmul)")
endif()
=======

if(CYBERHEX_ENABLE_CUDA)
    include(CheckLanguage)
    check_language(CUDA)
    if(CMAKE_CUDA_COMPILER)
        enable_language(CUDA)
        target_sources(cyberhex PRIVATE cuda/matmul.cu)
        set_target_properties(cyberhex PROPERTIES CUDA_SEPARABLE_COMPILATION ON)
        message(STATUS "CUDA matmul kernel enabled")
    else()
        target_sources(cyberhex PRIVATE src/cuda_matmul_stub.cpp)
        message(STATUS "CUDA compiler not found — using host stub matmul")
    endif()
    target_compile_definitions(cyberhex PUBLIC CYBERHEX_CUDA)
endif()

if(CYBERHEX_USE_MPI)
    find_package(MPI REQUIRED)
    target_link_libraries(cyberhex PUBLIC MPI::MPI_CXX)
    target_compile_definitions(cyberhex PUBLIC CYBERHEX_MPI)
    message(STATUS "MPI distributed collectives enabled")
endif()

>>>>>>> v3.0
if(OpenMP_CXX_FOUND)
    target_link_libraries(cyberhex PRIVATE OpenMP::OpenMP_CXX)
endif()
if(USE_BOOST)
    target_link_libraries(cyberhex PRIVATE ${Boost_LIBRARIES} pthread)
endif()
target_link_libraries(cyberhex PRIVATE pthread)

target_compile_definitions(cyberhex PRIVATE
    CYBERHEX_VERSION_MAJOR=2
    CYBERHEX_VERSION_MINOR=0
    CYBERHEX_VERSION_PATCH=0
)

<<<<<<< HEAD
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
=======
macro(link_cyberhex_target target)
    target_link_libraries(${target} PRIVATE cyberhex pthread)
    if(OpenMP_CXX_FOUND)
        target_link_libraries(${target} PRIVATE OpenMP::OpenMP_CXX)
    endif()
endmacro()

add_executable(app src/main.cpp)
link_cyberhex_target(app)

add_executable(cyberhex_bench src/bench_main.cpp)
link_cyberhex_target(cyberhex_bench)

add_executable(cyberhex_ml src/cyberhex_ml.cpp)
link_cyberhex_target(cyberhex_ml)

add_executable(cyberhex_infer src/cyberhex_infer.cpp)
link_cyberhex_target(cyberhex_infer)

add_executable(cyberhex_export src/cyberhex_export.cpp)
link_cyberhex_target(cyberhex_export)

add_executable(unit_tests src/tests.cpp ${SOURCES})
target_include_directories(unit_tests PRIVATE ${catch2_SOURCE_DIR}/src)
if(CYBERHEX_ENABLE_CUDA)
    if(CMAKE_CUDA_COMPILER)
        target_sources(unit_tests PRIVATE cuda/matmul.cu)
    else()
        target_sources(unit_tests PRIVATE src/cuda_matmul_stub.cpp)
    endif()
    target_compile_definitions(unit_tests PRIVATE CYBERHEX_CUDA)
endif()
if(CYBERHEX_USE_MPI)
    target_link_libraries(unit_tests PRIVATE MPI::MPI_CXX)
    target_compile_definitions(unit_tests PRIVATE CYBERHEX_MPI)
endif()
>>>>>>> v3.0
if(OpenMP_CXX_FOUND)
    target_link_libraries(unit_tests PRIVATE OpenMP::OpenMP_CXX)
endif()
target_link_libraries(unit_tests PRIVATE Catch2::Catch2WithMain pthread)

<<<<<<< HEAD
# CTest
=======
>>>>>>> v3.0
enable_testing()
add_test(NAME cyberhex_unit_tests COMMAND unit_tests)
set_tests_properties(cyberhex_unit_tests PROPERTIES LABELS "cpp")

<<<<<<< HEAD
# Install rules
install(TARGETS cyberhex
    LIBRARY DESTINATION lib
    PUBLIC_HEADER DESTINATION include
)
=======
install(TARGETS cyberhex LIBRARY DESTINATION lib)
>>>>>>> v3.0

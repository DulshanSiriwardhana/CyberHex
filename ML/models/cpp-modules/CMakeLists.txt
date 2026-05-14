cmake_minimum_required(VERSION 3.10)
project(CyberHex VERSION 2.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Build flags
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wno-unused-parameter -O3 -march=native -ffast-math")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 -g -DDEBUG")

# Boost (optional - only for WebSocket server)
# Comment out if Boost not available, WebSocket will be disabled
option(USE_BOOST "Use Boost for WebSocket server" OFF)

if(USE_BOOST)
    set(Boost_INCLUDE_DIRS "/home/dulshan/boost_1_83_0")
    include_directories(${Boost_INCLUDE_DIRS})
    add_definitions(-DBOOST_BIND_GLOBAL_PLACEHOLDERS -DCYBERHEX_USE_BOOST)
endif()

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
list(FILTER SOURCES EXCLUDE REGEX ".*/(main|tests)\\.cpp$")

# Shared library
add_library(cyberhex SHARED ${SOURCES})
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
add_executable(app src/main.cpp ${SOURCES})
if(OpenMP_CXX_FOUND)
    target_link_libraries(app PRIVATE OpenMP::OpenMP_CXX)
endif()
target_link_libraries(app PRIVATE pthread)

# Unit tests
add_executable(unit_tests src/tests.cpp ${SOURCES})
target_include_directories(unit_tests PRIVATE ${catch2_SOURCE_DIR}/src)
if(OpenMP_CXX_FOUND)
    target_link_libraries(unit_tests PRIVATE OpenMP::OpenMP_CXX)
endif()
target_link_libraries(unit_tests PRIVATE Catch2::Catch2WithMain pthread)

# Install rules
install(TARGETS cyberhex
    LIBRARY DESTINATION lib
    PUBLIC_HEADER DESTINATION include
)
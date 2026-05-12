cmake_minimum_required(VERSION 3.10)
project(CyberHexML VERSION 1.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Item 141: Build with full warning flags
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wno-unused-parameter")

set(BOOST_ROOT "/home/dulshan/boost_1_83_0")
set(Boost_NO_SYSTEM_PATHS ON)
set(Boost_LIBRARY_DIRS 
    "/home/dulshan/boost_1_83_0/bin.v2/libs/system/build/gcc-14/release/threading-multi/visibility-hidden"
    "/home/dulshan/boost_1_83_0/bin.v2/libs/thread/build/gcc-14/release/threading-multi/visibility-hidden"
)
link_directories(${Boost_LIBRARY_DIRS})
find_package(Boost REQUIRED COMPONENTS system thread)
include_directories(${Boost_INCLUDE_DIRS})

# Item 14/15: Enable OpenMP with graceful fallback
find_package(OpenMP)
if(OpenMP_CXX_FOUND)
    message(STATUS "OpenMP found - parallelism enabled")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
else()
    message(WARNING "OpenMP NOT found - falling back to sequential execution")
endif()

# Item 13/15: SIMD detection
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
        message(WARNING "No SIMD extensions found - optimized math disabled")
    endif()
endif()

include_directories(include)

# Item 111: Unit Tests with Catch2
include(FetchContent)
FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.4.0
)
FetchContent_MakeAvailable(Catch2)

file(GLOB SOURCES "src/*.cpp")

# Exclude main.cpp from library
list(REMOVE_ITEM SOURCES "src/main.cpp")

# Item 58: Shared Library (.so)
add_library(cyberhex SHARED ${SOURCES})

if(OpenMP_CXX_FOUND)
    target_link_libraries(cyberhex PRIVATE OpenMP::OpenMP_CXX)
endif()
target_link_libraries(cyberhex PRIVATE Boost::system Boost::thread)

# Unit Tests
add_executable(unit_tests src/main.cpp)
target_link_libraries(unit_tests PRIVATE cyberhex Catch2::Catch2WithMain Boost::system Boost::thread)

# Item 57: Standardized version & install rules
set_target_properties(cyberhex PROPERTIES
    VERSION ${PROJECT_VERSION}
    SOVERSION 1
    PUBLIC_HEADER "include/cyberhex_c_api.h"
)

# Version stamp in compiled headers (Item 135)
target_compile_definitions(cyberhex PRIVATE
    CYBERHEX_VERSION_MAJOR=1
    CYBERHEX_VERSION_MINOR=0
    CYBERHEX_VERSION_PATCH=0
)

# Standalone executable for development / training
list(FILTER SOURCES EXCLUDE REGEX ".*/cyberhex_c_api\\.cpp$")
add_executable(app main.cpp ${SOURCES})
if(OpenMP_CXX_FOUND)
    target_link_libraries(app PRIVATE OpenMP::OpenMP_CXX)
endif()
target_link_libraries(app PRIVATE Boost::system Boost::thread)

install(TARGETS cyberhex
    LIBRARY DESTINATION lib
    PUBLIC_HEADER DESTINATION include
)

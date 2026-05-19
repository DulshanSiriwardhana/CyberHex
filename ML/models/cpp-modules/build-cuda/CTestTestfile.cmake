# CMake generated Testfile for 
# Source directory: /home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules
# Build directory: /home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules/build-cuda
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test(cyberhex_unit_tests "/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules/build-cuda/unit_tests")
set_tests_properties(cyberhex_unit_tests PROPERTIES  LABELS "cpp" _BACKTRACE_TRIPLES "/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules/CMakeLists.txt;144;add_test;/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules/CMakeLists.txt;0;")
subdirs("_deps/catch2-build")

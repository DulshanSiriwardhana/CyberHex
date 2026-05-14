#!/bin/bash
# ============================================================================
# CyberHex Build Script
# ============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "  Building CyberHex ML Framework v2.0"
echo "========================================="

# Create build directory
BUILD_DIR="$PROJECT_ROOT/ML/models/cpp-modules/build"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# Configure with CMake
echo "[1/3] Configuring with CMake..."
cmake .. -DCMAKE_BUILD_TYPE=Release 2>&1

# Build
echo "[2/3] Building..."
make -j$(nproc) 2>&1

echo "[3/3] Build complete!"
echo ""
echo "Binaries:"
echo "  - Library:  $BUILD_DIR/libcyberhex.so"
echo "  - Tests:    $BUILD_DIR/unit_tests"
echo "  - Examples: $BUILD_DIR/app"
echo ""
echo "Run examples:  $BUILD_DIR/app"
echo "Run tests:     $BUILD_DIR/unit_tests"
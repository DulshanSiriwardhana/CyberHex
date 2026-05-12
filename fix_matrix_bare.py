import os
import re

src_dir = "/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules"

def process_file(filepath):
    # don't touch matrix.h and matrix.cpp
    if filepath.endswith("matrix.h") or filepath.endswith("matrix.cpp"):
        return
        
    with open(filepath, "r") as f:
        text = f.read()

    # We want to replace bare `Matrix` (not `Matrix<`) with `Matrix<double>`
    # We use a negative lookahead `(?!<)`
    text = re.sub(r"\bMatrix\b(?!<)", "Matrix<double>", text)
    
    with open(filepath, "w") as f:
        f.write(text)

for root, dirs, filenames in os.walk(src_dir):
    for f in filenames:
        if f.endswith(".cpp") or f.endswith(".h"):
            process_file(os.path.join(root, f))
print("Done")

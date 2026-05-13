import os
import re

src_dir = "/home/dulshan/CyberHex/CyberHex/ML/models/cpp-modules"

files = []
for root, dirs, filenames in os.walk(src_dir):
    for f in filenames:
        if f.endswith(".cpp") or f.endswith(".h"):
            files.append(os.path.join(root, f))


matrix_h_path = os.path.join(src_dir, "include/matrix.h")
with open(matrix_h_path, "r") as f:
    matrix_h = f.read()

matrix_h = matrix_h.replace("std::vector<std::vector<double>> matrix;", "std::vector<double> data;\n\n        inline double& operator()(size_t r, size_t c) {\n            return data[r * cols + c];\n        }\n\n        inline const double& operator()(size_t r, size_t c) const {\n            return data[r * cols + c];\n        }")

with open(matrix_h_path, "w") as f:
    f.write(matrix_h)


pat1 = re.compile(r"([a-zA-Z0-9_]+(?:\-\>[a-zA-Z0-9_]+)?(?:\.[a-zA-Z0-9_]+)?)\.matrix\[(.*?)\]\[(.*?)\]")
def repl1(m):
    obj = m.group(1)
    i = m.group(2)
    j = m.group(3)
    return f"{obj}({i}, {j})"



pat2 = re.compile(r"(?<!\.)matrix\[(.*?)\]\[(.*?)\]")
def repl2(m):
    return f"data[({m.group(1)}) * cols + ({m.group(2)})]"


for filepath in files:
    with open(filepath, "r") as f:
        content = f.read()
    
    
    if filepath.endswith("matrix.cpp"):
        content = content.replace("matrix(0, std::vector<double>(0, 0.0))", "data(0)")
        content = content.replace("matrix(r, std::vector<double>(c, val))", "data(r * c, val)")
        content = content.replace("matrix(other.matrix)", "data(other.data)")
        content = content.replace("matrix(std::move(other.matrix))", "data(std::move(other.data))")
        content = content.replace("matrix.swap(other.matrix)", "data.swap(other.data)")
        
        
        content = pat2.sub(repl2, content)
        
    
    content = pat1.sub(repl1, content)
    
    
    if filepath.endswith("model.cpp"):
        content = content.replace(
            "wf.write(reinterpret_cast<const char*>(W.matrix[i].data()), cols * sizeof(double));",
            "wf.write(reinterpret_cast<const char*>(&W(i, 0)), cols * sizeof(double));"
        )
        content = content.replace(
            "bf.write(reinterpret_cast<const char*>(B.matrix[i].data()), cols * sizeof(double));",
            "bf.write(reinterpret_cast<const char*>(&B(i, 0)), cols * sizeof(double));"
        )
        
        
        content = content.replace(
            "for (int i = 0; i < rows; i++) {\n                wf.write(reinterpret_cast<const char*>(&W(i, 0)), cols * sizeof(double));\n            }",
            "wf.write(reinterpret_cast<const char*>(W.data.data()), rows * cols * sizeof(double));"
        )
        content = content.replace(
            "for (int i = 0; i < rows; i++) {\n                bf.write(reinterpret_cast<const char*>(&B(i, 0)), cols * sizeof(double));\n            }",
            "bf.write(reinterpret_cast<const char*>(B.data.data()), rows * cols * sizeof(double));"
        )
        
    with open(filepath, "w") as f:
        f.write(content)

print("Done")

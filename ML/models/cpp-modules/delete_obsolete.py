import re

# delete obsolete vectors from matrix.h
with open("include/matrix.h", "r") as f:
    text = f.read()

text = re.sub(r"void removeRowColumn.*?\n", "", text)
text = re.sub(r"void replaceRow.*?\n", "", text)
text = re.sub(r"void replaceColumn.*?\n", "", text)
text = re.sub(r"double det.*?\n", "", text)
text = re.sub(r"std::vector<double> solve_AX_eq_B.*?\n", "", text)
text = re.sub(r"std::vector<std::vector<double>> multiply_matrices.*?\n", "", text)

with open("include/matrix.h", "w") as f:
    f.write(text)

# delete implementations from matrix.cpp
with open("src/matrix.cpp", "r") as f:
    cpp = f.read()

# using regex to remove everything from removeRowColumn down to the end of multiply_matrices
# wait, actually solve_AX_eq_B might still be used by MachineLearningAlgorithms.cpp
# let's grep for solve_AX_eq_B

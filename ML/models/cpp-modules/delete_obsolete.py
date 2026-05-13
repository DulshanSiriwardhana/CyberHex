import re


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


with open("src/matrix.cpp", "r") as f:
    cpp = f.read()





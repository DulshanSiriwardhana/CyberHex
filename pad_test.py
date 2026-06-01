import numpy as np

X = np.array([[1, 2]])
w = np.zeros((14, 32))

expected_dim = w.shape[0]
provided_dim = X.shape[1]

if provided_dim != expected_dim:
    if provided_dim < expected_dim:
        padded = np.zeros((X.shape[0], expected_dim))
        padded[:, :provided_dim] = X
        X = padded
    else:
        X = X[:, :expected_dim]
print(X.shape)

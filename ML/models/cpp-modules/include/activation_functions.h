#ifndef ACTIVATION_FUNCTIONS_H
#define ACTIVATION_FUNCTIONS_H

void full_linear_filter(double& value);
void natural_linear_filter(double& value);
void negative_linear_filter(double& value);
void full_sign_filter(double& value);
void inverse_square_normalize_filter(double& value);
void tanh_filter(double& value);
void leaky_relu_filter(double& value);
void softplus_filter(double& value);
#endif


#ifndef METRICS_H
#define METRICS_H

#include "matrix.h"
#include <cmath>
#include <stdexcept>


class Metric {
public:
    virtual double compute(const Matrix<double>& y_true, const Matrix<double>& y_pred) const = 0;
    virtual ~Metric() = default;
};


class Accuracy : public Metric {
public:
    double compute(const Matrix<double>& y_true, const Matrix<double>& y_pred) const override {
        if (y_true.rows != y_pred.rows || y_true.cols != y_pred.cols)
            throw DimensionMismatchException("Accuracy: shape mismatch");
        size_t correct = 0;
        for (size_t i = 0; i < y_true.rows; i++)
            for (size_t j = 0; j < y_true.cols; j++)
                correct += ((y_pred(i, j) > 0.5 ? 1.0 : 0.0) == y_true(i, j)) ? 1 : 0;
        return static_cast<double>(correct) / (y_true.rows * y_true.cols);
    }
};


class Precision : public Metric {
public:
    double compute(const Matrix<double>& y_true, const Matrix<double>& y_pred) const override {
        if (y_true.rows != y_pred.rows || y_true.cols != y_pred.cols)
            throw DimensionMismatchException("Precision: shape mismatch");
        double tp = 0.0, fp = 0.0;
        for (size_t i = 0; i < y_true.rows; i++) {
            for (size_t j = 0; j < y_true.cols; j++) {
                double pred = y_pred(i, j) > 0.5 ? 1.0 : 0.0;
                if (pred == 1.0 && y_true(i, j) == 1.0) tp++;
                if (pred == 1.0 && y_true(i, j) == 0.0) fp++;
            }
        }
        return (tp + fp) == 0.0 ? 0.0 : tp / (tp + fp);
    }
};


class Recall : public Metric {
public:
    double compute(const Matrix<double>& y_true, const Matrix<double>& y_pred) const override {
        if (y_true.rows != y_pred.rows || y_true.cols != y_pred.cols)
            throw DimensionMismatchException("Recall: shape mismatch");
        double tp = 0.0, fn = 0.0;
        for (size_t i = 0; i < y_true.rows; i++) {
            for (size_t j = 0; j < y_true.cols; j++) {
                double pred = y_pred(i, j) > 0.5 ? 1.0 : 0.0;
                if (pred == 1.0 && y_true(i, j) == 1.0) tp++;
                if (pred == 0.0 && y_true(i, j) == 1.0) fn++;
            }
        }
        return (tp + fn) == 0.0 ? 0.0 : tp / (tp + fn);
    }
};


class F1Score : public Metric {
public:
    double compute(const Matrix<double>& y_true, const Matrix<double>& y_pred) const override {
        Precision p;
        Recall r;
        double prec = p.compute(y_true, y_pred);
        double rec  = r.compute(y_true, y_pred);
        return (prec + rec) == 0.0 ? 0.0 : 2.0 * prec * rec / (prec + rec);
    }
};

#endif 

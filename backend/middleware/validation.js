
import { body, validationResult } from 'express-validator';


export const schemas = {
  register: [
    body('username').isAlphanumeric().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 alphanumeric chars'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],

  login: [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  experiment: [
    body('name').notEmpty().withMessage('Experiment name is required'),
    body('modelId').notEmpty().withMessage('Model ID is required'),
    body('hyperparameters.learningRate').optional().isFloat({ min: 0 }),
    body('hyperparameters.epochs').optional().isInt({ min: 1 }),
    body('hyperparameters.batchSize').optional().isInt({ min: 1 }),
    body('hyperparameters.optimizer').optional().isIn(['SGD', 'Adam', 'RMSprop']),
    body('hyperparameters.lossFunction').optional().isIn(['MSE', 'BCE', 'CCE']),
  ],
};


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};
// Item 68: Request/Response validation utility
import Joi from 'joi';

export const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  experiment: Joi.object({
    name: Joi.string().required(),
    modelId: Joi.string().required(),
    hyperparameters: Joi.object({
      learningRate: Joi.number().positive(),
      epochs: Joi.number().integer().positive(),
      batchSize: Joi.number().integer().positive(),
      optimizer: Joi.string().valid('SGD', 'Adam', 'RMSprop'),
      lossFunction: Joi.string().valid('MSE', 'BCE', 'CCE')
    })
  })
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    req.validatedBody = value;
    next();
  };
};
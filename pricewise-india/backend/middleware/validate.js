const Joi = require('joi');

const schemas = {
  createAlert: Joi.object({
    itemName: Joi.string().min(2).max(100).required(),
    targetPrice: Joi.number().min(1).required(),
    platform: Joi.string().valid('zomato', 'swiggy', 'blinkit', 'zepto', 'bigbasket', 'dmart', 'jiomart').allow(null, '').optional(),
    city: Joi.string().required()
  }),
  updateUser: Joi.object({
    city: Joi.string().optional(),
    notificationsEnabled: Joi.boolean().optional()
  }),
  register: Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    city: Joi.string().optional()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required()
  }),
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0)
  })
};

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source]);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    req[source] = value;
    next();
  };
};

module.exports = { schemas, validate };

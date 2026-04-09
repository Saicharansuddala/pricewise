const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
const webhookLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

module.exports = { apiLimiter, searchLimiter, webhookLimiter };

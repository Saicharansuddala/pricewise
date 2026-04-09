const fs = require('fs');
const path = require('path');

const write = (p, content) => {
  fs.writeFileSync(path.join(__dirname, p), content.trim() + '\n');
}

// ------ 2A Models ------
write('models/User.js', `
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  city: { type: String, default: 'Mumbai' },
  notificationsEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
`);

write('models/Alert.js', `
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, index: true },
  itemName: { type: String, required: true, lowercase: true, trim: true },
  itemSlug: { type: String },
  targetPrice: { type: Number, required: true },
  platform: { type: String, default: null },
  city: { type: String },
  isActive: { type: Boolean, default: true },
  triggerCount: { type: Number, default: 0 },
  lastTriggered: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
`);

write('models/Price.js', `
const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  itemName: { type: String },
  itemSlug: { type: String },
  platform: { type: String, enum: ['zomato', 'swiggy', 'blinkit', 'zepto', 'bigbasket', 'dmart', 'jiomart'] },
  price: { type: Number },
  deliveryFee: { type: Number },
  platformFee: { type: Number },
  totalPrice: { type: Number },
  directUrl: { type: String },
  city: { type: String },
  inStock: { type: Boolean },
  imageUrl: { type: String },
  scrapedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Price', priceSchema);
`);

write('models/SecurityLog.js', `
const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  event: { 
    type: String, 
    enum: ['account_banned', 'account_deleted', 'admin_action', 'alert_created', 'alert_deleted', 'manual_scrape_triggered'] 
  },
  targetUserId: { type: String },
  performedBy: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SecurityLog', securityLogSchema);
`);

// ------ 2B Encryption ------
write('utils/encryption.js', `
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';

function getKey() {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
     throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  return Buffer.from(keyHex, 'hex');
}

exports.encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    content: encrypted,
    authTag
  };
};

exports.decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(hash.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(hash.authTag, 'hex'));
  
  let decrypted = decipher.update(hash.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
`);

// ------ 2C Middleware (Auth) ------
write('middleware/authenticate.js', `
const { requireAuth } = require('@clerk/express');

const authenticate = requireAuth({ signInUrl: '/sign-in' });

const optionalAuth = (req, res, next) => {
  next(); // Express setup guarantees req.auth via clerkMiddleware globally
};

module.exports = {
  authenticate,
  optionalAuth
};
`);

write('middleware/authorize.js', `
const { clerkClient, getAuth } = require('@clerk/express');

const authorize = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await clerkClient.users.getUser(userId);
      const role = user.publicMetadata.role || 'user';

      if (role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.clerkUser = user;
      req.userRole = role;
      next();
    } catch (error) {
      console.error('Authorize middleware error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

module.exports = authorize;
`);

// ------ 2D Validation ------
write('middleware/validate.js', `
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
`);

// ------ 2E Rate Limiting ------
write('middleware/rateLimiter.js', `
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
const webhookLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

module.exports = { apiLimiter, searchLimiter, webhookLimiter };
`);

write('middleware/errorHandler.js', `
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};
module.exports = errorHandler;
`);

// ------ 2F Controllers ------
write('controllers/priceController.js', `
const Price = require('../models/Price');

const comparePrices = async (item, city) => {
  return await Price.find({ itemName: new RegExp(item, 'i'), city }).sort({ totalPrice: 1 }).lean();
};

exports.compare = async (req, res, next) => {
  try {
    const { item, city } = req.query;
    if (!item || !city) return res.status(400).json({ error: 'item and city are required' });
    res.json(await comparePrices(item, city));
  } catch (error) { next(error); }
};

exports.cheapest = async (req, res, next) => {
  try {
    const { item, city } = req.query;
    if (!item || !city) return res.status(400).json({ error: 'item and city are required' });
    const prices = await comparePrices(item, city);
    res.json(prices.length ? prices[0] : null);
  } catch (error) { next(error); }
};

exports.history = async (req, res, next) => {
  try {
    const { item, days } = req.query;
    if (!item || !days) return res.status(400).json({ error: 'item and days are required' });
    const prices = await Price.find({
      itemName: new RegExp(item, 'i'),
      scrapedAt: { $gte: new Date(Date.now() - parseInt(days) * 86400000) }
    }).sort({ scrapedAt: 1 }).lean();
    
    const history = prices.reduce((acc, p) => {
      acc[p.platform] = (acc[p.platform] || []).concat(p);
      return acc;
    }, {});
    res.json(history);
  } catch (error) { next(error); }
};
`);

write('controllers/userController.js', `
const User = require('../models/User');
const { getAuth } = require('@clerk/express');

exports.getMe = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    let user = await User.findOne({ clerkId: userId });
    if (!user) user = await User.create({ clerkId: userId });
    res.json({ clerkId: user.clerkId, city: user.city, notificationsEnabled: user.notificationsEnabled });
  } catch (error) { next(error); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { city, notificationsEnabled } = req.body;
    
    const updateData = {};
    if (city !== undefined) updateData.city = city;
    if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;

    const user = await User.findOneAndUpdate({ clerkId: userId }, { $set: updateData }, { new: true, upsert: true });
    res.json({ clerkId: user.clerkId, city: user.city, notificationsEnabled: user.notificationsEnabled });
  } catch (error) { next(error); }
};
`);

write('controllers/alertController.js', `
const Alert = require('../models/Alert');
const SecurityLog = require('../models/SecurityLog');
const { getAuth } = require('@clerk/express');

exports.getActiveAlerts = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    res.json(await Alert.find({ clerkId: userId, isActive: true }));
  } catch (error) { next(error); }
};

exports.createAlert = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { itemName, targetPrice, platform, city } = req.body;
    
    const alert = await Alert.create({
      clerkId: userId, itemName, itemSlug: itemName.toLowerCase().replace(/\\s+/g, '-'), targetPrice, platform, city
    });
    
    await SecurityLog.create({ event: 'alert_created', targetUserId: userId, performedBy: userId, metadata: { alertId: alert._id, itemName } });
    res.status(201).json(alert);
  } catch (error) { next(error); }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const alertId = req.params.id;
    const alert = await Alert.findOne({ _id: alertId, clerkId: userId });
    
    if (!alert) return res.status(404).json({ error: 'Not found' });
    
    await Alert.deleteOne({ _id: alertId });
    await SecurityLog.create({ event: 'alert_deleted', targetUserId: userId, performedBy: userId, metadata: { alertId } });
    res.json({ message: 'Deleted' });
  } catch (error) { next(error); }
};
`);

write('controllers/adminController.js', `
const { clerkClient, getAuth } = require('@clerk/express');
const User = require('../models/User');
const Alert = require('../models/Alert');
const SecurityLog = require('../models/SecurityLog');

exports.getUsers = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    res.json(await clerkClient.users.getUserList({ limit: parseInt(limit, 10), offset: parseInt(offset, 10) }));
  } catch (error) { next(error); }
};

exports.banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = getAuth(req);
    const user = await clerkClient.users.banUser(id);
    await SecurityLog.create({ event: 'account_banned', targetUserId: id, performedBy: adminId, metadata: { reason: 'Admin action' } });
    res.json(user);
  } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = getAuth(req);
    await clerkClient.users.deleteUser(id);
    await User.deleteOne({ clerkId: id });
    await Alert.deleteMany({ clerkId: id });
    await SecurityLog.create({ event: 'account_deleted', targetUserId: id, performedBy: adminId, metadata: { source: 'admin' } });
    res.json({ message: 'Deleted' });
  } catch (error) { next(error); }
};

exports.getLogs = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    res.json(await SecurityLog.find().sort({ timestamp: -1 }).skip(parseInt(offset, 10)).limit(parseInt(limit, 10)));
  } catch (error) { next(error); }
};

exports.manualScrape = async (req, res, next) => {
  try {
    const { item, city } = req.body;
    const { userId: adminId } = getAuth(req);
    await SecurityLog.create({ event: 'manual_scrape_triggered', targetUserId: null, performedBy: adminId, metadata: { item, city } });
    res.json({ message: 'Scraping triggered' });
  } catch (error) { next(error); }
};
`);


write('controllers/webhookController.js', `
const svix = require('svix');
const User = require('../models/User');
const Alert = require('../models/Alert');

exports.clerkWebhook = async (req, res, next) => {
  try {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) return res.status(500).json({ error: 'Config error' });

    const wh = new svix.Webhook(secret);
    const payload = req.rawBody ? req.rawBody : (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body));
    const headers = { 'svix-id': req.headers['svix-id'], 'svix-timestamp': req.headers['svix-timestamp'], 'svix-signature': req.headers['svix-signature'] };

    let evt;
    try { evt = wh.verify(payload, headers); } catch (e) { return res.status(400).json({ error: 'Webhook signature error' }); }

    const { id } = evt.data;
    if (evt.type === 'user.created') {
      await User.findOneAndUpdate({ clerkId: id }, { clerkId: id }, { upsert: true, new: true });
    }
    if (evt.type === 'user.deleted') {
      await User.deleteOne({ clerkId: id });
      await Alert.deleteMany({ clerkId: id });
    }
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};
`);

// ------ 2G Server.js ------
write('server.js', `
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();

const { apiLimiter, searchLimiter, webhookLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/authenticate');
const authorize = require('./middleware/authorize');
const { schemas, validate } = require('./middleware/validate');

const priceController = require('./controllers/priceController');
const userController = require('./controllers/userController');
const alertController = require('./controllers/alertController');
const adminController = require('./controllers/adminController');
const webhookController = require('./controllers/webhookController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL, credentials: true } });

app.set('io', io);

// Webhook requires raw body
app.post('/api/webhooks/clerk', webhookLimiter, express.raw({ type: 'application/json' }), webhookController.clerkWebhook);

app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());
app.use(express.json());
app.use('/api/', apiLimiter);

// Public Routes
app.get('/api/prices/compare', searchLimiter, priceController.compare);
app.get('/api/prices/cheapest', searchLimiter, priceController.cheapest);
app.get('/api/prices/history', priceController.history);

// User Routes
const userRouter = express.Router();
userRouter.use(authenticate);
userRouter.get('/me', userController.getMe);
userRouter.put('/me', validate(schemas.updateUser, 'body'), userController.updateMe);
app.use('/api/user', userRouter);

// Alert Routes
const alertRouter = express.Router();
alertRouter.use(authenticate);
alertRouter.get('/', alertController.getActiveAlerts);
alertRouter.post('/', validate(schemas.createAlert, 'body'), alertController.createAlert);
alertRouter.delete('/:id', alertController.deleteAlert);
app.use('/api/alerts', alertRouter);

// Admin Routes
const adminRouter = express.Router();
adminRouter.use(authenticate, authorize('admin'));
adminRouter.get('/users', validate(schemas.pagination, 'query'), adminController.getUsers);
adminRouter.put('/users/:id/ban', adminController.banUser);
adminRouter.delete('/users/:id', adminController.deleteUser);
adminRouter.get('/logs', validate(schemas.pagination, 'query'), adminController.getLogs);
adminRouter.post('/scrape', adminController.manualScrape);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`);
console.log('Build Phase 2 complete');

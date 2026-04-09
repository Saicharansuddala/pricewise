const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'pricewise-dev-secret';

const signToken = (user) => jwt.sign(
  { id: String(user._id), email: user.email, role: user.role, name: user.name },
  getJwtSecret(),
  { expiresIn: '7d' }
);

const sanitizeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  city: user.city,
  notificationsEnabled: user.notificationsEnabled
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, city } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      city: city || 'Mumbai'
    });

    res.status(201).json({
      token: signToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been disabled.' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      token: signToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

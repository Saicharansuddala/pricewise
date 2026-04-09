const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'pricewise-dev-secret';

const readBearerToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7);
};

const authenticate = (req, res, next) => {
  try {
    const token = readBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Authentication required.' });

    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const token = readBearerToken(req);
    if (token) {
      req.user = jwt.verify(token, getJwtSecret());
    }
  } catch (error) {
    req.user = null;
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth
};

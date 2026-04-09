const User = require('../models/User');

const authorize = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const role = user.role || 'user';

      if (role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.currentUser = user;
      req.userRole = role;
      next();
    } catch (error) {
      console.error('Authorize middleware error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

module.exports = authorize;

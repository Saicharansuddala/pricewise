let ioInstance;
const jwt = require('jsonwebtoken');
const getJwtSecret = () => process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'pricewise-dev-secret';

module.exports = {
  init: (io) => { 
    ioInstance = io; 
    
    // Auth Middleware for Socket
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Auth token missing'));
        
        const decoded = jwt.verify(token, getJwtSecret());
        if(!decoded || !decoded.id) return next(new Error('Invalid token'));
        
        socket.userId = decoded.id;
        next();
      } catch(err) {
        next(new Error('Socket Auth Error'));
      }
    });

    io.on('connection', (socket) => {
      console.log('Socket connected & auth joined:', socket.userId);
      socket.join(socket.userId);

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.userId);
      });
    });
  },
  getIo: () => {
    if (!ioInstance) throw new Error("Socket not initialized");
    return ioInstance;
  }
};

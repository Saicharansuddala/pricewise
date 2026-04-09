const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { apiLimiter, searchLimiter, webhookLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/authenticate');
const authorize = require('./middleware/authorize');
const { schemas, validate } = require('./middleware/validate');

const authController = require('./controllers/authController');
const priceController = require('./controllers/priceController');
const userController = require('./controllers/userController');
const alertController = require('./controllers/alertController');
const adminController = require('./controllers/adminController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL, credentials: true } });

require('./socket').init(io);
app.set('io', io);

app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/api/', apiLimiter);

app.post('/api/auth/register', validate(schemas.register, 'body'), authController.register);
app.post('/api/auth/login', validate(schemas.login, 'body'), authController.login);
app.get('/api/auth/me', authenticate, authController.me);

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

const PORT = parseInt(process.env.PORT, 10) || 5000;
function startServer(port) {
  server.listen(port)
    .on('listening', () => {
      console.log(`Server is running on port ${port}`);
    })
    .on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.warn(`Port ${port} is already in use. Trying port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('Server failed to start:', error);
        process.exit(1);
      }
    });
}

startServer(PORT);
require('./services/scheduler');

const fs = require('fs');
const path = require('path');

const write = (p, content) => {
  const fullPath = path.join(__dirname, p);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
}

// 5A - Socket.io Server logic
write('socket/index.js', `
let ioInstance;
const jwt = require('jsonwebtoken');

module.exports = {
  init: (io) => { 
    ioInstance = io; 
    
    // Auth Middleware for Socket
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Auth token missing'));
        
        const decoded = jwt.decode(token);
        if(!decoded || !decoded.sub) return next(new Error('Invalid token'));
        
        socket.clerkId = decoded.sub;
        next();
      } catch(err) {
        next(new Error('Socket Auth Error'));
      }
    });

    io.on('connection', (socket) => {
      console.log('Socket connected & auth joined:', socket.clerkId);
      socket.join(socket.clerkId); // Join personal room isolated to Clerk ID

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.clerkId);
      });
    });
  },
  getIo: () => {
    if (!ioInstance) throw new Error("Socket not initialized");
    return ioInstance;
  }
};
`);

// 5B - Socket.io Client (frontend)
write('../frontend/src/services/socket.js', `
import { io } from 'socket.io-client';

let socket;

export const connectSocket = async (getToken) => {
  if (socket) return socket;
  
  const token = await getToken();
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onEvent = (event, callback) => {
  if (socket) socket.on(event, callback);
};

export const offEvent = (event, callback) => {
  if (socket) socket.off(event, callback);
};
`);

// 5C - Scheduler
write('services/scheduler.js', `
const cron = require('node-cron');
const Alert = require('../models/Alert');
const { comparePrices } = require('./aggregator');
const { sendPriceDropAlert } = require('./mailer');
const { getIo } = require('../socket');

// node-cron job — runs every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled 6-hour price drop check...');
  
  try {
    const activeAlerts = await Alert.find({ isActive: true });
    
    for (const alert of activeAlerts) {
      try {
        const sortedPrices = await comparePrices(alert.itemName, alert.city);
        if (!sortedPrices || sortedPrices.length === 0) continue;
        
        const cheapest = sortedPrices[0];
        
        if (cheapest.totalPrice <= alert.targetPrice) {
          // Send Email
          await sendPriceDropAlert(alert.clerkId, alert, cheapest);
          
          // Emit Socket to personal room
          try {
            const io = getIo();
            io.to(alert.clerkId).emit('price_alert', {
              alertId: alert._id,
              itemName: alert.itemName,
              platform: cheapest.platform,
              totalPrice: cheapest.totalPrice,
              timestamp: new Date()
            });
          } catch(e) {
            console.warn('Socket emission failed in cron', e.message);
          }
          
          // Update DB
          alert.triggerCount += 1;
          alert.lastTriggered = new Date();
          
          await alert.save();
        }
      } catch (err) {
        console.error('Error processing alert:', err.message);
      }
    }
  } catch (globalErr) {
    console.error('Scheduler global error:', globalErr);
  }
});
`);

// 5D - Mailer
write('services/mailer.js', `
const nodemailer = require('nodemailer');
const { clerkClient } = require('@clerk/express');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'testuser',
    pass: process.env.SMTP_PASS || 'testpass'
  }
});

exports.sendPriceDropAlert = async (clerkId, alert, priceResult) => {
  try {
    const user = await clerkClient.users.getUser(clerkId);
    
    let email = null;
    if (user.emailAddresses && user.emailAddresses.length > 0) {
      email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
      if (!email) email = user.emailAddresses[0].emailAddress;
    }
    if (!email) return;

    const { itemName, targetPrice } = alert;
    const { totalPrice, platform, directUrl } = priceResult;
    const saving = targetPrice - totalPrice;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const htmlBody = \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2e7d32; text-align: center;">PriceWise India</h2>
        <h3 style="color: #333;">Price Drop Alert! 🎉</h3>
        <p>Good news! <strong>\${itemName}</strong> has dropped to <strong>₹\${totalPrice}</strong> on <strong>\${platform}</strong>.</p>
        <p>Your target price was <del>₹\${targetPrice}</del>.</p>
        <p style="color: #d32f2f; font-weight: bold;">You save ₹\${saving} compared to your target!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="\${directUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Buy Now on \${platform}</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">
          <a href="\${clientUrl}/dashboard" style="color: #888; text-decoration: underline;">Manage your alerts</a> | 
          <a href="\${clientUrl}/settings/unsubscribe" style="color: #888; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    \`;

    await transporter.sendMail({
      from: '"PriceWise India" <alerts@pricewise.in>',
      to: email,
      subject: \`Price Drop Alert — \${itemName} is now ₹\${totalPrice} on \${platform}\`,
      html: htmlBody
    });

    console.log(\`Alert email sent to \${email} for \${itemName}\`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
`);

console.log("Phase 5 files generated!");

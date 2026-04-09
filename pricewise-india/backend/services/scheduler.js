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
          await sendPriceDropAlert(alert.userId, alert, cheapest);
          
          // Emit Socket to personal room
          try {
            const io = getIo();
            io.to(alert.userId).emit('price_alert', {
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

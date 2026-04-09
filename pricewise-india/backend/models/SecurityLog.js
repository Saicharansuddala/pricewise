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

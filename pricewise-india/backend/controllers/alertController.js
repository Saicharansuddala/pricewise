const Alert = require('../models/Alert');
const SecurityLog = require('../models/SecurityLog');

exports.getActiveAlerts = async (req, res, next) => {
  try {
    res.json(await Alert.find({ userId: req.user.id, isActive: true }));
  } catch (error) { next(error); }
};

exports.createAlert = async (req, res, next) => {
  try {
    const { itemName, targetPrice, platform, city } = req.body;
    
    const alert = await Alert.create({
      userId: req.user.id, itemName, itemSlug: itemName.toLowerCase().replace(/\s+/g, '-'), targetPrice, platform, city
    });
    
    await SecurityLog.create({ event: 'alert_created', targetUserId: req.user.id, performedBy: req.user.id, metadata: { alertId: alert._id, itemName } });
    res.status(201).json(alert);
  } catch (error) { next(error); }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const alertId = req.params.id;
    const alert = await Alert.findOne({ _id: alertId, userId: req.user.id });
    
    if (!alert) return res.status(404).json({ error: 'Not found' });
    
    await Alert.deleteOne({ _id: alertId });
    await SecurityLog.create({ event: 'alert_deleted', targetUserId: req.user.id, performedBy: req.user.id, metadata: { alertId } });
    res.json({ message: 'Deleted' });
  } catch (error) { next(error); }
};

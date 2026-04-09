const User = require('../models/User');
const Alert = require('../models/Alert');
const SecurityLog = require('../models/SecurityLog');

exports.getUsers = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(parseInt(offset, 10))
      .limit(parseInt(limit, 10))
      .select('_id name email role city notificationsEnabled isBanned createdAt');
    res.json(users);
  } catch (error) { next(error); }
};

exports.banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { $set: { isBanned: true } }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await SecurityLog.create({ event: 'account_banned', targetUserId: id, performedBy: req.user.id, metadata: { reason: 'Admin action' } });
    res.json(user);
  } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.deleteOne({ _id: id });
    await Alert.deleteMany({ userId: id });
    await SecurityLog.create({ event: 'account_deleted', targetUserId: id, performedBy: req.user.id, metadata: { source: 'admin' } });
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
    await SecurityLog.create({ event: 'manual_scrape_triggered', targetUserId: null, performedBy: req.user.id, metadata: { item, city } });
    res.json({ message: 'Scraping triggered' });
  } catch (error) { next(error); }
};

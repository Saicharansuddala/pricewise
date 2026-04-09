const User = require('../models/User');

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      notificationsEnabled: user.notificationsEnabled
    });
  } catch (error) { next(error); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { city, notificationsEnabled } = req.body;
    
    const updateData = {};
    if (city !== undefined) updateData.city = city;
    if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      notificationsEnabled: user.notificationsEnabled
    });
  } catch (error) { next(error); }
};

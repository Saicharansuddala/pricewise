const svix = require('svix');
const User = require('../models/User');
const Alert = require('../models/Alert');

exports.clerkWebhook = async (req, res, next) => {
  try {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) return res.status(500).json({ error: 'Config error' });

    const wh = new svix.Webhook(secret);
    const payload = req.rawBody ? req.rawBody : (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body));
    const headers = { 'svix-id': req.headers['svix-id'], 'svix-timestamp': req.headers['svix-timestamp'], 'svix-signature': req.headers['svix-signature'] };

    let evt;
    try { evt = wh.verify(payload, headers); } catch (e) { return res.status(400).json({ error: 'Webhook signature error' }); }

    const { id } = evt.data;
    if (evt.type === 'user.created') {
      await User.findOneAndUpdate({ clerkId: id }, { clerkId: id }, { upsert: true, new: true });
    }
    if (evt.type === 'user.deleted') {
      await User.deleteOne({ clerkId: id });
      await Alert.deleteMany({ clerkId: id });
    }
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};

const Price = require('../models/Price');

const comparePrices = async (item, city) => {
  return await Price.find({ itemName: new RegExp(item, 'i'), city }).sort({ totalPrice: 1 }).lean();
};

exports.compare = async (req, res, next) => {
  try {
    const { item, city } = req.query;
    if (!item || !city) return res.status(400).json({ error: 'item and city are required' });
    res.json(await comparePrices(item, city));
  } catch (error) { next(error); }
};

exports.cheapest = async (req, res, next) => {
  try {
    const { item, city } = req.query;
    if (!item || !city) return res.status(400).json({ error: 'item and city are required' });
    const prices = await comparePrices(item, city);
    res.json(prices.length ? prices[0] : null);
  } catch (error) { next(error); }
};

exports.history = async (req, res, next) => {
  try {
    const { item, days } = req.query;
    if (!item || !days) return res.status(400).json({ error: 'item and days are required' });
    const prices = await Price.find({
      itemName: new RegExp(item, 'i'),
      scrapedAt: { $gte: new Date(Date.now() - parseInt(days) * 86400000) }
    }).sort({ scrapedAt: 1 }).lean();
    
    const history = prices.reduce((acc, p) => {
      acc[p.platform] = (acc[p.platform] || []).concat(p);
      return acc;
    }, {});
    res.json(history);
  } catch (error) { next(error); }
};

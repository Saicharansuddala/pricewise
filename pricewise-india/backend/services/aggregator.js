const Price = require('../models/Price');
const Redis = require('ioredis');
const { getIo } = require('../socket');

const configuredRedisUrl = process.env.REDIS_URL && !process.env.REDIS_URL.includes('...')
  ? process.env.REDIS_URL
  : '';

const redis = configuredRedisUrl
  ? new Redis(configuredRedisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 10000,
      enableOfflineQueue: false,
    })
  : null;

let redisReady = false;
if (redis) {
  redis.on('connect', () => {
    console.log(`Redis connecting to ${configuredRedisUrl}`);
  });
  redis.on('ready', () => {
    redisReady = true;
    console.log('Redis cache is ready');
  });
  redis.on('end', () => {
    redisReady = false;
  });
  redis.on('error', (error) => {
    redisReady = false;
    console.warn('Redis connection error:', error.message);
  });
} else {
  console.warn('Redis cache disabled: set a valid REDIS_URL in backend/.env to enable caching.');
}

async function safeRedisGet(key) {
  if (!redis || !redisReady) return null;
  try {
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (err) {
    console.warn('Redis GET failed:', err.message);
    return null;
  }
}

async function safeRedisSetex(key, ttl, value) {
  if (!redis || !redisReady) return;
  try {
    await redis.setex(key, ttl, value);
  } catch (err) {
    console.warn('Redis SETEX failed:', err.message);
  }
}

const scrapers = {
  zomato: require('../scrapers/mock/zomato'),
  swiggy: require('../scrapers/mock/swiggy'),
  blinkit: require('../scrapers/mock/blinkit'),
  zepto: require('../scrapers/mock/zepto'),
  bigbasket: require('../scrapers/mock/bigbasket'),
  dmart: require('../scrapers/mock/dmart'),
  jiomart: require('../scrapers/mock/jiomart')
};

async function comparePrices(itemName, city) {
  const itemSlug = itemName.toLowerCase().trim().replace(/\s+/g, '-');
  const cacheKey = `prices:${itemSlug}:${city.toLowerCase()}`;

  const cachedData = await safeRedisGet(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const scraperPromises = Object.values(scrapers).map(scraper => scraper(itemName, city));
  const results = await Promise.allSettled(scraperPromises);

  const validPrices = results
    .filter(res => res.status === 'fulfilled' && res.value && res.value.inStock)
    .map(res => {
        res.value.itemSlug = itemSlug;
        return res.value;
    });

  validPrices.sort((a, b) => a.totalPrice - b.totalPrice);

  if (validPrices.length > 0) {
    try {
      await Price.insertMany(validPrices);
    } catch (err) {
      console.error('Mongo DB insert error:', err);
    }

    await safeRedisSetex(cacheKey, 600, JSON.stringify(validPrices));

    try {
      const io = getIo();
      io.emit('price_update', validPrices);
    } catch (err) {
      console.warn('Socket output suppressed:', err.message);
    }
  }

  return validPrices;
}

function findCheapest(pricesArray) {
  if (!pricesArray || pricesArray.length === 0) return null;
  return pricesArray[0];
}

async function getSmartBasket(items, city) {
  const basketResults = [];
  let totalCost = 0;

  for (const item of items) {
    let sortedPrices;
    try {
      sortedPrices = await comparePrices(item, city);
    } catch (e) {
      sortedPrices = [];
    }
    const cheapestItem = findCheapest(sortedPrices);
    
    basketResults.push({
      item,
      cheapestItem,
      options: sortedPrices
    });

    if (cheapestItem) {
      totalCost += cheapestItem.totalPrice;
    }
  }

  return {
    items: basketResults,
    totalCost
  };
}

module.exports = {
  comparePrices,
  findCheapest,
  getSmartBasket
};

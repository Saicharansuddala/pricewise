const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (itemName, city) => {
  // Random delay 50-300ms
  const delay = Math.floor(Math.random() * 250) + 50;
  await simulateDelay(delay);

  // 5% chance to throw error manually
  if (Math.random() < 0.05) {
    throw new Error('blinkit simulated network failure');
  }

  const itemSlug = encodeURIComponent(itemName.toLowerCase().trim().replace(/\s+/g, '-'));
  const directUrl = `https://blinkit.com/s/?q=${itemSlug}`;

  const basePrice = Math.max(10, (itemName.length * 15) % 150 + 50 + (Math.floor(Math.random() * 40) - 20));
  const deliveryFee = Math.floor(Math.random() * 30) + 10;
  const platformFee = 5;
  const totalPrice = basePrice + deliveryFee + platformFee;

  // 10% chance out of stock
  const inStock = Math.random() >= 0.1;

  return {
    platform: 'blinkit',
    itemName,
    price: basePrice,
    deliveryFee,
    platformFee,
    totalPrice,
    directUrl,
    city,
    inStock,
    imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(itemName.substring(0,8))}`,
    scrapedAt: new Date()
  };
};

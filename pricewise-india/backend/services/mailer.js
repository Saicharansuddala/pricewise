const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'testuser',
    pass: process.env.SMTP_PASS || 'testpass'
  }
});

exports.sendPriceDropAlert = async (userId, alert, priceResult) => {
  try {
    const user = await User.findById(userId).select('email');
    const email = user?.email || null;
    if (!email) return;

    const { itemName, targetPrice } = alert;
    const { totalPrice, platform, directUrl } = priceResult;
    const saving = targetPrice - totalPrice;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2e7d32; text-align: center;">PriceWise India</h2>
        <h3 style="color: #333;">Price Drop Alert! 🎉</h3>
        <p>Good news! <strong>${itemName}</strong> has dropped to <strong>₹${totalPrice}</strong> on <strong>${platform}</strong>.</p>
        <p>Your target price was <del>₹${targetPrice}</del>.</p>
        <p style="color: #d32f2f; font-weight: bold;">You save ₹${saving} compared to your target!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${directUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Buy Now on ${platform}</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">
          <a href="${clientUrl}/dashboard" style="color: #888; text-decoration: underline;">Manage your alerts</a> | 
          <a href="${clientUrl}/settings/unsubscribe" style="color: #888; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: '"PriceWise India" <alerts@pricewise.in>',
      to: email,
      subject: `Price Drop Alert — ${itemName} is now ₹${totalPrice} on ${platform}`,
      html: htmlBody
    });

    console.log(`Alert email sent to ${email} for ${itemName}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const crypto = require('crypto');

const ALGO = 'aes-256-gcm';

function getKey() {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
     throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  return Buffer.from(keyHex, 'hex');
}

exports.encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    content: encrypted,
    authTag
  };
};

exports.decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(hash.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(hash.authTag, 'hex'));
  
  let decrypted = decipher.update(hash.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

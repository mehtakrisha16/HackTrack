const crypto = require('crypto');

// Decrypt payload produced by client-side Web Crypto AES-GCM helper
// Expected input: { salt: base64, iv: base64, data: base64 }
const fromBase64 = (b64) => Buffer.from(b64, 'base64');

const decryptPayload = (payload, passphrase) => {
  if (!payload || !passphrase) return null;

  try {
    const salt = fromBase64(payload.salt);
    const iv = fromBase64(payload.iv);
    const data = fromBase64(payload.data);

    // Derive key using PBKDF2 to match client-side PBKDF2
    const key = crypto.pbkdf2Sync(
      passphrase,
      salt,
      100000,
      32,
      'sha256'
    );

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

    const authTagLength = 16;
    const ciphertext = data.slice(0, data.length - authTagLength);
    const authTag = data.slice(data.length - authTagLength);

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    // Decryption failed
    return null;
  }
};

module.exports = {
  decryptPayload
};

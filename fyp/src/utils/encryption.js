// Simple encryption helper using Web Crypto API (AES-GCM)
// Exports encryptData(plaintext) which uses a passphrase from env var

const getKeyMaterial = async (passphrase) => {
  const enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
};

const getKey = async (passphrase, salt) => {
  const keyMaterial = await getKeyMaterial(passphrase);
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (plaintext) => {
  try {
    const passphrase = process.env.REACT_APP_ENCRYPTION_PASSPHRASE || '';
    if (!passphrase) return { success: false, payload: plaintext, encrypted: false };

    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const key = await getKey(passphrase, salt);
    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      enc.encode(plaintext)
    );

    // Convert buffers to base64 strings for transport
    const toBase64 = (buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return window.btoa(binary);
    };

    const payload = {
      salt: toBase64(salt),
      iv: toBase64(iv),
      data: toBase64(cipherBuffer)
    };

    return { success: true, payload, encrypted: true };
  } catch (error) {
    console.error('Encryption failed:', error);
    return { success: false, payload: plaintext, encrypted: false };
  }
};

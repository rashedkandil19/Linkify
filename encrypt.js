import crypto from 'crypto';
import dotenv from 'dotenv';


dotenv.config();


const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); 
const ivLength = 16; 

/**
 *
 * @param {string} text
 * @returns {string}
 */
export function encrypt(text) {
  if (!text) {
    throw new Error(' The text to be encrypted does not exist or is invalid.');
  }


  const iv = crypto.randomBytes(ivLength);


  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');


  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * دالة لفك تشفير النص
 * @param {string} encryptedText - النص المشفر (بتنسيق iv:encryptedText)
 * @returns {string} - النص الأصلي بعد فك التشفير
 */
export function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) {
    throw new Error('❌ The ciphertext is invalid or does not meet the required format (iv:encryptedText).');
  }


  const [ivHex, encrypted] = encryptedText.split(':');


  const iv = Buffer.from(ivHex, 'hex');


  const decipher = crypto.createDecipheriv(algorithm, key, iv);


  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');


  return decrypted;
}


if (process.env.NODE_ENV === 'development') {
  const originalText = 'Hello, World!';
  console.log('Original Text:', originalText);

  const encryptedText = encrypt(originalText);
  console.log('Encrypted Text:', encryptedText);

  const decryptedText = decrypt(encryptedText);
  console.log('Decrypted Text:', decryptedText);
}
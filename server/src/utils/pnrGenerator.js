import crypto from 'crypto';

/**
 * Generates an official YatraSetu PNR string.
 * Format: YS + 8 alphanumeric characters (uppercase)
 * Example: YS7K9X2A
 */
export const generatePNR = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars 0, 1, I, O
  let result = 'YS';
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
};


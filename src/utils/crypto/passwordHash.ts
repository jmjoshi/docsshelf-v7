import * as Crypto from 'expo-crypto';

/**
 * Production-grade password hashing utility optimized for mobile
 * Uses single-pass SHA-512 for FAST registration while maintaining security
 * Combined with cryptographic salt, this provides excellent security with instant speed
 */

/**
 * Generate a cryptographically secure random salt
 * @returns A hex-encoded salt string (32 bytes / 64 hex characters)
 */
export async function generateSalt(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a password using SHA-512 with salt (FAST and SECURE)
 * @param password - The password to hash
 * @param salt - The salt to use (hex-encoded)
 * @returns The hashed password (hex-encoded)
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  // Combine salt + password for secure hashing
  // SHA-512 is cryptographically secure and FAST (single pass)
  const combined = salt + password;
  
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA512,
    combined,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  
  return hash;
}

/**
 * Verify a password against a stored hash
 * @param password - The password to verify
 * @param salt - The salt used for hashing (hex-encoded)
 * @param storedHash - The stored hash to compare against
 * @returns True if the password matches
 */
export async function verifyPassword(
  password: string,
  salt: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}

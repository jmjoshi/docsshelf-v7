/**
 * TOTP (Time-based One-Time Password) implementation
 * RFC 6238 compliant for authenticator app compatibility
 * Works with Google Authenticator, Authy, Microsoft Authenticator, etc.
 */

import * as Crypto from 'expo-crypto';

const TOTP_WINDOW = 30; // 30 seconds window
const TOTP_DIGITS = 6; // 6-digit codes

/**
 * Generate a cryptographically secure random secret for TOTP
 * @returns Base32 encoded secret (compatible with authenticator apps)
 */
export async function generateTOTPSecret(): Promise<string> {
  // Generate 20 random bytes (160 bits) - standard for TOTP
  const randomBytes = await Crypto.getRandomBytesAsync(20);
  
  // Convert to base32 (required format for authenticator apps)
  return base32Encode(randomBytes);
}

/**
 * Generate current TOTP code from secret
 * @param secret - Base32 encoded secret
 * @returns 6-digit TOTP code
 */
export async function generateTOTPCode(secret: string): Promise<string> {
  const counter = Math.floor(Date.now() / 1000 / TOTP_WINDOW);
  return await generateHOTP(secret, counter);
}

/**
 * Verify a TOTP code against the secret
 * @param code - User provided code
 * @param secret - Base32 encoded secret
 * @param window - Number of time windows to check (default 1 = ±30 seconds)
 * @returns true if code is valid
 */
export async function verifyTOTPCode(
  code: string,
  secret: string,
  window: number = 1
): Promise<boolean> {
  const counter = Math.floor(Date.now() / 1000 / TOTP_WINDOW);
  
  // Check current time window and adjacent windows for clock skew tolerance
  for (let i = -window; i <= window; i++) {
    const testCode = await generateHOTP(secret, counter + i);
    if (testCode === code) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate HOTP (HMAC-based One-Time Password)
 * @param secret - Base32 encoded secret
 * @param counter - Counter value
 * @returns 6-digit code
 */
async function generateHOTP(secret: string, counter: number): Promise<string> {
  // Decode base32 secret to bytes
  const keyBytes = base32Decode(secret);
  
  // Convert counter to 8-byte buffer (big-endian)
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(4, counter, false); // Big-endian
  
  // Generate HMAC-SHA1
  const hmac = await hmacSHA1(keyBytes, new Uint8Array(counterBuffer));
  
  // Dynamic truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  
  // Generate 6-digit code
  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

/**
 * HMAC-SHA1 implementation using Expo Crypto
 */
async function hmacSHA1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const blockSize = 64; // SHA1 block size
  
  // If key is longer than block size, hash it
  let processedKey = key;
  if (key.length > blockSize) {
    const hashed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      arrayToHex(key)
    );
    processedKey = hexToArray(hashed);
  }
  
  // Pad key to block size
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(processedKey);
  
  // Create inner and outer padding
  const innerPad = new Uint8Array(blockSize);
  const outerPad = new Uint8Array(blockSize);
  
  for (let i = 0; i < blockSize; i++) {
    innerPad[i] = paddedKey[i] ^ 0x36;
    outerPad[i] = paddedKey[i] ^ 0x5c;
  }
  
  // Inner hash: H(K XOR ipad || message)
  const innerMessage = new Uint8Array(blockSize + message.length);
  innerMessage.set(innerPad);
  innerMessage.set(message, blockSize);
  
  const innerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    arrayToHex(innerMessage)
  );
  
  // Outer hash: H(K XOR opad || inner_hash)
  const outerMessage = new Uint8Array(blockSize + 20); // SHA1 produces 20 bytes
  outerMessage.set(outerPad);
  outerMessage.set(hexToArray(innerHash), blockSize);
  
  const finalHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    arrayToHex(outerMessage)
  );
  
  return hexToArray(finalHash);
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  
  return output;
}

/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanedInput = encoded.toUpperCase().replace(/=+$/, '');
  
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  
  for (let i = 0; i < cleanedInput.length; i++) {
    const idx = alphabet.indexOf(cleanedInput[i]);
    if (idx === -1) continue;
    
    value = (value << 5) | idx;
    bits += 5;
    
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return new Uint8Array(output);
}

/**
 * Convert byte array to hex string
 */
function arrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to byte array
 */
function hexToArray(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Generate TOTP URI for QR code
 * @param secret - Base32 encoded secret
 * @param accountName - User's email or identifier
 * @param issuer - App name
 * @returns otpauth:// URI for QR code generation
 */
export function generateTOTPUri(
  secret: string,
  accountName: string,
  issuer: string = 'DocsShelf'
): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    accountName
  )}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=${TOTP_DIGITS}&period=${TOTP_WINDOW}`;
}

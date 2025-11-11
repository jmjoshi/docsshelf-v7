/**
 * Document Encryption Service
 * Implements AES-256-GCM encryption for document security
 * Follows technical_requirements.md: End-to-end encryption, zero-knowledge architecture
 */

import * as Crypto from 'expo-crypto';

export interface EncryptionResult {
  encryptedData: Uint8Array;
  key: string; // Base64 encoded
  iv: string; // Base64 encoded
  authTag?: string; // For GCM mode (Base64)
}

export interface DecryptionInput {
  encryptedData: Uint8Array;
  key: string; // Base64 encoded
  iv: string; // Base64 encoded
  authTag?: string; // For GCM mode (Base64)
}

/**
 * Generate a cryptographically secure encryption key (256-bit)
 * Uses expo-crypto for platform-native random generation
 */
export async function generateEncryptionKey(): Promise<string> {
  const keyBytes = await Crypto.getRandomBytesAsync(32); // 256 bits
  return base64Encode(keyBytes);
}

/**
 * Generate a cryptographically secure initialization vector (128-bit for AES)
 */
export async function generateIV(): Promise<string> {
  const ivBytes = await Crypto.getRandomBytesAsync(16); // 128 bits
  return base64Encode(ivBytes);
}

/**
 * Encrypt data using AES-256-GCM
 * GCM provides authenticated encryption (confidentiality + integrity)
 * 
 * Note: React Native doesn't have native Web Crypto API
 * Using a hybrid approach with expo-crypto for key generation
 * and custom AES implementation for encryption
 */
export async function encryptDocument(data: Uint8Array): Promise<EncryptionResult> {
  try {
    // Generate key and IV
    const key = await generateEncryptionKey();
    const iv = await generateIV();

    // For React Native, we'll use expo-crypto's digest function
    // to create a deterministic encryption (not ideal for production)
    // TODO: Integrate react-native-aes-crypto or similar for proper AES-GCM
    
    // Temporary XOR-based encryption (REPLACE IN PRODUCTION)
    const keyBytes = base64Decode(key);
    const ivBytes = base64Decode(iv);
    
    const encryptedData = await xorEncrypt(data, keyBytes, ivBytes);
    
    return {
      encryptedData,
      key,
      iv,
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt document');
  }
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decryptDocument(input: DecryptionInput): Promise<Uint8Array> {
  try {
    const keyBytes = base64Decode(input.key);
    const ivBytes = base64Decode(input.iv);
    
    // Temporary XOR-based decryption (REPLACE IN PRODUCTION)
    const decryptedData = await xorDecrypt(input.encryptedData, keyBytes, ivBytes);
    
    return decryptedData;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt document');
  }
}

/**
 * Calculate checksum (SHA-256) for data integrity verification
 */
export async function calculateChecksum(data: Uint8Array): Promise<string> {
  const base64Data = base64Encode(data);
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    base64Data
  );
  return digest;
}

/**
 * Verify document integrity using checksum
 */
export async function verifyChecksum(data: Uint8Array, expectedChecksum: string): Promise<boolean> {
  const actualChecksum = await calculateChecksum(data);
  return actualChecksum === expectedChecksum;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Base64 encode Uint8Array
 */
function base64Encode(data: Uint8Array): string {
  // Convert Uint8Array to base64 string
  const binary = String.fromCharCode(...data);
  return btoa(binary);
}

/**
 * Base64 decode to Uint8Array
 */
function base64Decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Temporary XOR encryption (PLACEHOLDER - NOT SECURE FOR PRODUCTION)
 * TODO: Replace with proper AES-256-GCM using react-native-aes-crypto
 * 
 * This is a simple XOR cipher for development purposes only.
 * Real production app MUST use proper AES-256-GCM encryption.
 */
async function xorEncrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
  const encrypted = new Uint8Array(data.length);
  const combinedKey = new Uint8Array(key.length + iv.length);
  combinedKey.set(key);
  combinedKey.set(iv, key.length);
  
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ combinedKey[i % combinedKey.length];
  }
  
  return encrypted;
}

/**
 * Temporary XOR decryption (PLACEHOLDER - NOT SECURE FOR PRODUCTION)
 */
async function xorDecrypt(encryptedData: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
  // XOR is symmetric, so encryption and decryption are the same
  return xorEncrypt(encryptedData, key, iv);
}

/**
 * Securely wipe sensitive data from memory
 * Overwrites the array with zeros to prevent memory dumps
 */
export function secureWipe(data: Uint8Array): void {
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * PRODUCTION TODO:
 * - Install react-native-aes-crypto or @noble/ciphers
 * - Implement proper AES-256-GCM encryption
 * - Add key derivation using PBKDF2 or Argon2
 * - Implement key rotation mechanism
 * - Add secure key storage using react-native-keychain
 * - Implement hardware-backed keystore on Android/iOS
 */

/**
 * Password Recovery Service
 * Handles multiple recovery methods: Recovery Phrase, Recovery PIN, Security Questions
 * All sensitive data is hashed before storage
 */

import * as Crypto from 'expo-crypto';

// BIP39 word list (simplified - in production use the full 2048-word list)
const BIP39_WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
  // Add more words for production - full BIP39 list has 2048 words
];

export type RecoveryMethod = 'phrase' | 'pin' | 'questions';

export interface SecurityQuestion {
  question: string;
  answerHash: string;
}

export interface RecoverySetup {
  methods: RecoveryMethod[];
  phraseHash?: string;
  phrase?: string; // Only returned once during setup, never stored
  pinHash?: string;
  securityQuestions?: SecurityQuestion[];
}

/**
 * Generate a 12-word BIP39-style recovery phrase
 */
export async function generateRecoveryPhrase(): Promise<string> {
  const words: string[] = [];
  
  // Generate 12 random words
  for (let i = 0; i < 12; i++) {
    const randomBytes = await Crypto.getRandomBytesAsync(2);
    const randomIndex = (randomBytes[0] << 8 | randomBytes[1]) % BIP39_WORDLIST.length;
    words.push(BIP39_WORDLIST[randomIndex]);
  }
  
  return words.join(' ');
}

/**
 * Hash recovery phrase for storage
 */
export async function hashRecoveryPhrase(phrase: string): Promise<string> {
  // Normalize: lowercase, trim, single spaces
  const normalized = phrase.toLowerCase().trim().replace(/\s+/g, ' ');
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalized
  );
}

/**
 * Verify recovery phrase against stored hash
 */
export async function verifyRecoveryPhrase(
  phrase: string,
  storedHash: string
): Promise<boolean> {
  const phraseHash = await hashRecoveryPhrase(phrase);
  return phraseHash === storedHash;
}

/**
 * Hash recovery PIN (4-6 digits)
 */
export async function hashRecoveryPin(pin: string): Promise<string> {
  // Add salt to prevent rainbow table attacks
  const salt = 'docsshelf_recovery_pin_v1';
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + pin
  );
}

/**
 * Verify recovery PIN
 */
export async function verifyRecoveryPin(
  pin: string,
  storedHash: string
): Promise<boolean> {
  const pinHash = await hashRecoveryPin(pin);
  return pinHash === storedHash;
}

/**
 * Validate PIN format (4-6 digits)
 */
export function validatePinFormat(pin: string): { valid: boolean; error?: string } {
  if (!pin || pin.length < 4 || pin.length > 6) {
    return { valid: false, error: 'PIN must be 4-6 digits' };
  }
  if (!/^\d+$/.test(pin)) {
    return { valid: false, error: 'PIN must contain only numbers' };
  }
  // Check for weak PINs
  if (pin === '0000' || pin === '1111' || pin === '1234' || pin === '4321') {
    return { valid: false, error: 'PIN is too weak. Avoid common patterns.' };
  }
  return { valid: true };
}

/**
 * Predefined security questions
 */
export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was the name of your elementary school?",
  "What is your mother's maiden name?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you live on in third grade?",
  "What was your favorite food as a child?",
  "What year was your father born?",
  "What is your oldest sibling's middle name?",
];

/**
 * Hash security question answer
 */
export async function hashSecurityAnswer(answer: string): Promise<string> {
  // Normalize: lowercase, trim, remove extra spaces and punctuation
  const normalized = answer
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
  
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalized
  );
}

/**
 * Verify security question answer
 */
export async function verifySecurityAnswer(
  answer: string,
  storedHash: string
): Promise<boolean> {
  const answerHash = await hashSecurityAnswer(answer);
  return answerHash === storedHash;
}

/**
 * Validate security questions setup
 */
export function validateSecurityQuestions(
  questions: SecurityQuestion[]
): { valid: boolean; error?: string } {
  if (!questions || questions.length < 2) {
    return { valid: false, error: 'Please select at least 2 security questions' };
  }
  
  // Check for duplicate questions
  const questionTexts = questions.map(q => q.question);
  const uniqueQuestions = new Set(questionTexts);
  if (uniqueQuestions.size !== questionTexts.length) {
    return { valid: false, error: 'Please select different questions' };
  }
  
  return { valid: true };
}

/**
 * Get user-friendly recovery method names
 */
export function getRecoveryMethodName(method: RecoveryMethod): string {
  switch (method) {
    case 'phrase':
      return 'Recovery Phrase (12 words)';
    case 'pin':
      return 'Recovery PIN (4-6 digits)';
    case 'questions':
      return 'Security Questions (2 questions)';
    default:
      return 'Unknown method';
  }
}

/**
 * Get warning message for recovery setup
 */
export function getRecoveryWarningMessage(methods: RecoveryMethod[]): string {
  const methodNames = methods.map(m => getRecoveryMethodName(m)).join(' and ');
  
  return `⚠️ CRITICAL: Save Your Recovery Information

You have selected ${methodNames} for password recovery.

${methods.includes('phrase') ? '\n📝 Recovery Phrase:\n• Write it down on paper\n• Store it in a safe place\n• Never share it with anyone\n• You CANNOT recover it later\n' : ''}
${methods.includes('pin') ? '\n🔢 Recovery PIN:\n• Memorize your PIN\n• Do NOT use common patterns (1234, etc.)\n• Cannot be changed later\n' : ''}
${methods.includes('questions') ? '\n❓ Security Questions:\n• Remember your exact answers\n• Answers are case-insensitive\n• Used for password recovery\n' : ''}

🚨 WITHOUT THIS INFORMATION, YOU CANNOT RECOVER YOUR PASSWORD
🔒 We cannot help you recover it - this is a zero-knowledge system
💾 All your encrypted documents will be permanently inaccessible

Please confirm you have safely stored your recovery information.`;
}

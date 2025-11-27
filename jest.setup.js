global.__DEV__ = true;

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    withTransactionAsync: jest.fn((callback) => callback()),
  })),
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }),
  digestStringAsync: jest.fn(async (algorithm, data, options) => {
    // Mock SHA-512 hash - deterministic for testing
    const hash = Array.from({ length: 128 }, (_, i) => 
      ((i + data.charCodeAt(i % data.length)) % 16).toString(16)
    ).join('');
    return hash;
  }),
  CryptoDigestAlgorithm: {
    SHA512: 'SHA-512',
    SHA256: 'SHA-256',
    SHA1: 'SHA-1',
    MD5: 'MD5',
  },
  CryptoEncoding: {
    HEX: 'hex',
    BASE64: 'base64',
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
  Stack: {
    Screen: 'Stack.Screen',
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
}));

// Mock expo-file-system/legacy
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  moveAsync: jest.fn(),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

// Mock jszip
jest.mock('jszip', () => {
  return jest.fn().mockImplementation(() => ({
    file: jest.fn().mockReturnThis(),
    folder: jest.fn().mockReturnThis(),
    generateAsync: jest.fn(() => Promise.resolve('mockzipbase64')),
    loadAsync: jest.fn(() => Promise.resolve({
      file: jest.fn(),
      folder: jest.fn(),
      files: {},
    })),
  }));
});

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'file:///mock/document.pdf',
      name: 'document.pdf',
      size: 1024,
      mimeType: 'application/pdf',
    }],
  })),
}));

// Mock react-native-toast-notifications
jest.mock('react-native-toast-notifications', () => ({
  ToastProvider: 'ToastProvider',
  useToast: () => ({
    show: jest.fn(),
    hide: jest.fn(),
    hideAll: jest.fn(),
  }),
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1])),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => {
  const mockStore = new Map();
  return {
    getItemAsync: jest.fn(async (key) => mockStore.get(key) || null),
    setItemAsync: jest.fn(async (key, value) => {
      mockStore.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key) => {
      mockStore.delete(key);
    }),
  };
});

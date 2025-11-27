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
  getRandomBytes: jest.fn((length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }),
  digestStringAsync: jest.fn((algorithm, data) => {
    // Mock SHA-512 hash
    return Promise.resolve('a'.repeat(128)); // 128 hex chars for SHA-512
  }),
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

// Mock react-native-toast-notifications
jest.mock('react-native-toast-notifications', () => ({
  ToastProvider: 'ToastProvider',
  useToast: () => ({
    show: jest.fn(),
    hide: jest.fn(),
    hideAll: jest.fn(),
  }),
}));

// Detox Jest configuration for E2E tests (migrated)
module.exports = {
  preset: 'jest-expo',
  testTimeout: 120000,
  testMatch: ['**/?(*.)+(e2e).[jt]s?(x)'],
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|expo|@expo|@unimodules)/)'
    ],
  transform: {
    '^node_modules/@react-native/.+\\.js$': 'ts-jest',
  },
};

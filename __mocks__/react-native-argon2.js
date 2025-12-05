/**
 * Mock for react-native-argon2
 * Used for password hashing in tests
 */

export const argon2 = jest.fn((password, salt, options) => 
  Promise.resolve({ 
    encodedHash: 'mockedHash_' + password.substring(0, 10),
    rawHash: new Uint8Array(32),
  })
);

export default {
  argon2,
};

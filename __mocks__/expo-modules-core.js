// Mock expo-modules-core
module.exports = {
  EventEmitter: class EventEmitter {},
  NativeModule: class NativeModule {},
  SharedObject: class SharedObject {},
  SharedRef: class SharedRef {},
  requireNativeModule: jest.fn(() => ({})),
  registerWebModule: jest.fn(),
};

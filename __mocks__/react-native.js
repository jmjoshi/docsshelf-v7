// Mock React Native for Jest tests
const react = require('react');

// Mock all React Native modules
module.exports = {
  // Core
  Platform: {
    OS: 'ios',
    Version: '14.0',
    select: (obj) => obj.ios || obj.default,
  },
  
  // Components
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  TouchableHighlight: 'TouchableHighlight',
  Image: 'Image',
  Button: 'Button',
  
  // StyleSheet
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
  },
  
  // Dimensions
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  // Alert
  Alert: {
    alert: jest.fn(),
  },
  
  // Animated
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback()),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback()),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(),
    })),
  },
  
  // SafeAreaView
  SafeAreaView: 'SafeAreaView',
  
  // ActivityIndicator
  ActivityIndicator: 'ActivityIndicator',
  
  // Share
  Share: {
    share: jest.fn(() => Promise.resolve()),
  },
  
  // NativeModules
  NativeModules: {},
  
  // NativeEventEmitter
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
};

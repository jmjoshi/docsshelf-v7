const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure resolver to handle jszip's Node.js dependencies
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    // Polyfills for Node.js core modules used by jszip
    stream: require.resolve('readable-stream'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
  },
};

module.exports = config;

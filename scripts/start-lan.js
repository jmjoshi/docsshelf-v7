#!/usr/bin/env node

/**
 * Start Expo with LAN IP detection for development
 * This script only affects the dev server, not production builds
 */

const { execSync } = require('child_process');
const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  // Find the first non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (i.e., 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  // Fallback to localhost if no external IP found
  return '127.0.0.1';
}

// Get the local IP address
const localIP = getLocalIPAddress();

console.log(`🌐 Starting Expo with LAN IP: ${localIP}`);
console.log('📱 This allows connections from devices on your local network\n');

// Set the environment variable and start Expo
process.env.REACT_NATIVE_PACKAGER_HOSTNAME = localIP;

// Pass through any additional command line arguments
const args = process.argv.slice(2).join(' ');
const command = `npx expo start ${args}`;

try {
  execSync(command, { stdio: 'inherit', env: process.env });
} catch (error) {
  process.exit(error.status || 1);
}

/**
 * Build Number Increment Script
 * 
 * Automatically increments build numbers across:
 * - version.json (buildNumber)
 * - app.json (android.versionCode)
 * - package.json (version if needed)
 * 
 * Usage:
 *   node scripts/increment-build.js [major|minor|patch]
 * 
 * Examples:
 *   node scripts/increment-build.js          # Increment build number only
 *   node scripts/increment-build.js patch    # Increment patch version (1.0.0 -> 1.0.1)
 *   node scripts/increment-build.js minor    # Increment minor version (1.0.0 -> 1.1.0)
 *   node scripts/increment-build.js major    # Increment major version (1.0.0 -> 2.0.0)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// File paths
const VERSION_FILE = path.join(__dirname, '../version.json');
const APP_JSON_FILE = path.join(__dirname, '../app.json');
const PACKAGE_JSON_FILE = path.join(__dirname, '../package.json');

// Read files
const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
const appJson = JSON.parse(fs.readFileSync(APP_JSON_FILE, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE, 'utf8'));

// Get command line argument
const versionType = process.argv[2]; // major, minor, patch, or undefined

// Get git commit hash
let gitCommit = '';
try {
  gitCommit = execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
  console.warn('Warning: Could not get git commit hash');
  gitCommit = 'unknown';
}

// Increment version if specified
if (versionType) {
  const [major, minor, patch] = versionData.version.split('.').map(Number);
  
  switch (versionType) {
    case 'major':
      versionData.version = `${major + 1}.0.0`;
      break;
    case 'minor':
      versionData.version = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      versionData.version = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      console.error('Invalid version type. Use: major, minor, or patch');
      process.exit(1);
  }
  
  // Update package.json and app.json versions
  packageJson.version = versionData.version;
  appJson.expo.version = versionData.version;
  
  console.log(`✅ Version incremented to: ${versionData.version}`);
}

// Increment build number
const oldBuildNumber = parseInt(versionData.buildNumber);
const newBuildNumber = oldBuildNumber + 1;
versionData.buildNumber = newBuildNumber.toString();

// Increment Android versionCode
appJson.expo.android.versionCode = newBuildNumber;

// Update build metadata
versionData.buildDate = new Date().toISOString();
versionData.gitCommit = gitCommit;

// Write updated files
fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2) + '\n');
fs.writeFileSync(APP_JSON_FILE, JSON.stringify(appJson, null, 2) + '\n');

if (versionType) {
  fs.writeFileSync(PACKAGE_JSON_FILE, JSON.stringify(packageJson, null, 2) + '\n');
}

// Display summary
console.log('\n📦 Build Information Updated\n');
console.log(`Version:      ${versionData.version}`);
console.log(`Build Number: ${newBuildNumber} (was ${oldBuildNumber})`);
console.log(`Build Date:   ${new Date(versionData.buildDate).toLocaleString()}`);
console.log(`Git Commit:   ${gitCommit}`);
console.log(`Build Type:   ${versionData.buildType}`);
console.log('\nUpdated files:');
console.log(`  ✓ ${VERSION_FILE}`);
console.log(`  ✓ ${APP_JSON_FILE} (android.versionCode)`);
if (versionType) {
  console.log(`  ✓ ${PACKAGE_JSON_FILE}`);
}
console.log('\n💡 Remember to commit these changes before building!\n');

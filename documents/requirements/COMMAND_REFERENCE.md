# DocsShelf Development Command Reference
**Project:** DocsShelf v7 - Secure Document Management App  
**Framework:** React Native + Expo (SDK 54)  
**Last Updated:** November 13, 2025

This document captures all essential commands used during the development of DocsShelf v7, organized by category for future reference.

---

## 📦 Package Management

### Install Dependencies
```powershell
# Install all packages from package.json
npm install

# Install specific production dependency
npm install <package-name>

# Install specific dev dependency
npm install -D <package-name>

# Update packages to latest compatible versions
npm update

# Check for outdated packages
npm outdated
```

### Package Installations During Development
```powershell
# Redux state management
npm install @reduxjs/toolkit react-redux

# Document management
npm install expo-document-picker expo-file-system expo-image-picker

# Encryption
npm install aes-js

# TOTP/MFA
npm install jsotp hi-base32

# QR Code generation
npm install react-native-qrcode-svg react-native-svg

# SQLite database
npm install expo-sqlite

# Secure storage
npm install expo-secure-store

# Biometric authentication
npm install expo-local-authentication
```

---

## 🚀 Development Server

### Start Development Server
```powershell
# Start Expo development server
npm start

# Start with cache cleared (RECOMMENDED - use this by default)
npx expo start --clear

# Start in offline mode (bypass version checks)
npx expo start --offline

# Start in tunnel mode (for network issues)
npx expo start --tunnel

# Start fresh (clear Metro bundler and all caches)
Remove-Item -Recurse -Force .expo, node_modules\.cache; npx expo start --clear
```

### Platform-Specific Launches
```powershell
# Open on Android emulator (press 'a' in terminal)
# OR
npx react-native run-android

# Open on iOS simulator (Mac only, press 'i' in terminal)
# OR
npx react-native run-ios

# Open in web browser (press 'w' in terminal)
```

### Development Server Commands
While `npm start` is running:
- `r` - Reload app
- `R` (Shift+R) - Reload and clear cache
- `a` - Open on Android
- `i` - Open on iOS
- `w` - Open in web browser
- `j` - Open debugger
- `m` - Toggle developer menu
- `Shift+M` - More dev tools
- `?` - Show all commands
- `Ctrl+C` - Stop server

---

## 🔍 Code Quality & Type Checking

### TypeScript Compilation
```powershell
# Check for TypeScript errors (no emit)
npx tsc --noEmit

# Watch mode for continuous type checking
npx tsc --noEmit --watch

# Type check specific file
npx tsc --noEmit <file-path>
```

### Linting
```powershell
# Run ESLint on all files
npx eslint .

# Run ESLint with auto-fix
npx eslint . --fix

# Lint specific files
npx eslint app/_layout.tsx src/contexts/AuthContext.tsx

# Lint and fix specific files
npx eslint app/_layout.tsx --fix
```

---

## 🧪 Testing

### Unit Tests (Jest)
```powershell
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- passwordValidator.test.ts

# Run tests with coverage
npm test -- --coverage
```

### E2E Tests (Detox)
```powershell
# Build app for E2E testing
npm run test:e2e:build

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- --testNamePattern="Registration"
```

---

## 🗄️ Database Management

### SQLite Operations
```powershell
# Database is managed automatically by expo-sqlite
# Schema migrations happen on app launch
# Check src/services/database/dbInit.ts for version management

# To reset database, clear app data:
# Android:
adb shell pm clear host.exp.exponent

# iOS:
# Delete app from simulator and reinstall
```

---

## 📱 Android Emulator Commands

### ADB (Android Debug Bridge)
```powershell
# List connected devices
adb devices

# Clear app data (reset database)
adb shell pm clear host.exp.exponent

# Clear app cache
adb shell pm clear --cache host.exp.exponent

# Uninstall app
adb uninstall host.exp.exponent

# Install APK
adb install <path-to-apk>

# View logcat (Android logs)
adb logcat

# Filter logcat by tag
adb logcat -s ReactNativeJS

# Screenshot device
adb exec-out screencap -p > screenshot.png

# Record screen
adb shell screenrecord /sdcard/recording.mp4
```

### Emulator Management
```powershell
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd <emulator-name>

# Start emulator with wipe data (clean slate)
emulator -avd <emulator-name> -wipe-data
```

---

## 🐛 Debugging & Troubleshooting

### Clear Caches
```powershell
# Clear Metro bundler cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Delete and reinstall node_modules
Remove-Item -Recurse -Force node_modules
npm install

# Clear Expo cache
Remove-Item -Recurse -Force .expo

# Clear all caches (nuclear option)
Remove-Item -Recurse -Force node_modules, .expo, node_modules\.cache
npm install
```

### Metro Bundler Issues
```powershell
# Kill any process using port 8081
Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process -Force

# Alternative: Find and kill process
netstat -ano | findstr :8081
taskkill /PID <process-id> /F

# Start with clean slate
npx expo start --clear --reset-cache
```

### React Native Debugging
```powershell
# Enable remote JS debugging (shake device or Ctrl+M in emulator)
# Then select "Debug JS Remotely"

# Open React Native debugger
# Install: choco install react-native-debugger
react-native-debugger

# View element inspector (shake device, select "Toggle Inspector")
```

---

## 📝 Git Version Control

### Basic Git Commands
```powershell
# Check status of files
git status

# View changes
git diff

# View changes for specific file
git diff <file-path>

# Stage all changes
git add -A

# Stage specific file
git add <file-path>

# Commit with message
git commit -m "feat: description of changes"

# Push to remote
git push origin master

# Pull latest changes
git pull origin master

# View commit history
git log --oneline -10

# View detailed commit history
git log --stat

# Create new branch
git checkout -b feature-branch-name

# Switch branches
git checkout master

# Merge branch
git merge feature-branch-name
```

### Git Tagging for Releases
```powershell
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# List tags
git tag

# Push tags to remote
git push origin --tags

# Delete tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

### Viewing Changes
```powershell
# View unstaged changes
git diff

# View staged changes
git diff --cached

# View changes between commits
git diff commit1 commit2

# View changes for specific file
git diff HEAD -- <file-path>
```

---

## 🏗️ Build & Deployment

### Development Builds
```powershell
# Build for Android development
npx eas build --profile development --platform android

# Build for iOS development (Mac only)
npx eas build --profile development --platform ios

# Build for both platforms
npx eas build --profile development --platform all
```

### Production Builds
```powershell
# Build Android APK for testing
npx eas build --profile preview --platform android

# Build production Android AAB for Play Store
npx eas build --profile production --platform android

# Build production iOS for App Store (Mac only)
npx eas build --profile production --platform ios
```

### Local Builds
```powershell
# Build Android APK locally (requires Android SDK)
npx expo run:android --variant release

# Build iOS locally (Mac only, requires Xcode)
npx expo run:ios --configuration Release
```

---

## 📊 Performance & Optimization

### Bundle Analysis
```powershell
# Analyze bundle size
npx expo export --platform android
npx react-native-bundle-visualizer

# Check for large dependencies
npx depcheck

# List all installed packages with sizes
npm list --depth=0
```

### Performance Profiling
```powershell
# Enable performance monitor (shake device)
# Select "Perf Monitor"

# Profile rendering performance
# In Chrome DevTools (when remote debugging):
# Performance tab → Record → Stop → Analyze
```

---

## 🔐 Security & Credentials

### Environment Variables
```powershell
# Create .env file for sensitive data (never commit!)
# Example .env:
API_KEY=your-api-key-here
SECRET_KEY=your-secret-key-here

# Load environment variables (using expo-constants)
# Access in code: Constants.expoConfig.extra.API_KEY
```

### Secure Storage
```powershell
# Credentials are stored using expo-secure-store
# No manual commands needed - handled in code
# Storage location:
# - Android: EncryptedSharedPreferences
# - iOS: Keychain
```

---

## 📚 Documentation

### Generate Documentation
```powershell
# Generate TypeScript documentation (if using TypeDoc)
npx typedoc --out docs src

# Generate API documentation (if using JSDoc)
npx jsdoc -c jsdoc.json
```

---

## 🛠️ Common Development Workflows

### Starting Fresh Development Session
```powershell
# 1. Pull latest changes
git pull origin master

# 2. Install any new dependencies
npm install

# 3. Check for TypeScript errors
npx tsc --noEmit

# 4. Start development server
npx expo start --clear

# 5. Open on device (press 'a' or 'i')
```

### Before Committing Changes
```powershell
# 1. Check TypeScript errors
npx tsc --noEmit

# 2. Run linter
npx eslint . --fix

# 3. Run tests
npm test

# 4. Check git status
git status

# 5. Stage and commit
git add -A
git commit -m "feat: description"

# 6. Push to remote
git push origin master
```

### Fixing Stuck/Frozen App

**Android Emulator:**
```powershell
# 1. Clear app data on device
adb shell pm clear host.exp.exponent

# 2. Stop Metro bundler (Ctrl+C)

# 3. Clear all caches
npx expo start --clear

# 4. If still stuck, wipe emulator data
emulator -avd Pixel_5 -wipe-data

# 5. Restart development server
npx expo start --clear
```

**iOS Physical Device:**
```
See: documents/IOS_CLEANUP_GUIDE.md for complete instructions

Quick reset:
1. Force quit Expo Go (swipe up, swipe away)
2. On dev machine: Ctrl+C, then npx expo start --clear
3. Reopen Expo Go and scan QR code

Complete reset:
1. Delete Expo Go app from iPhone
2. Reinstall from App Store
3. Run: npx expo start --clear
4. Scan QR code
```

### Resolving Metro Bundler Errors
```powershell
# 1. Stop server (Ctrl+C)

# 2. Clear Metro cache
Remove-Item -Recurse -Force node_modules\.cache

# 3. Clear Expo cache
Remove-Item -Recurse -Force .expo

# 4. Clear watchman cache (if installed)
watchman watch-del-all

# 5. Reinstall node_modules
Remove-Item -Recurse -Force node_modules
npm install

# 6. Start fresh
npx expo start --clear
```

---

## 🔄 Migration & Updates

### Upgrading Expo SDK
```powershell
# Check current version
npx expo --version

# Upgrade to latest Expo SDK
npx expo install expo@latest

# Upgrade all Expo packages
npx expo install --fix

# Check for incompatible packages
npx expo-doctor
```

### Updating React Native
```powershell
# Update React Native (Expo manages this)
npx expo install react-native@latest

# Update React
npx expo install react@latest react-dom@latest
```

---

## 📋 Project-Specific Commands

### Database Schema Migrations
```powershell
# Schema version is managed in src/services/database/dbInit.ts
# Migrations run automatically on app launch
# To force migration, increment version number in dbInit.ts

# Current schema version: 3
# v1: Initial schema
# v2: Added category parent_id and sort_order
# v3: Added document HMAC fields for encryption
```

### Feature Development Workflow
```powershell
# 1. Read feature requirements
# Check: documents/requirements/prd.md
# Check: documents/requirements/FEATURE_DEVELOPMENT_ROADMAP.md

# 2. Create feature branch
git checkout -b feature/FR-MAIN-XXX

# 3. Implement feature
# - Create types in src/types/
# - Create service in src/services/database/
# - Create Redux slice in src/store/slices/
# - Create screen component in src/screens/
# - Create route in app/

# 4. Test feature
npx tsc --noEmit
npm test

# 5. Commit and document
git add -A
git commit -m "feat: FR-MAIN-XXX description"

# 6. Update context document
# Edit: DEVELOPMENT_CONTEXT.md

# 7. Create changelog entry
# Create: documents/changelog/YYYY-MM-DD-feature-name.md

# 8. Push and merge
git push origin feature/FR-MAIN-XXX
```

---

## 🎯 Quick Reference

### Most Used Commands
```powershell
# Start development
npm start

# Type check
npx tsc --noEmit

# Clear everything and restart
npx expo start --clear

# Reset app data
adb shell pm clear host.exp.exponent

# Commit changes
git add -A && git commit -m "message" && git push
```

### Emergency Fixes
```powershell
# App won't start
Remove-Item -Recurse -Force node_modules, .expo
npm install
npx expo start --clear

# Metro bundler stuck
Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process -Force
npx expo start --clear

# Database corrupted
adb shell pm clear host.exp.exponent

# TypeScript errors overwhelming
npx tsc --noEmit > errors.txt
# Review errors.txt and fix systematically
```

---

## 📖 Additional Resources

### Official Documentation
- **Expo:** https://docs.expo.dev/
- **React Native:** https://reactnative.dev/docs/getting-started
- **expo-router:** https://docs.expo.dev/router/introduction/
- **Redux Toolkit:** https://redux-toolkit.js.org/
- **TypeScript:** https://www.typescriptlang.org/docs/

### Project-Specific Docs
- `DEVELOPMENT_CONTEXT.md` - Complete project context
- `documents/requirements/prd.md` - Product requirements
- `documents/requirements/technical_requirements.md` - Technical specs
- `documents/requirements/FEATURE_DEVELOPMENT_ROADMAP.md` - Feature roadmap

---

**Note:** This document is maintained and updated with each development session. Always refer to the latest version in the repository.

**Last Command Reference Update:** November 13, 2025

# DocsShelf Development Workflow Guide

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Understanding the Build Types](#understanding-the-build-types)
3. [One-Time Setup](#one-time-setup)
4. [Daily Development Workflow](#daily-development-workflow)
5. [Production Build Process](#production-build-process)
6. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Daily Development Commands
```bash
# Start development on physical device (RECOMMENDED)
npx expo run:android --device

# Start development on emulator
npx expo run:android

# Clear cache and rebuild
npx expo run:android --device --no-build-cache

# Production test build
npx expo run:android --variant release --no-bundler --device
```

### One-Time Setup Commands
```bash
# 1. Remove Expo Development Client (if installed)
npm uninstall expo-dev-client

# 2. Install missing native dependencies
npm install react-native-blob-util

# 3. Fix any dependency issues
npx expo install --fix

# 4. Clean and rebuild Android project
cd android
./gradlew clean
cd ..
npx expo prebuild --clean

# 5. First build (this will take 3-5 minutes)
npx expo run:android --device
```

### Quick Device Setup
```bash
# Check connected devices
adb devices

# Clear app data
adb -s <DEVICE_ID> shell pm clear com.docsshelf.app

# Uninstall app
adb -s <DEVICE_ID> uninstall com.docsshelf.app
```

---

## Understanding the Build Types

### 1. Expo Go / Development Client ❌ (NOT RECOMMENDED FOR THIS PROJECT)
**What it is:**
- Generic container app that loads your JavaScript over the network
- Limited to Expo SDK modules only
- Cannot use custom native modules

**Why we DON'T use it:**
- ❌ `react-native-pdf` and `react-native-blob-util` won't work
- ❌ Different behavior from production
- ❌ Requires workarounds and temporary fixes
- ❌ Not suitable for apps with custom native dependencies

### 2. Local Native Debug Build ✅ (RECOMMENDED FOR DEVELOPMENT)
**What it is:**
- Full native Android app with all modules compiled in
- Connects to Metro bundler for Fast Refresh
- Installs actual APK on your device

**Why we use it:**
- ✅ All native modules work properly (PDF viewer, file system, etc.)
- ✅ Fast Refresh enabled for quick development
- ✅ Identical to production build except for debugging features
- ✅ Real device testing with actual behavior
- ✅ Proper error messages and debugging

**How it works:**
1. Gradle compiles all native modules into APK
2. APK installs on device (takes 2-3 minutes first time)
3. Metro bundler starts and serves JavaScript
4. App connects to Metro for hot reload
5. You edit code → changes appear in ~1 second

### 3. Local Native Release Build ✅ (FOR PRODUCTION TESTING)
**What it is:**
- Production-ready APK with JavaScript bundled inside
- No Metro connection needed
- Optimized and minified

**Why we use it:**
- ✅ Exact production behavior
- ✅ Performance testing
- ✅ Distribution to testers
- ✅ Final QA before Play Store

---

## One-Time Setup

### Prerequisites Check
Before starting, ensure you have:
- ✅ Node.js (v18 or higher)
- ✅ JDK 17 (set JAVA_HOME)
- ✅ Android Studio installed
- ✅ Android SDK Platform 36
- ✅ Android Build Tools 36.0.0
- ✅ Physical Android device OR emulator
- ✅ USB Debugging enabled on device

### Step 1: Remove Expo Development Client

**What we're doing:** Uninstalling the development client that causes native module issues

```bash
npm uninstall expo-dev-client
```

**Why:** `expo-dev-client` is designed for rapid prototyping but doesn't support all native modules properly. For production apps with custom native dependencies, we use direct native builds instead.

**Expected output:**
```
removed 1 package, and audited 1233 packages in 2s
```

**Note:** If this package isn't installed, you'll see "npm WARN uninstall not installed" - that's fine, just continue to the next step.

### Step 2: Install Missing Native Dependencies

**What we're doing:** Installing native modules that DocsShelf needs

```bash
npm install react-native-blob-util
```

**Why:** `react-native-pdf` depends on `react-native-blob-util` for file handling. Without it, PDF viewing crashes.

**Expected output:**
```
added 1 package, and audited 1234 packages in 3s
```

### Step 3: Fix Dependency Compatibility

**What we're doing:** Ensuring all Expo packages are compatible versions

```bash
npx expo install --fix
```

**Why:** This checks all dependencies and updates them to versions that work together with your Expo SDK version (54).

**Expected output:**
```
✔ No package version changes are needed.
```
or
```
✔ Updated X packages
```

### Step 4: Clean Existing Build Artifacts

**What we're doing:** Removing old build files that might cause conflicts

```bash
cd android
./gradlew clean
cd ..
```

**Why:** Old compiled native modules can cause linking errors. Clean slate prevents issues.

**Expected output:**
```
BUILD SUCCESSFUL in 5s
```

### Step 5: Regenerate Native Android Project

**What we're doing:** Rebuilding Android project with all native modules properly configured

```bash
npx expo prebuild --clean
```

**Why:** This updates `android/` folder to include all native modules, updates gradle configs, and links everything properly.

**What happens:**
1. Reads your `app.json` configuration
2. Generates/updates `android/app/build.gradle`
3. Links all native modules (react-native-pdf, react-native-blob-util, etc.)
4. Updates AndroidManifest.xml with permissions
5. Configures build settings

**Expected output:**
```
› Prebuild
✔ Generated native projects | gitignore skipped
```

**⚠️ Important:** Review any prompts about overwriting files - generally choose "Yes" to use latest configuration.

### Step 6: First Build

**What we're doing:** Building the complete Android APK with all native code

```bash
npx expo run:android --device
```

**Why:** This compiles all Java/Kotlin native code, links libraries, and creates the debug APK.

**What happens:**
1. Gradle downloads dependencies (first time only, ~500MB)
2. Compiles 60+ native modules
3. Links all libraries
4. Creates debug APK
5. Installs APK on your device
6. Starts Metro bundler
7. Opens app on device

**Expected duration:** 3-5 minutes (first time), 30-60 seconds (subsequent builds)

**Expected output:**
```
› Building app...
BUILD SUCCESSFUL in 3m 24s
› Installing C:\Projects\docsshelf-v7\android\app\build\outputs\apk\debug\app-debug.apk
› Opening docsshelfv7://expo-development-client/?url=http://10.0.0.83:8081
```

---

## Daily Development Workflow

### Typical Development Session

**1. Connect Your Device**
```bash
# Check device is connected
adb devices
```

**Expected output:**
```
List of devices attached
R9ZX90HXSVA     device
```

**2. Start Development**
```bash
npx expo run:android --device
```

**What happens:**
- ✅ Checks if code changed → rebuilds if needed (30-60 sec)
- ✅ Checks if native code changed → recompiles if needed
- ✅ Installs updated APK
- ✅ Starts Metro bundler
- ✅ Opens app on device
- ✅ Enables Fast Refresh

**3. Make Code Changes**

Edit any `.tsx`, `.ts` files → **Changes appear automatically** in ~1 second

**Fast Refresh works for:**
- ✅ Component code changes
- ✅ Styling changes
- ✅ Logic changes
- ✅ Adding/removing components

**Requires app restart:**
- ⚠️ Native code changes (Java/Kotlin)
- ⚠️ Adding new native dependencies
- ⚠️ Changing app.json
- ⚠️ Environment variable changes

**4. When You Need Full Rebuild**

If you change native code or add native dependencies:
```bash
# Press 'r' in Metro terminal to reload JavaScript
# OR
# Stop and restart: npx expo run:android --device
```

### Testing on Multiple Devices

**List all devices:**
```bash
adb devices
```

**Install on specific device:**
```bash
npx expo run:android --device
# Select device from menu
```

**Or specify device directly:**
```bash
adb -s R9ZX90HXSVA install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Production Build Process

### Creating Production APK

**Step 1: Build Release APK**
```bash
npx expo run:android --variant release --no-bundler
```

**What this does:**
- ✅ Bundles JavaScript into APK (no Metro needed)
- ✅ Minifies code for smaller size
- ✅ Optimizes performance
- ✅ Creates standalone APK
- ✅ Signs with debug key (for testing)

**Output location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

**Step 2: Install on Device**
```bash
adb -s <DEVICE_ID> install android/app/build/outputs/apk/release/app-release.apk
```

**Step 3: Test Standalone**
- ❌ Close Metro bundler
- ❌ Disconnect device from computer
- ✅ App should work completely offline
- ✅ Test all features thoroughly

### Production Build Checklist

Before releasing:
- [ ] Test app completely offline (no Metro)
- [ ] Test on multiple Android versions
- [ ] Test all native features (PDF viewer, camera, file picker)
- [ ] Check app performance
- [ ] Verify database migrations
- [ ] Test login/registration flow
- [ ] Test document upload/download
- [ ] Test backup/restore functionality
- [ ] Verify all settings screens
- [ ] Check dark mode support

---

## Troubleshooting

### Issue: "Cannot read property 'getConstants' of null"

**Cause:** Native module not properly linked

**Solution:**
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android --device
```

### Issue: "BUILD FAILED" - Could not resolve all files for configuration

**Cause:** Gradle can't download dependencies

**Solution:**
```bash
# Check internet connection
# Clear Gradle cache
cd android
./gradlew clean --refresh-dependencies
cd ..
npx expo run:android --device
```

### Issue: "Installation failed with message INSTALL_FAILED_UPDATE_INCOMPATIBLE"

**Cause:** Trying to install over existing app with different signature

**Solution:**
```bash
# Uninstall existing app
adb -s <DEVICE_ID> uninstall com.docsshelf.app
# Then rebuild
npx expo run:android --device
```

### Issue: "More than one device/emulator"

**Cause:** Multiple devices connected

**Solution:**
```bash
# List devices
adb devices
# Use --device flag and select from menu
npx expo run:android --device
```

### Issue: "Database is locked" errors

**Cause:** Multiple instances or corrupted database

**Solution:**
```bash
# Clear app data
adb -s <DEVICE_ID> shell pm clear com.docsshelf.app
# Restart app
```

### Issue: Metro bundler port already in use

**Cause:** Previous Metro instance still running

**Solution:**
```bash
# Kill process on port 8081 (PowerShell)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue
# Then restart
npx expo run:android --device
```

### Issue: "JAVA_HOME is not set"

**Cause:** JDK not configured

**Solution:**
```powershell
# Set JAVA_HOME (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

### Issue: Changes not appearing

**Solutions:**
1. Press 'r' in Metro terminal (reload JavaScript)
2. Shake device → "Reload"
3. If still not working: Stop and `npx expo run:android --device`

---

## Best Practices

### ✅ DO:
- Use `npx expo run:android --device` for all development
- Test on physical device regularly
- Keep Metro bundler running during development
- Clear app data when testing database changes
- Test production builds before releasing

### ❌ DON'T:
- Use Expo Go for this project
- Mix development approaches (stick to one)
- Ignore native build errors
- Skip testing on physical devices
- Forget to clear cache when things break

---

## Summary

**For Development:**
```bash
npx expo run:android --device
```
- Full native modules ✅
- Fast Refresh ✅
- Real device testing ✅
- Consistent with production ✅

**For Production:**
```bash
npx expo run:android --variant release --no-bundler --device
```
- Standalone APK ✅
- No Metro needed ✅
- Ready for distribution ✅

This approach eliminates the inconsistencies between development and production, provides proper native module support, and ensures a smooth development experience.

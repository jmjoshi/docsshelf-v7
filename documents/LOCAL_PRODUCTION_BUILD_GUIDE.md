# Local Production Build Guide for DocsShelf v1.0

**Date Created**: November 27, 2025  
**Status**: Build configuration complete - Network connectivity required for dependency download

---

## 🎯 Overview

This guide provides instructions for creating local production builds of DocsShelf for testing on physical devices without using EAS Build cloud service.

## ✅ Build Configuration Status

### Completed Setup
- ✅ **Release Keystore Generated**: `android/app/release.keystore`
- ✅ **Signing Configuration**: Configured in `build.gradle`
- ✅ **Build Type**: Release build with production optimizations
- ✅ **Keystore Details**:
  - Store Password: `docsshelf2025`
  - Key Alias: `docsshelf-release`
  - Key Password: `docsshelf2025`
  - Validity: 10,000 days
  - Key Algorithm: RSA 2048-bit

### Security Note
⚠️ **Important**: The keystore credentials are for local testing only. For App Store/Play Store submission:
1. Generate a new production keystore with secure credentials
2. Store credentials in secure password manager
3. Never commit keystores to version control
4. Back up keystore in secure location

---

## 📱 Android Production Build

### Prerequisites
- ✅ Java Development Kit (JDK) 17+
- ✅ Android SDK with Build Tools 36.0.0
- ✅ Gradle (included in project)
- ⚠️ **Internet connectivity to Maven Central and JitPack repositories**

### Network Requirements
The build requires access to:
- `repo.maven.apache.org` (Maven Central)
- `www.jitpack.io` (JitPack for AndroidPdfViewer)
- `dl.google.com` (Google Maven)

### Build Commands

#### Option 1: Build Release APK (Recommended for Testing)
```powershell
cd c:\projects\docsshelf-v7\android
.\gradlew assembleRelease
```

**Output Location**: `android/app/build/outputs/apk/release/app-release.apk`

#### Option 2: Build Release AAB (For Play Store)
```powershell
cd c:\projects\docsshelf-v7\android
.\gradlew bundleRelease
```

**Output Location**: `android/app/build/outputs/bundle/release/app-release.aab`

### Build Verification
After successful build:
```powershell
# Check APK exists
Test-Path c:\projects\docsshelf-v7\android\app\build\outputs\apk\release\app-release.apk

# View APK details
.\gradlew :app:printApkInfo
```

---

## 📲 Installing on Physical Devices

### Android Device Installation

#### Method 1: USB Installation (ADB)
```powershell
# Enable USB debugging on device
# Connect device via USB
cd c:\projects\docsshelf-v7\android\app\build\outputs\apk\release
adb install app-release.apk
```

#### Method 2: Direct Transfer
1. Copy `app-release.apk` to device storage
2. Enable "Install from Unknown Sources" in device settings
3. Use file manager to locate and install APK

#### Method 3: Email/Cloud Transfer
1. Email APK to yourself or upload to cloud storage
2. Download on device
3. Install from Downloads folder

---

## 🍎 iOS Production Build

### Prerequisites
- macOS with Xcode 15+
- Apple Developer Account (for device testing)
- iOS device with provisioning profile

### Build Commands

#### Development Build (Simulator)
```bash
npx expo run:ios --configuration Release
```

#### Device Build (Physical iPhone/iPad)
```bash
# Connect iOS device
npx expo run:ios --device --configuration Release
```

### Alternative: Xcode Build
1. Open `ios/docsshelf.xcworkspace` in Xcode
2. Select your device from device list
3. Product → Archive
4. Distribute App → Development
5. Install on connected device

---

## 🔧 Troubleshooting

### Network Connectivity Issues
**Problem**: "No such host is known" errors during build

**Solutions**:
1. **Check Internet Connection**
   ```powershell
   Test-NetConnection repo.maven.apache.org -Port 443
   ```

2. **Clear Gradle Cache**
   ```powershell
   cd c:\projects\docsshelf-v7\android
   .\gradlew clean --refresh-dependencies
   ```

3. **Use Alternative Maven Repositories** (if Maven Central is down)
   Add to `android/build.gradle`:
   ```gradle
   allprojects {
       repositories {
           google()
           mavenCentral()
           maven { url 'https://maven.aliyun.com/repository/public/' }  // Backup mirror
           maven { url 'https://www.jitpack.io' }
       }
   }
   ```

4. **Check Firewall/VPN Settings**
   - Disable corporate VPN temporarily
   - Check firewall isn't blocking Gradle
   - Try different network connection

### Build Failures

#### Missing Dependencies
```powershell
.\gradlew --refresh-dependencies assembleRelease
```

#### Out of Memory
Add to `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError
```

#### Keystore Issues
```powershell
# Verify keystore exists
Test-Path android\app\release.keystore

# Test keystore password
keytool -list -v -keystore android\app\release.keystore -storepass docsshelf2025
```

---

## 📦 Build Artifacts

### APK vs AAB

**APK (Android Package)**
- ✅ Direct installation on devices
- ✅ Easy testing and distribution
- ✅ Works without Play Store
- ❌ Larger file size
- ❌ Not optimized per device

**AAB (Android App Bundle)**
- ✅ Required for Play Store submission
- ✅ Smaller downloads (device-optimized)
- ✅ Automatic APK generation by Play Store
- ❌ Cannot install directly
- ❌ Requires Play Store or bundletool

### Bundle Size Analysis
```powershell
cd c:\projects\docsshelf-v7\android
.\gradlew :app:bundleRelease --scan
```

View size report at: `android/app/build/outputs/logs/manifest-merger-release-report.txt`

---

## 🚀 Release Checklist

### Pre-Build
- [ ] Update version in `app.json` (`expo.version`)
- [ ] Update version in `android/app/build.gradle` (`versionCode`, `versionName`)
- [ ] Update version in `ios/docsshelf/Info.plist` (`CFBundleShortVersionString`)
- [ ] Test all features in development mode
- [ ] Run all unit and integration tests
- [ ] Update changelog

### Post-Build
- [ ] Install APK on physical Android device
- [ ] Test core features on device
- [ ] Verify authentication flows
- [ ] Test document upload/download
- [ ] Verify backup/restore functionality
- [ ] Check PDF viewer performance
- [ ] Test biometric authentication
- [ ] Verify encryption/decryption

### Performance Testing
- [ ] App launch time < 3 seconds
- [ ] Smooth scrolling (60 FPS)
- [ ] Document search response < 500ms
- [ ] PDF rendering smooth
- [ ] No memory leaks
- [ ] Battery usage reasonable

---

## 📝 Build Information

### Current Build Configuration

**Android**
- **Application ID**: `com.docsshelf.app`
- **Version Code**: 1
- **Version Name**: 1.0.0
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 14)
- **Build Tools**: 36.0.0
- **Compile SDK**: 36

**iOS**
- **Bundle ID**: `com.docsshelf.app`
- **Version**: 1.0.0
- **Build Number**: 1
- **Deployment Target**: iOS 13.4+

### Build Optimization Settings
- **ProGuard**: Enabled in release builds
- **Minify**: Enabled for release
- **Shrink Resources**: Configurable
- **Hermes Engine**: Enabled (for JS performance)
- **Signing**: Release keystore configured

---

## 🔐 Keystore Management

### Backup Keystore
```powershell
# Create secure backup
Copy-Item android\app\release.keystore -Destination "$env:USERPROFILE\secure-backups\docsshelf-release.keystore"
```

### Generate New Production Keystore (For App Store)
```powershell
cd android/app
keytool -genkeypair -v -storetype PKCS12 `
  -keystore production.keystore `
  -alias docsshelf-production `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass "YOUR_SECURE_PASSWORD" `
  -keypass "YOUR_SECURE_PASSWORD" `
  -dname "CN=DocsShelf, OU=Production, O=Your Company, L=City, ST=State, C=US"
```

### View Keystore Information
```powershell
keytool -list -v -keystore android\app\release.keystore -storepass docsshelf2025
```

---

## 🌐 Alternative Build Methods

### EAS Build (Cloud Service)
For cloud-based builds without local setup:

1. **Install EAS CLI**
   ```powershell
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```powershell
   eas login
   ```

3. **Configure Project**
   ```powershell
   eas build:configure
   ```

4. **Build APK**
   ```powershell
   eas build --platform android --profile production
   ```

**Advantages**:
- ✅ No local Android SDK required
- ✅ Consistent build environment
- ✅ Automatic code signing
- ✅ Build logs and artifacts stored in cloud

**Disadvantages**:
- ❌ Requires Expo account
- ❌ Build queue wait times
- ❌ Limited free builds

---

## 📞 Support

### Common Issues

**Issue**: Build failing with dependency errors  
**Solution**: Ensure internet connectivity and run `.\gradlew --refresh-dependencies`

**Issue**: Keystore not found  
**Solution**: Verify keystore path in `build.gradle` is correct

**Issue**: APK installs but crashes  
**Solution**: Check logs with `adb logcat` and verify all required permissions

### Getting Help
- Check build logs in `android/build/reports/`
- Review Gradle output for specific errors
- Verify all prerequisites are installed
- Ensure network connectivity to Maven repositories

---

## 📅 Next Steps

After successful build:
1. ✅ Install APK on multiple Android devices
2. ✅ Perform comprehensive testing
3. ✅ Fix any device-specific issues
4. ✅ Prepare Play Store listing
5. ✅ Generate production keystore
6. ✅ Create App Store screenshots
7. ✅ Submit to Google Play Store
8. ✅ Build iOS version for App Store

---

**Last Updated**: November 27, 2025  
**Build Status**: Configuration Complete - Awaiting Network Connectivity  
**Next Action**: Retry build once internet connectivity to Maven Central is restored

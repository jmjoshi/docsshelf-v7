# Production Build & Deployment Guide

Complete step-by-step instructions for creating standalone production builds for iOS and Android, and deploying to app stores.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [iOS Production Build](#ios-production-build)
3. [Android Production Build](#android-production-build)
4. [Testing Production Builds](#testing-production-builds)
5. [App Store Deployment](#app-store-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### General Requirements

1. **Expo Account**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Project Configuration**
   - Ensure `app.json` is properly configured
   - Update version numbers in `app.json` and `package.json`
   - Configure app icons and splash screens

3. **Environment Setup**
   ```bash
   npm install --legacy-peer-deps
   eas build:configure
   ```

### iOS-Specific Requirements

- **Apple Developer Account** ($99/year)
  - Enroll at: https://developer.apple.com/programs/
- **macOS Computer** (required for local builds)
- **Xcode** (latest stable version from Mac App Store)
- **iOS Distribution Certificate**
- **Provisioning Profiles**

### Android-Specific Requirements

- **Google Play Console Account** ($25 one-time fee)
  - Register at: https://play.google.com/console/
- **Java Development Kit (JDK 17+)**
- **Android Studio** (for keystore generation)
- **Upload Keystore** (for app signing)

---

## iOS Production Build

### Step 1: Configure iOS Build Settings

1. **Update app.json for iOS**

Add/update the following in your `app.json`:

```json
{
  "expo": {
    "name": "DocsShelf",
    "slug": "docsshelf-v7",
    "version": "1.0.0",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.docsshelf",
      "buildNumber": "1",
      "icon": "./assets/images/icon.png",
      "infoPlist": {
        "NSCameraUsageDescription": "DocsShelf needs access to your camera to scan documents.",
        "NSMicrophoneUsageDescription": "DocsShelf needs access to your microphone for video recording (if enabled).",
        "NSPhotoLibraryUsageDescription": "DocsShelf needs access to your photos to attach documents."
      }
    }
  }
}
```

2. **Create eas.json configuration**

Create `eas.json` in your project root:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production-store": {
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 2: Set Up Apple Developer Account

1. **Create App ID in Apple Developer Portal**
   - Go to: https://developer.apple.com/account/
   - Navigate to: Certificates, Identifiers & Profiles > Identifiers
   - Click "+" to create a new App ID
   - Select "App IDs" → "App"
   - Bundle ID: `com.yourcompany.docsshelf` (must match app.json)
   - Enable capabilities: Push Notifications, App Groups (if needed)

2. **Create Distribution Certificate**
   ```bash
   # EAS will handle this automatically, or create manually:
   # Xcode → Preferences → Accounts → Manage Certificates → "+" → Apple Distribution
   ```

3. **Create Provisioning Profile**
   - Apple Developer Portal > Profiles
   - "+" → Distribution → App Store
   - Select your App ID
   - Select Distribution Certificate
   - Name it (e.g., "DocsShelf Production")
   - Download and keep safe

### Step 3: Build Production IPA

**Option A: EAS Build (Recommended - Cloud-based)**

```bash
# Build for App Store submission
eas build --platform ios --profile production-store

# Or build for ad-hoc distribution/testing
eas build --platform ios --profile production

# Monitor build progress
# Build logs will be shown in terminal
# IPA file will be available in Expo dashboard
```

**Option B: Local Build (Requires macOS)**

```bash
# Configure for local builds
eas build:configure

# Build locally
eas build --platform ios --profile production --local

# The .ipa file will be in the project directory
```

### Step 4: Download the IPA File

```bash
# After build completes, download from Expo dashboard
# Or use CLI:
eas build:list
# Note the build ID and download
```

### Step 5: Install IPA on iOS Device (Testing)

**Using TestFlight (Recommended)**
- Upload to App Store Connect
- TestFlight automatically available
- Share link with testers

**Using Xcode (Direct Install)**
```bash
# Connect iPhone via USB
# Open Xcode → Window → Devices and Simulators
# Drag and drop .ipa file to device
```

**Using Third-Party Tools**
```bash
# Install ios-deploy
npm install -g ios-deploy

# Install IPA to connected device
ios-deploy --bundle /path/to/your-app.ipa
```

---

## Android Production Build

### Step 1: Configure Android Build Settings

1. **Update app.json for Android**

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.docsshelf",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundColor": "#E6F4FE"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
        "READ_MEDIA_VIDEO"
      ]
    }
  }
}
```

### Step 2: Generate Upload Keystore

**Option A: Using Android Studio**
1. Build → Generate Signed Bundle/APK
2. Create new keystore
3. Fill in details and save

**Option B: Using Command Line**

```bash
# Generate keystore (one-time setup)
keytool -genkeypair -v -storetype PKCS12 -keystore docsshelf-upload.keystore -alias docsshelf-key -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password (SAVE THIS!)
# - Key password (SAVE THIS!)
# - Your name/organization details
```

**CRITICAL: Save These Details Securely!**
```
Keystore Path: /path/to/docsshelf-upload.keystore
Keystore Password: [YOUR_KEYSTORE_PASSWORD]
Key Alias: docsshelf-key
Key Password: [YOUR_KEY_PASSWORD]
```

### Step 3: Configure EAS with Keystore

**Option A: Let EAS Generate Keystore (Easiest)**

```bash
# EAS will generate and manage keystore for you
eas build --platform android --profile production-store
```

**Option B: Use Your Own Keystore**

1. Create `credentials.json` (DO NOT commit to git):

```json
{
  "android": {
    "keystore": {
      "keystorePath": "docsshelf-upload.keystore",
      "keystorePassword": "YOUR_KEYSTORE_PASSWORD",
      "keyAlias": "docsshelf-key",
      "keyPassword": "YOUR_KEY_PASSWORD"
    }
  }
}
```

2. Update `eas.json`:

```json
{
  "build": {
    "production-store": {
      "android": {
        "buildType": "aab",
        "credentialsSource": "local"
      }
    }
  }
}
```

### Step 4: Build Production APK/AAB

**For Google Play Store (AAB - Android App Bundle)**

```bash
# Build AAB for Play Store
eas build --platform android --profile production-store

# Monitor build progress in terminal or Expo dashboard
```

**For Direct Distribution (APK)**

```bash
# Build APK for sideloading
eas build --platform android --profile production

# This creates a universal APK
```

**Local Build (if needed)**

```bash
# Build locally
eas build --platform android --profile production-store --local

# Output will be in android/app/build/outputs/bundle/release/
```

### Step 5: Download Build Artifacts

```bash
# List builds
eas build:list

# Build artifacts available at:
# https://expo.dev/accounts/[your-account]/projects/docsshelf-v7/builds
```

### Step 6: Install APK on Android Device (Testing)

**Method 1: ADB (Android Debug Bridge)**

```bash
# Install ADB (comes with Android Studio)
# Or download platform-tools from Google

# Enable USB Debugging on device:
# Settings → About Phone → Tap "Build Number" 7 times
# Settings → Developer Options → Enable USB Debugging

# Connect device via USB and install
adb devices  # Verify device is connected
adb install /path/to/your-app.apk

# Or install and launch
adb install -r /path/to/your-app.apk
adb shell am start -n com.yourcompany.docsshelf/.MainActivity
```

**Method 2: Direct Transfer**

```bash
# Transfer APK to device via USB/Email/Cloud
# On device: Tap APK → Install
# May need to enable "Install from Unknown Sources"
# Settings → Security → Unknown Sources → Enable
```

**Method 3: Using Expo**

```bash
# Create internal distribution build
eas build --platform android --profile preview

# Share the generated link with testers
# They can scan QR code or open link to install
```

---

## Testing Production Builds

### iOS Testing

1. **TestFlight (Beta Testing)**
   - Upload to App Store Connect
   - Add internal/external testers
   - Testers install via TestFlight app
   - Collect feedback

2. **Ad-Hoc Distribution**
   ```bash
   # Build with ad-hoc profile
   eas build --platform ios --profile preview
   # Distribute .ipa via email/cloud
   ```

### Android Testing

1. **Internal Testing Track (Google Play)**
   - Upload AAB to Play Console
   - Use "Internal Testing" track
   - Add test users by email
   - Share testing link

2. **Direct APK Testing**
   ```bash
   # Install via ADB as shown above
   # Or share APK file directly
   ```

### Performance Testing

```bash
# Test app size
du -sh /path/to/app.apk
du -sh /path/to/app.ipa

# Run on multiple devices
# Test on minimum supported OS versions:
# - iOS 13.0+
# - Android 6.0+ (API 23+)
```

---

## App Store Deployment

### iOS - App Store Connect Submission

#### Step 1: Create App in App Store Connect

1. Go to: https://appstoreconnect.apple.com/
2. My Apps → "+" → New App
3. Fill in:
   - Platform: iOS
   - Name: DocsShelf
   - Primary Language: English
   - Bundle ID: com.yourcompany.docsshelf
   - SKU: DOCSSHELF001
   - User Access: Full Access

#### Step 2: Prepare App Store Information

Create these assets before submission:

**Required Screenshots**
- 6.7" (iPhone 15 Pro Max): 1290 x 2796 pixels
- 6.5" (iPhone 11 Pro Max): 1284 x 2778 pixels
- 5.5" (iPhone 8 Plus): 1242 x 2208 pixels
- iPad Pro (3rd gen): 2048 x 2732 pixels

**App Store Details**
- App Name: DocsShelf
- Subtitle: Secure Document Management
- Description: (250 words max)
- Keywords: document,scan,security,encryption,OCR
- Support URL: https://yourwebsite.com/support
- Marketing URL: https://yourwebsite.com
- Privacy Policy URL: https://yourwebsite.com/privacy

**App Icon**
- 1024 x 1024 pixels (no transparency, no rounded corners)

#### Step 3: Upload Build Using EAS

```bash
# Build and submit in one command
eas submit --platform ios --latest

# Or submit existing build
eas submit --platform ios --id [BUILD_ID]

# Or use Transporter app (manual)
# Download from Mac App Store
# Drag .ipa file to Transporter
```

#### Step 4: Configure Build in App Store Connect

1. Return to App Store Connect
2. App → App Store → iOS App section
3. Build → "+" → Select your uploaded build
4. Fill in "What's New in This Version"
5. Select content rights, age rating

#### Step 5: Submit for Review

```bash
# Complete all required fields:
# - App Information
# - Pricing and Availability
# - App Privacy (data collection details)
# - Screenshots
# - Description

# Click "Submit for Review"
# Review typically takes 24-48 hours
```

#### Step 6: Monitor Review Status

- Check App Store Connect regularly
- Respond to any rejection feedback promptly
- Common rejection reasons:
  - Missing privacy policy
  - Incomplete app functionality
  - Crashes on launch
  - Missing required features

---

### Android - Google Play Store Submission

#### Step 1: Set Up Google Play Console

1. Go to: https://play.google.com/console/
2. Create App → Fill in details:
   - App name: DocsShelf
   - Default language: English
   - App or Game: App
   - Free or Paid: Free/Paid

#### Step 2: Complete Store Listing

**Required Information**

1. **App Details**
   - Short description: 80 characters
   - Full description: 4000 characters
   - App category: Productivity
   - Tags: Documents, Security, Scanning

2. **Graphics**
   - App icon: 512 x 512 PNG (32-bit)
   - Feature graphic: 1024 x 500 JPG/PNG
   - Phone screenshots: 2-8 images (minimum 320px, max 3840px)
   - 7" tablet screenshots: 2-8 images
   - 10" tablet screenshots: 2-8 images

3. **Contact Details**
   - Email: support@yourcompany.com
   - Phone: Optional
   - Website: https://yourwebsite.com

4. **Privacy Policy**
   - URL: https://yourwebsite.com/privacy (REQUIRED)

#### Step 3: Set Up App Content

1. **App Access**
   - All functionality available without login? Yes/No
   - Provide test credentials if needed

2. **Ads**
   - Does app contain ads? Yes/No

3. **Content Rating**
   - Complete questionnaire
   - Receive IARC rating certificate

4. **Target Audience**
   - Age groups: 18+
   - Include children under 13? No

5. **Data Safety**
   - Data collected and shared
   - Security practices
   - Data deletion policy

#### Step 4: Upload AAB to Production Track

```bash
# Option 1: Using EAS (Recommended)
eas submit --platform android --latest

# Option 2: Manual upload via Play Console
# Release → Production → Create new release
# Upload AAB file
# Add release notes
```

**Manual Upload Steps:**
1. Production → Create new release
2. Upload the AAB file
3. Release name: 1.0.0 (1)
4. Release notes:
   ```
   Initial release of DocsShelf
   Features:
   - Secure document storage with encryption
   - OCR text extraction
   - Category and tag organization
   - Offline-first operation
   ```

#### Step 5: Configure Release Settings

1. **Countries/Regions**
   - Select countries for distribution
   - Can start with your country, expand later

2. **Pricing**
   - Free or set price per country

3. **App Signing**
   - Use Google Play App Signing (Recommended)
   - Upload your upload key certificate

#### Step 6: Roll Out Release

```bash
# Release tracks (choose one):
# 1. Internal Testing (up to 100 testers)
# 2. Closed Testing (unlimited testers)
# 3. Open Testing (public beta)
# 4. Production (public release)

# Start with Internal Testing:
# Testing → Internal Testing → Create new release
# Upload AAB → Save → Review and roll out

# When ready for production:
# Production → Create new release
# Upload AAB → Send for review
```

#### Step 7: Submit for Review

- Click "Review Release"
- Confirm all details
- Click "Start rollout to Production"
- Review takes 3-7 days (first submission)
- Subsequent updates: 1-3 days

---

## Build Optimization

### Reduce App Size

**iOS:**
```json
// eas.json
{
  "build": {
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "config": {
          "enableBitcode": false,
          "stripDebugSymbols": true
        }
      }
    }
  }
}
```

**Android:**
```json
// app.json
{
  "android": {
    "enableProguard": true,
    "enableShrinkResources": true
  }
}
```

### Environment Variables for Production

Create `.env.production`:

```bash
API_URL=https://api.production.com
ENVIRONMENT=production
DEBUG_MODE=false
ENABLE_LOGS=false
```

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## Troubleshooting

### iOS Issues

**Build Failed: Provisioning Profile Error**
```bash
# Clear credentials
eas credentials
# Select iOS → Select profile → Delete

# Rebuild
eas build --platform ios --clear-cache
```

**App Crashes on Launch**
```bash
# Check device logs
# Xcode → Window → Devices and Simulators
# Select device → View Device Logs

# Common fixes:
# - Update bundle identifier
# - Check Info.plist permissions
# - Verify all dependencies are iOS compatible
```

**"Untrusted Developer" on Device**
```
Settings → General → VPN & Device Management
→ Trust Developer Certificate
```

### Android Issues

**Build Failed: Keystore Error**
```bash
# Verify keystore
keytool -list -v -keystore docsshelf-upload.keystore

# Reset credentials
eas credentials
```

**APK Won't Install**
```bash
# Check device compatibility
adb shell getprop ro.build.version.sdk

# Verify minimum SDK version in app.json matches device
# Reinstall with -r flag
adb install -r app.apk
```

**App Store Rejection: Permissions**
- Review all requested permissions
- Add clear usage descriptions
- Remove unused permissions

### General Build Issues

**Out of Memory**
```bash
# Increase Node memory
export NODE_OPTIONS=--max_old_space_size=4096

# Or in package.json scripts:
"build:ios": "NODE_OPTIONS=--max_old_space_size=4096 eas build --platform ios"
```

**Slow Build Times**
```bash
# Use local builds for faster iteration
eas build --local

# Enable caching
eas build --platform android --clear-cache=false
```

---

## Version Management

### Updating Version Numbers

**iOS (app.json)**
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

**Android (app.json)**
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

**package.json**
```json
{
  "version": "1.0.1"
}
```

### Semantic Versioning

- **MAJOR.MINOR.PATCH** (e.g., 1.0.1)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Build Number Rules

**iOS:** Increment `buildNumber` for every build
**Android:** Increment `versionCode` for every upload to Play Store

---

## Automated Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build
on:
  push:
    branches: [main]
    
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Install dependencies
        run: npm install --legacy-peer-deps
        
      - name: Build iOS
        run: eas build --platform ios --non-interactive --no-wait
        
      - name: Build Android
        run: eas build --platform android --non-interactive --no-wait
```

---

## Quick Reference Commands

### iOS

```bash
# Configure EAS
eas build:configure

# Build for App Store
eas build --platform ios --profile production-store

# Build and submit
eas build --platform ios --auto-submit

# Submit existing build
eas submit --platform ios --latest

# Download IPA
eas build:list
# Copy build URL from list
```

### Android

```bash
# Build AAB for Play Store
eas build --platform android --profile production-store

# Build APK for testing
eas build --platform android --profile production

# Build and submit
eas build --platform android --auto-submit

# Submit existing build
eas submit --platform android --latest

# Install APK via ADB
adb install app.apk
```

### Both Platforms

```bash
# Build both platforms
eas build --platform all

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel

# Clear credentials
eas credentials
```

---

## Checklist Before Submission

### Pre-Build Checklist

- [ ] Version numbers updated (app.json, package.json)
- [ ] App icons generated (iOS 1024x1024, Android 512x512)
- [ ] Splash screen configured
- [ ] All permissions documented with descriptions
- [ ] Privacy policy URL available
- [ ] Support/marketing URLs active
- [ ] Test on minimum supported OS versions
- [ ] Remove all console.log statements
- [ ] Environment variables set for production
- [ ] All dependencies up to date
- [ ] No hardcoded API keys or secrets

### iOS Submission Checklist

- [ ] Apple Developer account active
- [ ] Bundle ID registered
- [ ] Distribution certificate valid
- [ ] Provisioning profile configured
- [ ] Screenshots prepared (all required sizes)
- [ ] App Store description written
- [ ] Keywords researched
- [ ] Age rating completed
- [ ] Export compliance information
- [ ] TestFlight tested

### Android Submission Checklist

- [ ] Google Play Console account set up
- [ ] Upload keystore generated and backed up
- [ ] Package name unique
- [ ] Screenshots prepared (phone + tablet)
- [ ] Feature graphic created
- [ ] Store listing completed
- [ ] Content rating obtained
- [ ] Data safety section filled
- [ ] Target API level meets requirements
- [ ] Internal testing completed

---

## Additional Resources

### Official Documentation

- **Expo EAS Build**: https://docs.expo.dev/build/introduction/
- **Expo EAS Submit**: https://docs.expo.dev/submit/introduction/
- **App Store Connect**: https://developer.apple.com/app-store-connect/
- **Google Play Console**: https://support.google.com/googleplay/android-developer/

### Useful Tools

- **App Icon Generator**: https://www.appicon.co/
- **Screenshot Builder**: https://www.screenshot.app/
- **ASO Tools**: https://www.appannie.com/
- **Fastlane** (automation): https://fastlane.tools/

### Support

- Expo Forums: https://forums.expo.dev/
- Stack Overflow: tag `expo` or `react-native`
- GitHub Issues: expo/expo repository

---

## Summary

This guide covers the complete production build and deployment process for both iOS and Android platforms. Key steps:

1. **Configure** your app.json and eas.json
2. **Build** using EAS Build (cloud) or local builds
3. **Test** production builds on physical devices
4. **Submit** to App Store Connect (iOS) and Google Play Console (Android)
5. **Monitor** review status and respond to feedback

**Estimated Timeline:**
- iOS: 24-48 hours review + build time
- Android: 3-7 days review + build time (first submission)

**Costs:**
- iOS: $99/year (Apple Developer)
- Android: $25 one-time (Google Play Console)

For questions or issues, refer to the troubleshooting section or official Expo documentation.

Good luck with your app launch! 🚀

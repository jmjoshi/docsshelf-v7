# Testing Production Builds on Physical Devices

Complete guide for installing and testing production builds on physical iOS and Android devices **before** submitting to app stores.

---

## Table of Contents

1. [iOS Production Testing](#ios-production-testing)
2. [Android Production Testing](#android-production-testing)
3. [Testing Checklist](#testing-checklist)
4. [Common Issues](#common-issues)

---

## iOS Production Testing

### Method 1: Ad-Hoc Distribution (Recommended for Small Teams)

This method allows you to test the exact production build on up to 100 registered devices.

#### Step 1: Register Test Devices in Apple Developer Portal

1. **Get Device UDID from iPhone/iPad:**

   **Option A: Using Finder (macOS Catalina+)**
   ```
   - Connect iPhone/iPad to Mac via USB
   - Open Finder
   - Select your device in sidebar
   - Click on device info below device name
   - UDID will be displayed (click to copy)
   ```

   **Option B: Using iTunes (older macOS/Windows)**
   ```
   - Connect device to computer
   - Open iTunes
   - Click device icon
   - Click "Serial Number" label
   - It will change to UDID (right-click to copy)
   ```

   **Option C: Using Xcode**
   ```
   - Connect device to Mac
   - Open Xcode → Window → Devices and Simulators
   - Select your device
   - Copy "Identifier" field
   ```

   **Option D: On the iPhone itself**
   ```
   - Install "UDID+" app from App Store
   - Open app to see UDID
   - Share via email/messages
   ```

2. **Register Devices in Apple Developer Portal:**
   ```
   - Go to: https://developer.apple.com/account/
   - Certificates, Identifiers & Profiles → Devices
   - Click "+" button
   - Select "iOS, tvOS, watchOS" 
   - Enter Device Name: "John's iPhone 15"
   - Enter UDID: (paste from above)
   - Click "Continue" → "Register"
   ```

3. **Register Multiple Devices at Once:**
   ```
   - Create a text file: devices.txt
   Format:
   Device ID    Device Name
   a1b2c3d4...  John iPhone 15
   e5f6g7h8...  Jane iPhone 14
   
   - In Devices section, click "+" 
   - Choose "Register Multiple Devices"
   - Upload the file
   ```

#### Step 2: Build Ad-Hoc Distribution IPA

Update your `eas.json` to include an ad-hoc profile:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      }
    },
    "production-adhoc": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release",
        "enterpriseProvisioning": "adhoc"
      }
    }
  }
}
```

Build the ad-hoc IPA:

```bash
# Build ad-hoc distribution
eas build --platform ios --profile production-adhoc

# Wait for build to complete (15-30 minutes)
# Download URL will be provided in terminal and Expo dashboard
```

#### Step 3: Install IPA on Registered Devices

**Option A: Using Apple Configurator (Mac Only - Most Reliable)**

```bash
# Install Apple Configurator 2 from Mac App Store

Steps:
1. Connect iPhone/iPad to Mac via USB
2. Open Apple Configurator 2
3. Device will appear in window
4. Double-click device to open details
5. Click "Add" → "Apps"
6. Drag and drop your .ipa file
7. App will install automatically
```

**Option B: Using Xcode Devices Window (Mac Only)**

```bash
Steps:
1. Connect iPhone/iPad to Mac via USB
2. Open Xcode
3. Window → Devices and Simulators (⇧⌘2)
4. Select your device in left sidebar
5. Click "+" under "Installed Apps" section
6. Navigate to your .ipa file
7. Select and click "Open"
8. App will install and appear on device

Troubleshooting:
- If "Trust This Computer" prompt appears, tap "Trust"
- If install fails: delete old version first
- Check device is unlocked during installation
```

**Option C: Using ios-deploy (Command Line)**

```bash
# Install ios-deploy globally
npm install -g ios-deploy

# Connect device via USB
# Verify device is detected
ios-deploy --detect

# Install IPA
ios-deploy --bundle /path/to/docsshelf.ipa

# Install and launch immediately
ios-deploy --bundle /path/to/docsshelf.ipa --justlaunch

# Verbose output for debugging
ios-deploy --bundle /path/to/docsshelf.ipa --debug
```

**Option D: Using Diawi (Wireless Distribution - Easiest)**

```bash
# Upload IPA to Diawi
1. Go to: https://www.diawi.com/
2. Drag and drop your .ipa file
3. Optional: Set password, expiration date
4. Click "Send"
5. Wait for upload to complete
6. Copy the generated link

# Install on device:
7. Open Safari on iPhone/iPad (must be registered device)
8. Navigate to the Diawi link
9. Tap "Install" button
10. Confirm installation in Settings
11. Settings → General → VPN & Device Management
12. Tap on your developer name → Trust

Note: Free tier has file size limits (100MB)
Alternative services: InstallOnAir, TestApp.io
```

**Option E: Using EAS Build Internal Distribution**

```bash
# Build with internal distribution
eas build --platform ios --profile preview

# After build completes, you'll get a URL like:
# https://expo.dev/accounts/[account]/projects/docsshelf-v7/builds/[build-id]

# Share this link with testers:
1. Testers open link on their registered iOS device
2. Click "Install" button
3. Profile will download
4. Settings → Profile Downloaded → Install
5. Enter device passcode
6. Tap "Install" → "Done"
7. App appears on home screen

# Advantages:
- No cable needed
- Easy to share with multiple testers
- Automatic device registration via link
```

#### Step 4: Trust Developer Certificate

After installation, the app won't open immediately. Follow these steps:

```
1. Tap the app icon
2. You'll see "Untrusted Enterprise Developer" message
3. Go to: Settings → General → VPN & Device Management
4. Under "Developer App", tap your developer name/org
5. Tap "Trust [Developer Name]"
6. Tap "Trust" in confirmation dialog
7. Return to home screen
8. App will now launch normally
```

---

### Method 2: TestFlight (Recommended for Larger Teams)

TestFlight is Apple's official beta testing platform. It allows up to 10,000 external testers.

#### Step 1: Build for TestFlight

```bash
# Build production IPA (same as App Store build)
eas build --platform ios --profile production-store

# Or build and submit to TestFlight directly
eas submit --platform ios --latest
```

#### Step 2: Upload to App Store Connect

**Option A: Using EAS Submit (Easiest)**

```bash
# Submit the latest build to TestFlight
eas submit --platform ios --latest

# Or submit specific build
eas submit --platform ios --id [BUILD_ID]

# EAS will handle the upload automatically
```

**Option B: Using Transporter App (Manual)**

```bash
# Download Transporter from Mac App Store

Steps:
1. Download your .ipa from EAS dashboard
2. Open Transporter app
3. Sign in with Apple ID
4. Drag and drop .ipa file
5. Click "Deliver"
6. Wait for upload (can take 10-30 minutes)
7. Check App Store Connect for status
```

**Option C: Using Xcode Organizer**

```bash
Steps:
1. Open Xcode
2. Window → Organizer (⇧⌘O)
3. Select "Archives" tab
4. If you built locally, archive will appear here
5. Select archive → Click "Distribute App"
6. Choose "App Store Connect"
7. Click "Upload"
8. Follow prompts to complete upload
```

#### Step 3: Configure TestFlight in App Store Connect

```bash
# Go to: https://appstoreconnect.apple.com/

1. Select your app → TestFlight tab
2. Build will appear under "iOS Builds" after processing (5-15 min)
3. Click on the build number
4. Fill in "What to Test" field (required)
   Example:
   "Testing production build with:
   - Document encryption
   - OCR scanning
   - Biometric authentication
   - Performance optimizations"
5. Click "Save"
```

#### Step 4: Add Internal Testers

```bash
# Internal testers (up to 100):
1. TestFlight → Internal Testing → Default Group
2. Click "+" to add testers
3. Enter email addresses
4. Select users → Click "Add"
5. Testers receive email invitation automatically

# Internal testers can install immediately after build processing
```

#### Step 5: Add External Testers (Optional)

```bash
# External testers (up to 10,000):
1. TestFlight → External Testing tab
2. Click "+" to create a new group
3. Name: "Public Beta Testers"
4. Add build to test
5. Add testers via email or public link
6. Submit for Beta App Review (required first time)
7. Review takes 24-48 hours
8. Once approved, testers can install

# Public link option:
- Enable "Public Link" in group settings
- Share link on website, social media, etc.
- Anyone with link can join (up to limit)
```

#### Step 6: Install via TestFlight

**Tester Instructions:**

```bash
1. Install "TestFlight" app from App Store
2. Open invitation email on iPhone/iPad
3. Tap "View in TestFlight" or "Start Testing"
4. TestFlight app opens automatically
5. Tap "Accept" to accept invitation
6. Tap "Install" button
7. App downloads and installs
8. Launch from TestFlight or home screen

# To provide feedback:
- Open TestFlight app
- Select DocsShelf
- Tap "Send Beta Feedback"
- Describe issue or feedback
- Optional: Attach screenshot
- Tap "Submit"
```

**Managing TestFlight:**

```bash
# View tester activity:
- TestFlight → Select Group
- See install counts, sessions, crashes
- Export tester data

# Send notifications:
- Select build → "Notify Testers"
- Write notification message
- Send to specific groups

# Update TestFlight build:
- Upload new build via eas submit
- Build appears automatically in TestFlight
- Testers get notification to update
- No need to re-invite testers
```

---

### Method 3: Enterprise Distribution (Requires Enterprise Account)

Only use if you have an Apple Developer Enterprise Program account ($299/year).

```bash
# Build with enterprise certificate
eas build --platform ios --profile enterprise

# Distribute via your own MDM or direct download
# No device registration required
# Not suitable for App Store distribution
# Apple is phasing this out - use TestFlight instead
```

---

## Android Production Testing

Android offers more flexible testing options since you can install APK files directly.

### Method 1: Direct APK Installation (Easiest)

#### Step 1: Build Production APK

```bash
# Build APK (not AAB) for direct installation
eas build --platform android --profile production

# Wait for build to complete (10-20 minutes)
# Download APK from provided URL
```

Update `eas.json` if needed:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    },
    "production-store": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

#### Step 2: Transfer APK to Android Device

**Option A: USB Transfer (Most Common)**

```bash
# Connect device via USB cable

# Windows:
1. Connect Android device to PC via USB
2. Unlock device
3. Notification appears: "USB for charging"
4. Tap notification → Select "File Transfer" or "MTP"
5. Open File Explorer on PC
6. Device appears as removable drive
7. Navigate to device: Internal Storage → Download
8. Copy APK file to Download folder
9. Safely eject device

# macOS:
1. Install "Android File Transfer" app
   Download: https://www.android.com/filetransfer/
2. Connect device via USB
3. Unlock device and select "File Transfer"
4. Android File Transfer app opens automatically
5. Navigate to Download folder
6. Drag and drop APK file
```

**Option B: Cloud Storage (Google Drive, Dropbox)**

```bash
# Upload APK to cloud storage:
1. Upload APK to Google Drive/Dropbox
2. Share link or keep in your account

# Download on Android device:
3. Open Google Drive/Dropbox app on device
4. Navigate to APK file
5. Tap file → Download
6. APK downloads to Download folder
7. Continue to installation steps below
```

**Option C: Email/Messaging**

```bash
# Send APK via email:
1. Compose email with APK as attachment
2. Send to your email address
3. Open email on Android device
4. Download attachment
5. Proceed with installation

Note: Some email services block .apk files
Alternative: Rename to .zip, then rename back on device
Or use Google Drive/Dropbox instead
```

**Option D: Wireless Transfer via ADB**

```bash
# Install ADB (Android Debug Bridge)
# Comes with Android Studio or download platform-tools

# Enable Wireless Debugging on device (Android 11+):
1. Settings → Developer Options
2. Enable "Wireless debugging"
3. Tap "Wireless debugging"
4. Tap "Pair device with pairing code"
5. Note the IP address and port

# On computer:
adb pair <IP>:<PORT>
# Enter pairing code when prompted

adb connect <IP>:<PORT>
adb devices  # Verify connected

# Install APK
adb install /path/to/docsshelf.apk
```

#### Step 3: Enable Installation from Unknown Sources

**Android 8.0+ (Oreo and newer):**

```bash
# Per-app permissions (more secure):
1. When you tap the APK to install
2. Dialog appears: "For your security, your phone is not allowed to install unknown apps from this source"
3. Tap "Settings" in dialog
4. Toggle "Allow from this source" ON
5. Return to previous screen
6. Installation will proceed

# Or manually enable:
Settings → Apps → Special App Access → Install Unknown Apps
→ Select browser/file manager used
→ Toggle "Allow from this source" ON
```

**Android 7.1 and older:**

```bash
# System-wide setting:
Settings → Security → Unknown Sources → Toggle ON

# Warning appears:
"Your phone and personal data are more vulnerable to attack by apps from unknown sources..."
→ Tap "OK" to confirm
```

#### Step 4: Install APK on Device

```bash
# Using File Manager:
1. Open "Files" or "My Files" app on device
2. Navigate to "Downloads" folder
3. Tap on the APK file (docsshelf.apk)
4. "Install app" screen appears
5. Review permissions requested
6. Tap "Install" button
7. Wait for installation (5-10 seconds)
8. "App installed" confirmation appears
9. Tap "Open" to launch, or "Done" to finish

# Using Notification:
1. After downloading, pull down notification shade
2. Tap "Download complete" notification
3. Installation screen opens automatically
4. Tap "Install"

# Troubleshooting:
- If "Parse Error" appears: APK is corrupted, re-download
- If "App not installed": Uninstall old version first
- If "Installation blocked": Check Unknown Sources setting
```

#### Step 5: Install via ADB (Alternative Method)

```bash
# Prerequisites:
# - Android device with USB Debugging enabled
# - ADB installed on computer
# - USB cable or wireless connection

# Enable Developer Options on device:
1. Settings → About Phone
2. Tap "Build Number" 7 times rapidly
3. Message: "You are now a developer!"
4. Go back → Developer Options now visible

# Enable USB Debugging:
Settings → Developer Options → USB Debugging → Toggle ON

# Connect device and install:
# Connect via USB
adb devices
# Output: List of devices attached
# <device-id>  device

# Install APK
adb install /path/to/docsshelf.apk

# Output: Success

# Verify installation
adb shell pm list packages | grep docsshelf

# Launch app
adb shell am start -n com.yourcompany.docsshelf/.MainActivity

# Install specific APK from EAS build URL
# Download first, then install:
curl -o docsshelf.apk "https://expo.dev/.../download"
adb install docsshelf.apk

# Reinstall (keep app data)
adb install -r docsshelf.apk

# Install to specific device if multiple connected
adb -s <device-id> install docsshelf.apk
```

**Common ADB Commands for Testing:**

```bash
# Check device connection
adb devices

# View device logs (useful for debugging)
adb logcat

# Filter logs for your app
adb logcat | grep docsshelf

# Clear app data (fresh start testing)
adb shell pm clear com.yourcompany.docsshelf

# Uninstall app
adb uninstall com.yourcompany.docsshelf

# Take screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png

# Record screen (Android 4.4+)
adb shell screenrecord /sdcard/demo.mp4
# Stop with Ctrl+C
adb pull /sdcard/demo.mp4

# Get device info
adb shell getprop ro.build.version.release  # Android version
adb shell getprop ro.product.model          # Device model
```

---

### Method 2: Google Play Internal Testing Track

This method uses Google Play's infrastructure but doesn't make the app public.

#### Step 1: Build AAB for Play Store

```bash
# Build Android App Bundle
eas build --platform android --profile production-store

# Download AAB from EAS dashboard
```

#### Step 2: Upload to Google Play Console

```bash
# Option A: Using EAS Submit (Easiest)
eas submit --platform android --latest

# Option B: Manual Upload
1. Go to: https://play.google.com/console/
2. Select your app
3. Release → Testing → Internal Testing
4. Click "Create new release"
5. Upload AAB file
6. Add release notes
7. Click "Save"
8. Click "Review release"
9. Click "Start rollout to Internal testing"
```

#### Step 3: Add Internal Testers

```bash
# Create tester list:
1. Testing → Internal Testing → Testers tab
2. Click "Create email list"
3. Name: "Internal Testers"
4. Add email addresses (comma or line separated)
5. Click "Save changes"

# Share opt-in link:
6. Copy the "Opt-in URL"
7. Share link with testers via email/Slack

Format:
https://play.google.com/apps/internaltest/XXXXXXXXXXXX
```

#### Step 4: Testers Install from Play Store

**Tester Instructions:**

```bash
1. Open opt-in URL on Android device
2. Tap "Become a tester" button
3. Confirm "You're a tester"
4. Tap "Download it on Google Play"
5. Play Store opens with your app
6. Tap "Install"
7. App installs like any Play Store app
8. Launch from home screen

# To provide feedback:
- Open Play Store
- Search for your app
- Scroll to "You're a beta tester" section
- Tap "Send feedback"

# To leave testing program:
- Return to opt-in URL
- Tap "Leave the program"
```

**Advantages of Internal Testing Track:**
- No APK transfer needed
- Automatic updates via Play Store
- Up to 100 testers (expandable to 1000+)
- Available immediately (no review needed)
- Looks and works like production app

#### Step 5: Promote to Closed/Open Testing (Optional)

```bash
# Closed Testing (Alpha/Beta):
1. Testing → Closed Testing → Create new track
2. Upload same AAB or promote from internal
3. Add tester lists (unlimited users)
4. No review required
5. Share opt-in URL

# Open Testing (Public Beta):
1. Testing → Open Testing
2. Upload or promote build
3. Anyone can join
4. Appears in Play Store with "Beta" badge
5. No opt-in URL needed
```

---

### Method 3: Firebase App Distribution

Alternative to EAS/Play Store for both iOS and Android distribution.

#### Step 1: Set Up Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select: App Distribution
# Choose or create Firebase project
```

#### Step 2: Upload Build to Firebase

```bash
# Upload iOS IPA
firebase appdistribution:distribute /path/to/app.ipa \
  --app FIREBASE_IOS_APP_ID \
  --groups "internal-testers" \
  --release-notes "Production build v1.0.0 - Testing encryption and OCR"

# Upload Android APK
firebase appdistribution:distribute /path/to/app.apk \
  --app FIREBASE_ANDROID_APP_ID \
  --groups "internal-testers" \
  --release-notes "Production build v1.0.0"

# Testers get email notification with download link
```

#### Step 3: Testers Install Firebase App

```bash
# One-time setup for testers:
1. Install "Firebase App Distribution" app
   - iOS: App Store
   - Android: Play Store
2. Sign in with Google account
3. Accept invitation email
4. App appears in Firebase App Distribution app
5. Tap "Download" to install

# Future updates:
- Notifications for new builds
- One-tap update
```

---

## Testing Checklist

Use this checklist when testing production builds before app store submission.

### Pre-Installation Testing

- [ ] Build completed successfully without errors
- [ ] Build size is reasonable (iOS <100MB, Android <150MB)
- [ ] Version numbers are correct in binary
- [ ] App icons display correctly in build
- [ ] Splash screen configured properly

### Installation Testing

**iOS:**
- [ ] IPA installs without errors
- [ ] App icon appears on home screen
- [ ] First launch doesn't crash
- [ ] No certificate trust warnings (or resolved)
- [ ] Runs on minimum iOS version (13.0+)

**Android:**
- [ ] APK installs without parse errors
- [ ] Permissions requested are appropriate
- [ ] App icon appears correctly
- [ ] First launch successful
- [ ] Runs on minimum Android version (API 23+)

### Functional Testing

- [ ] Authentication flows work correctly
  - [ ] Registration with valid inputs
  - [ ] Login with credentials
  - [ ] MFA setup and verification
  - [ ] Biometric authentication
  - [ ] Password reset flow

- [ ] Core features functional
  - [ ] Document upload
  - [ ] Document viewing
  - [ ] Document encryption/decryption
  - [ ] OCR text extraction
  - [ ] Category management
  - [ ] Search functionality
  - [ ] Document sharing

- [ ] Data persistence
  - [ ] Close and reopen app
  - [ ] Data still present
  - [ ] No data loss

- [ ] Offline functionality
  - [ ] Enable airplane mode
  - [ ] Test core features
  - [ ] Verify offline message if needed

### Performance Testing

- [ ] App launches within 3 seconds
- [ ] Smooth scrolling in document lists
- [ ] No memory leaks during extended use
- [ ] Camera/OCR responds quickly
- [ ] No UI freezing or lag
- [ ] Battery drain is acceptable

### Device Testing

**Test on multiple devices:**

iOS:
- [ ] iPhone SE (small screen)
- [ ] iPhone 14/15 (standard)
- [ ] iPhone 14/15 Pro Max (large)
- [ ] iPad (if supported)
- [ ] Different iOS versions (13, 14, 15, 16, 17)

Android:
- [ ] Small phone (5" screen)
- [ ] Standard phone (6" screen)
- [ ] Large phone (6.5"+ screen)
- [ ] Tablet (if supported)
- [ ] Different Android versions (6, 8, 10, 12, 13, 14)
- [ ] Different manufacturers (Samsung, Google, OnePlus)

### Security Testing

- [ ] No sensitive data in logs
- [ ] Encryption works correctly
- [ ] Secure storage functioning
- [ ] No hardcoded secrets visible
- [ ] HTTPS connections only
- [ ] Certificate pinning (if implemented)

### UI/UX Testing

- [ ] All text readable at default size
- [ ] Dark mode works correctly (if supported)
- [ ] Accessibility features functional
- [ ] No UI elements cut off
- [ ] Proper keyboard handling
- [ ] Alert messages are clear
- [ ] Loading indicators present

### Edge Cases

- [ ] Low storage space handling
- [ ] No network connection behavior
- [ ] Background/foreground transitions
- [ ] App backgrounded during operations
- [ ] Phone calls during app use
- [ ] Permission denied scenarios
- [ ] Invalid input handling

### Pre-Submission Final Check

- [ ] No debug logs or console.log output
- [ ] Production API endpoints configured
- [ ] Analytics tracking working (if used)
- [ ] Crash reporting enabled (if used)
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Support/contact info correct
- [ ] App name and description accurate

---

## Common Issues

### iOS Installation Issues

**Issue: "Unable to Install" error**

```
Causes:
- Device UDID not registered
- Provisioning profile doesn't include device
- Certificate expired
- Bundle ID mismatch

Solutions:
1. Verify device UDID in Apple Developer Portal
2. Rebuild with updated provisioning profile
3. Check certificate validity dates
4. Confirm bundle ID matches registered App ID

# Check provisioning profile details:
security cms -D -i /path/to/profile.mobileprovision
```

**Issue: "Untrusted Enterprise Developer"**

```
Solution:
Settings → General → VPN & Device Management
→ Trust [Developer Name]

If developer name doesn't appear:
- Reinstall the app
- Restart device
- Check provisioning profile
```

**Issue: App crashes immediately on launch**

```
Check logs:
1. Connect device to Mac
2. Open Console app (Applications → Utilities)
3. Select device in sidebar
4. Launch app
5. Look for crash reports

Common causes:
- Missing framework/library
- Incorrect Info.plist configuration
- Code signing issues
- iOS version incompatibility

# Export crash logs:
Settings → Privacy → Analytics & Improvements
→ Analytics Data → Find your app → Share
```

**Issue: "This app cannot be installed because its integrity could not be verified"**

```
Causes:
- Corrupted IPA file
- Downloaded over unstable connection
- Build process interrupted

Solutions:
1. Re-download IPA from source
2. Verify file size matches expected
3. Try different installation method
4. Rebuild if necessary
```

---

### Android Installation Issues

**Issue: "App not installed" error**

```
Common causes and solutions:

1. Old version conflict:
   Settings → Apps → DocsShelf → Uninstall
   Then reinstall new version

2. Insufficient storage:
   Settings → Storage → Free up space
   Need at least 2x the APK size free

3. Corrupted APK:
   Re-download APK file
   Verify file size

4. Signature mismatch:
   Uninstall any existing version
   Clear package installer cache
   Reinstall

# Via ADB:
adb uninstall com.yourcompany.docsshelf
adb install docsshelf.apk
```

**Issue: "Parse Error: There was a problem parsing the package"**

```
Causes:
- Corrupted APK file
- APK not compatible with device
- Renamed file incorrectly
- Downloaded incomplete file

Solutions:
1. Re-download APK completely
2. Verify file integrity (check file size)
3. Ensure file extension is .apk
4. Try installing via ADB:
   adb install -r docsshelf.apk

5. Check device compatibility:
   - Minimum API level
   - Architecture (arm, x86)
```

**Issue: "Installation blocked" or "For security..."**

```
Solution:
1. Settings → Security
2. Enable "Unknown Sources" or "Install Unknown Apps"
3. Grant permission to file manager/browser
4. Retry installation

Android 8.0+:
Settings → Apps → Special App Access 
→ Install Unknown Apps
→ [Your File Manager] → Allow
```

**Issue: App installed but won't open**

```
Check via ADB:
adb logcat | grep docsshelf

Common fixes:
1. Clear app data:
   Settings → Apps → DocsShelf → Storage → Clear Data

2. Check permissions:
   Settings → Apps → DocsShelf → Permissions
   Grant all required permissions

3. Reinstall app:
   adb uninstall com.yourcompany.docsshelf
   adb install docsshelf.apk

4. Check Android version compatibility:
   adb shell getprop ro.build.version.sdk
   Ensure >= minSdkVersion (23 for Android 6.0)
```

**Issue: USB debugging not working**

```
Solutions:
1. Verify USB debugging enabled:
   Settings → Developer Options → USB Debugging

2. Change USB mode:
   Notification: USB for... → File Transfer (MTP)

3. Revoke USB debugging authorizations:
   Settings → Developer Options 
   → Revoke USB debugging authorizations
   Reconnect device and allow prompt

4. Try different USB cable
   Some cables are charge-only

5. Install/update device drivers (Windows):
   Download from device manufacturer website

6. Try different USB port
   Use USB 2.0 port if USB 3.0 causes issues
```

---

## Best Practices

### For iOS Testing

1. **Start with TestFlight** - Most reliable and easiest to manage
2. **Register devices early** - UDID registration can take time
3. **Test on real devices** - Simulator doesn't test everything
4. **Keep provisioning profiles updated** - Rebuild if expired
5. **Document UDID collection** - Make it easy for testers

### For Android Testing

1. **Provide clear instructions** - Many users haven't sideloaded apps
2. **Test on multiple devices** - Android fragmentation is real
3. **Use APK for testing** - AAB only for Play Store
4. **Enable crash reporting** - Catch issues early
5. **Version your APK filenames** - e.g., docsshelf-v1.0.0-prod.apk

### General Testing Best Practices

1. **Test production builds only** - Development builds behave differently
2. **Create testing documentation** - Share with all testers
3. **Collect device info** - Know what devices had issues
4. **Use feedback tools** - TestFlight feedback, Firebase Analytics
5. **Test before every release** - Don't skip this step
6. **Keep builds organized** - Version, date, and label clearly
7. **Archive successful builds** - Keep copies of what worked

---

## Quick Reference

### iOS Commands

```bash
# List builds
eas build:list --platform ios

# Download IPA
# (Get URL from EAS dashboard)
curl -o app.ipa "https://expo.dev/.../download"

# Install via ios-deploy
ios-deploy --bundle app.ipa

# Check device UDID
idevice_id -l

# View device logs
idevicesyslog
```

### Android Commands

```bash
# List builds
eas build:list --platform android

# Download APK
curl -o app.apk "https://expo.dev/.../download"

# Install via ADB
adb install app.apk

# Reinstall (keep data)
adb install -r app.apk

# Launch app
adb shell am start -n com.yourcompany.docsshelf/.MainActivity

# Check device info
adb shell getprop ro.build.version.sdk    # API level
adb shell getprop ro.product.model        # Device model
adb shell getprop ro.build.version.release # Android version

# View logs
adb logcat | grep docsshelf

# Clear app data
adb shell pm clear com.yourcompany.docsshelf

# Uninstall
adb uninstall com.yourcompany.docsshelf
```

---

## Summary

### iOS Testing Workflow

1. **Ad-Hoc** (Small teams, quick testing)
   - Register device UDIDs
   - Build with ad-hoc profile
   - Install via Xcode/Configurator
   
2. **TestFlight** (Recommended for most cases)
   - Upload to App Store Connect
   - Add testers
   - Testers install from TestFlight app

### Android Testing Workflow

1. **Direct APK** (Most flexible)
   - Build APK
   - Transfer to device
   - Enable Unknown Sources
   - Install APK
   
2. **Internal Testing** (Play Store infrastructure)
   - Upload AAB to Play Console
   - Add testers
   - Install from Play Store

### Key Takeaways

- **Always test production builds before submitting** - They differ from dev builds
- **Test on multiple real devices** - Simulators/emulators aren't enough
- **iOS requires device registration** for ad-hoc distribution
- **Android allows direct APK installation** - More flexible
- **TestFlight and Play Internal Testing** are the most professional solutions
- **Document and save working builds** - For rollback if needed

Good luck with your testing! 🧪📱

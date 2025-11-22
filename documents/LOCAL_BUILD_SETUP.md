# Local Android Build Setup Guide

Complete guide to build Android APKs locally on Windows without using EAS cloud builds (completely free).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install Required Software](#install-required-software)
3. [Configure Android Development Environment](#configure-android-development-environment)
4. [Build APK Locally](#build-apk-locally)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Windows 10/11** (64-bit)
- **At least 8GB RAM** (16GB recommended)
- **20GB free disk space** (for Android SDK and build cache)
- **Administrator access** (for installations)

---

## Install Required Software

### Step 1: Install Node.js (Already Installed)

You already have Node.js installed. Verify:

```powershell
node --version
# Should show v18 or higher
```

### Step 2: Install Java Development Kit (JDK)

**Option A: Install via Chocolatey (Recommended)**

```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install JDK 17 (LTS version)
choco install openjdk17 -y

# Refresh environment variables
refreshenv
```

**Option B: Manual Installation**

1. Download **OpenJDK 17** from: https://adoptium.net/
2. Choose: **Windows x64**, **JDK 17 (LTS)**
3. Run installer with default settings
4. Installer automatically sets environment variables

**Verify Installation:**

```powershell
java -version
# Should show: openjdk version "17.x.x"

javac -version
# Should show: javac 17.x.x
```

**If Java is not recognized:**

```powershell
# Set JAVA_HOME manually
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot', 'Machine')

# Add to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$javaPath = "$env:JAVA_HOME\bin"
if ($currentPath -notlike "*$javaPath*") {
    [System.Environment]::SetEnvironmentVariable('Path', "$currentPath;$javaPath", 'Machine')
}

# Restart PowerShell for changes to take effect
```

### Step 3: Install Android Studio

1. **Download Android Studio:**
   - Go to: https://developer.android.com/studio
   - Download: **Android Studio Hedgehog** or later
   - File size: ~1GB

2. **Run Installer:**
   ```
   - Run downloaded .exe file
   - Choose "Standard" installation
   - Accept all default settings
   - Wait for download of Android SDK components (~5GB)
   - Click "Finish"
   ```

3. **Initial Setup:**
   ```
   - Launch Android Studio
   - "Import Android Studio Settings" → Do not import
   - Choose theme (Light or Dark)
   - "Standard" setup type
   - Accept licenses (scroll and click "Accept")
   - Click "Finish" to download components
   - Wait for completion (10-20 minutes)
   ```

### Step 4: Install Android SDK Components

1. **Open SDK Manager:**
   ```
   Android Studio → More Actions (or Tools) → SDK Manager
   Or: Configure → SDK Manager
   ```

2. **SDK Platforms Tab:**
   ```
   Check the following:
   ☑ Android 14.0 (UpsideDownCake) - API 34
   ☑ Android 13.0 (Tiramisu) - API 33
   ☑ Android 12.0 (S) - API 31
   ☑ Android 11.0 (R) - API 30
   
   Click "Show Package Details" at bottom right
   
   For each checked Android version, ensure these are checked:
   ☑ Android SDK Platform XX
   ☑ Sources for Android XX
   ☑ Google APIs Intel x86 Atom System Image (for emulator, optional)
   ```

3. **SDK Tools Tab:**
   ```
   Check "Show Package Details" at bottom right
   
   Required tools:
   ☑ Android SDK Build-Tools
       ☑ 34.0.0
       ☑ 33.0.0
   ☑ Android SDK Command-line Tools (latest)
   ☑ Android Emulator (optional, for testing)
   ☑ Android SDK Platform-Tools
   ☑ Intel x86 Emulator Accelerator (HAXM installer) - if Intel CPU
   ☑ Google Play services
   ```

4. **Click "Apply" → "OK" → Accept Licenses → "OK"**
   - Wait for download and installation (5-10 minutes)
   - Click "Finish" when done

### Step 5: Configure Environment Variables

**Set ANDROID_HOME:**

```powershell
# Find SDK location (usually):
# C:\Users\<YourUsername>\AppData\Local\Android\Sdk

# Set ANDROID_HOME (replace with your actual path)
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidHome, 'Machine')
[System.Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $androidHome, 'Machine')

# Add Android SDK tools to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$newPaths = @(
    "$androidHome\platform-tools",
    "$androidHome\cmdline-tools\latest\bin",
    "$androidHome\emulator"
)

foreach ($path in $newPaths) {
    if ($currentPath -notlike "*$path*") {
        $currentPath = "$currentPath;$path"
    }
}
[System.Environment]::SetEnvironmentVariable('Path', $currentPath, 'Machine')

# Restart PowerShell after this
```

**Verify Environment Variables:**

Close and reopen PowerShell, then run:

```powershell
# Check ANDROID_HOME
echo $env:ANDROID_HOME
# Should show: C:\Users\<YourUsername>\AppData\Local\Android\Sdk

# Check tools are accessible
adb --version
# Should show: Android Debug Bridge version x.x.x

sdkmanager --version
# Should show: version number

# If commands not found, restart computer
```

---

## Configure Android Development Environment

### Step 1: Pre-build the Android Project

Navigate to your project directory and run:

```powershell
# Navigate to project
cd C:\projects\docsshelf-v7

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Prebuild Android native project
npx expo prebuild --platform android

# This creates the 'android' folder with native code
# Takes 2-5 minutes on first run
```

**What `expo prebuild` does:**
- Creates native `android/` folder
- Generates Gradle build files
- Configures plugins and permissions
- Sets up app icons and splash screens

### Step 2: Verify Android Project Structure

After prebuild, you should have:

```
docsshelf-v7/
├── android/
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/
│   ├── gradle/
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradlew.bat
├── app.json
├── package.json
└── ...
```

### Step 3: Test Gradle Build

```powershell
# Navigate to android folder
cd android

# Test Gradle wrapper
.\gradlew --version
# Should show Gradle version and Java version

# Clean build (optional)
.\gradlew clean

# Return to project root
cd ..
```

---

## Build APK Locally

### Method 1: Using Expo CLI (Recommended)

**Development Build (for testing):**

```powershell
# Build debug APK (fastest, includes debug symbols)
npx expo run:android --variant debug

# Or using npm script (add to package.json):
npm run android
```

**Production Build:**

```powershell
# Build release APK (optimized, smaller size)
npx expo run:android --variant release

# APK location:
# android\app\build\outputs\apk\release\app-release.apk
```

### Method 2: Using Gradle Directly

**Navigate to android folder:**

```powershell
cd android
```

**Build Debug APK:**

```powershell
# Assemble debug APK
.\gradlew assembleDebug

# Output:
# android\app\build\outputs\apk\debug\app-debug.apk
```

**Build Release APK (Unsigned):**

```powershell
# Assemble release APK
.\gradlew assembleRelease

# Output:
# android\app\build\outputs\apk\release\app-release-unsigned.apk
```

**Build Release APK (Signed - for distribution):**

First, you need a keystore. See [Signing Your APK](#signing-your-apk) below.

```powershell
# After configuring keystore (see below)
.\gradlew assembleRelease

# Output:
# android\app\build\outputs\apk\release\app-release.apk
```

**Build AAB (for Play Store):**

```powershell
# Build Android App Bundle
.\gradlew bundleRelease

# Output:
# android\app\build\outputs\bundle\release\app-release.aab
```

### Method 3: Using Android Studio (GUI)

1. **Open Project:**
   ```
   - Launch Android Studio
   - File → Open
   - Navigate to: C:\projects\docsshelf-v7\android
   - Click "OK"
   - Wait for Gradle sync (2-5 minutes first time)
   ```

2. **Build APK:**
   ```
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Wait for build to complete
   - Notification appears: "APK(s) generated successfully"
   - Click "locate" to open folder
   ```

3. **Build for Production:**
   ```
   - Build → Generate Signed Bundle / APK
   - Select "APK" → Next
   - Create or select keystore (see next section)
   - Enter keystore passwords
   - Select "release" build variant
   - Click "Finish"
   ```

---

## Signing Your APK

For production distribution, APKs must be signed.

### Step 1: Generate Keystore

**Using Command Line (Recommended):**

```powershell
# Navigate to android/app folder
cd android\app

# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore docsshelf-release.keystore -alias docsshelf-key -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password: [Create a strong password]
# - Key password: [Use same or different password]
# - Your name: [Your Name]
# - Organization unit: [Your Company/Team]
# - Organization: [Your Company]
# - City: [Your City]
# - State: [Your State]
# - Country code: [US, IN, etc.]
```

**Using Android Studio:**

```
1. Build → Generate Signed Bundle / APK
2. Select APK → Next
3. Click "Create new..."
4. Fill in:
   - Key store path: android/app/docsshelf-release.keystore
   - Password: [Strong password]
   - Alias: docsshelf-key
   - Validity: 25 years (default)
   - Certificate details (name, org, etc.)
5. Click "OK"
```

**⚠️ CRITICAL: Backup Your Keystore!**

```powershell
# Copy keystore to safe location
Copy-Item android\app\docsshelf-release.keystore ~\Documents\docsshelf-keystore-backup.keystore

# Store passwords in password manager:
# - Keystore password: ___________
# - Key alias: docsshelf-key
# - Key password: ___________

# If you lose this keystore, you CANNOT update your app on Play Store!
```

### Step 2: Configure Gradle to Use Keystore

**Create `android/gradle.properties` (if not exists):**

```powershell
# Create file
New-Item -Path android\gradle.properties -ItemType File -Force
```

**Add keystore configuration to `android/gradle.properties`:**

```properties
# Keystore configuration
MYAPP_RELEASE_STORE_FILE=docsshelf-release.keystore
MYAPP_RELEASE_KEY_ALIAS=docsshelf-key
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password_here
MYAPP_RELEASE_KEY_PASSWORD=your_key_password_here
```

**⚠️ SECURITY: Add `gradle.properties` to `.gitignore`**

```powershell
# Add to .gitignore
Add-Content .gitignore "`nandroid/gradle.properties"
Add-Content .gitignore "android/app/docsshelf-release.keystore"
```

**Update `android/app/build.gradle`:**

Open `android/app/build.gradle` and add signing configuration:

```gradle
android {
    // ... existing configuration ...
    
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Build Signed APK

```powershell
# Navigate to android folder
cd android

# Build signed release APK
.\gradlew assembleRelease

# Output (now signed):
# android\app\build\outputs\apk\release\app-release.apk

# Verify signature
cd app\build\outputs\apk\release
jarsigner -verify -verbose -certs app-release.apk
# Should show: "jar verified"
```

---

## Build Commands Summary

### Quick Reference

```powershell
# From project root (C:\projects\docsshelf-v7)

# 1. Development build (debugging)
npx expo run:android --variant debug

# 2. Release build (testing before signing)
npx expo run:android --variant release

# 3. Signed production build
cd android
.\gradlew assembleRelease
cd ..

# 4. Build AAB for Play Store
cd android
.\gradlew bundleRelease
cd ..

# APK locations:
# Debug: android\app\build\outputs\apk\debug\app-debug.apk
# Release: android\app\build\outputs\apk\release\app-release.apk
# AAB: android\app\build\outputs\bundle\release\app-release.aab
```

### Build Time Expectations

- **First build**: 10-20 minutes (downloads dependencies)
- **Subsequent builds**: 3-5 minutes (with cache)
- **Clean builds**: 5-10 minutes

### Optimize Build Speed

```powershell
# Use Gradle daemon (enabled by default)
# Add to android/gradle.properties:
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError

# Clean cache if builds are slow
cd android
.\gradlew clean
.\gradlew --stop  # Stop Gradle daemon
cd ..
```

---

## Install APK on Device

After building, install the APK:

**Using ADB:**

```powershell
# Check device connected
adb devices

# Install debug APK
adb install android\app\build\outputs\apk\debug\app-debug.apk

# Install release APK (overwrite existing)
adb install -r android\app\build\outputs\apk\release\app-release.apk

# If "INSTALL_FAILED_UPDATE_INCOMPATIBLE", uninstall first:
adb uninstall com.docsshelf.app
adb install android\app\build\outputs\apk\release\app-release.apk
```

**Copy to Device:**

```powershell
# Copy APK to Downloads folder
Copy-Item android\app\build\outputs\apk\release\app-release.apk ~\Downloads\docsshelf-v1.0.0.apk

# Then transfer to phone via USB/email/cloud
# Install by tapping the APK file on device
```

---

## Troubleshooting

### Issue: "JAVA_HOME is not set"

```powershell
# Find Java installation
Get-ChildItem "C:\Program Files" -Filter "jdk*" -Directory -Recurse -ErrorAction SilentlyContinue | Select-Object FullName

# Set JAVA_HOME (replace with your path)
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot', 'Machine')

# Restart PowerShell
```

### Issue: "Android SDK not found"

```powershell
# Verify SDK location exists
Test-Path "$env:LOCALAPPDATA\Android\Sdk"

# If false, find SDK location in Android Studio:
# File → Settings → Appearance & Behavior → System Settings → Android SDK
# Copy the "Android SDK Location" path

# Set ANDROID_HOME to that path
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourUsername\AppData\Local\Android\Sdk', 'Machine')
```

### Issue: "Gradle build failed"

```powershell
# Clear Gradle cache
cd android
.\gradlew clean
.\gradlew --stop

# Delete build folders
Remove-Item -Recurse -Force .gradle, build, app\build -ErrorAction SilentlyContinue

# Rebuild
.\gradlew assembleRelease

# If still fails, check error message for specific issue
```

### Issue: "OutOfMemoryError" during build

```powershell
# Increase Gradle memory in android/gradle.properties:
echo "org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m" >> android\gradle.properties

# Or close other applications to free RAM
```

### Issue: "SDK location not found"

```powershell
# Create android/local.properties
New-Item -Path android\local.properties -ItemType File -Force

# Add SDK location (replace with your path)
Add-Content android\local.properties "sdk.dir=C:\\Users\\$env:USERNAME\\AppData\\Local\\Android\\Sdk"

# Note: Use double backslashes in local.properties
```

### Issue: Build succeeds but app crashes on device

```powershell
# Check logs
adb logcat | Select-String "com.docsshelf.app"

# Common causes:
# 1. Missing permissions in AndroidManifest.xml
# 2. Incompatible Android version
# 3. Missing native modules

# Try debug build first to get better error messages
npx expo run:android --variant debug
```

### Issue: "Execution failed for task ':app:lintVitalRelease'"

```powershell
# Disable lint checks in android/app/build.gradle
# Add inside android { } block:
lintOptions {
    checkReleaseBuilds false
    abortOnError false
}

# Then rebuild
```

---

## Advantages of Local Builds

✅ **Free** - No EAS subscription needed
✅ **Fast** - No upload/download time
✅ **Full control** - Direct access to native code
✅ **Debugging** - Easier to troubleshoot build issues
✅ **Offline** - Build without internet (after initial setup)
✅ **Privacy** - Code stays on your machine

## Disadvantages

❌ **Setup time** - Initial setup takes time
❌ **Disk space** - Requires ~20GB for SDK
❌ **Platform-specific** - Need Mac for iOS builds
❌ **Maintenance** - Need to update tools manually

---

## Next Steps

1. ✅ Install Java and Android Studio
2. ✅ Configure environment variables
3. ✅ Run `npx expo prebuild --platform android`
4. ✅ Build your first APK
5. ✅ Generate keystore for signing
6. ✅ Test on physical device
7. ✅ Build signed APK for distribution

---

## Additional Resources

- **Android Developer Docs**: https://developer.android.com/studio/build
- **Expo Prebuild**: https://docs.expo.dev/workflow/prebuild/
- **Gradle Documentation**: https://gradle.org/
- **React Native Docs**: https://reactnative.dev/docs/signed-apk-android

Good luck with your local builds! 🚀📱

# Android Local Build & Testing Guide

Complete step-by-step guide for building DocsShelf locally and testing on a physical Android device.

---

## Prerequisites

### 1. Install Node.js
1. Download Node.js 18+ LTS from: https://nodejs.org/
2. Run the installer
3. ✅ Check "Add to PATH" during installation
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### 2. Install Java Development Kit (JDK 17)
1. Download JDK 17 from: https://adoptium.net/temurin/releases/
   - Select: **Version 17 (LTS)**, **Windows**, **x64**, **JDK**, **.msi installer**
2. Run the installer
3. ✅ Check "Set JAVA_HOME variable"
4. ✅ Check "Add to PATH"
5. **Restart PowerShell** after installation
6. Verify installation:
   ```powershell
   java -version
   ```
   Should show: `openjdk version "17.x.x"`

### 3. Install Android Studio
1. Download from: https://developer.android.com/studio
2. Run the installer with default settings
3. Open Android Studio
4. Go through the setup wizard:
   - Choose "Standard" installation
   - Accept licenses
   - Wait for SDK download to complete

### 4. Configure Android SDK
1. In Android Studio, go to: **File → Settings → Appearance & Behavior → System Settings → Android SDK**
2. In **SDK Platforms** tab:
   - ✅ Check "Android 14.0 (UpsideDownCake)" (API 34)
   - ✅ Check "Android 13.0 (Tiramisu)" (API 33)
3. In **SDK Tools** tab, check:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
4. Click "Apply" and wait for downloads to complete
5. Note the SDK location (usually `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`)

---

## Environment Setup

### 1. Set Environment Variables
Open PowerShell as Administrator and run:

```powershell
# Set ANDROID_HOME
$AndroidHome = "$env:LOCALAPPDATA\Android\Sdk"
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $AndroidHome, 'User')

# Set JAVA_HOME (if not set during JDK installation)
$JavaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', $JavaHome, 'User')

# Add to PATH
$Path = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$NewPath = "$AndroidHome\platform-tools;$AndroidHome\tools;$JavaHome\bin;$Path"
[System.Environment]::SetEnvironmentVariable('Path', $NewPath, 'User')
```

**Restart PowerShell** after setting environment variables.

### 2. Verify Environment
```powershell
echo $env:ANDROID_HOME
echo $env:JAVA_HOME
java -version
adb --version
```

---

## Physical Device Setup

### 1. Enable Developer Options on Your Android Device
1. Go to **Settings → About phone**
2. Tap **Build number** 7 times
3. You'll see "You are now a developer!"

### 2. Enable USB Debugging
1. Go to **Settings → System → Developer options**
2. Toggle **ON** "Developer options"
3. Toggle **ON** "USB debugging"
4. Toggle **ON** "Install via USB" (if available)

### 3. Connect Device to Computer
1. Connect your Android device via USB cable
2. On your device, you'll see "Allow USB debugging?" prompt
3. ✅ Check "Always allow from this computer"
4. Tap "Allow"

### 4. Verify Device Connection
```powershell
adb devices
```
You should see:
```
List of devices attached
ABC123XYZ    device
```

If you see "unauthorized", disconnect and reconnect the device, then allow USB debugging again.

---

## Project Setup

### 1. Clone Repository (if not done)
```powershell
cd C:\Projects
git clone https://github.com/jmjoshi/docsshelf-v7.git
cd DocsShelf
```

### 2. Install Dependencies
```powershell
npm install --legacy-peer-deps
```

### 3. Create Gradle Home Directory (Avoid Cache Issues)
```powershell
mkdir C:\gradle_home -Force
```

---

## Building the App

### Method 1: Build & Install in One Command (Recommended)

#### For Development Build (with hot reload)
```powershell
# Set required environment variables for this session
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:GRADLE_USER_HOME = "C:\gradle_home"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

# Build and install
npx expo run:android
```

This will:
- Generate native Android code
- Build the APK
- Install on connected device
- Start the Metro bundler for hot reload

#### For Debug APK (Faster Builds)
```powershell
cd android
.\gradlew assembleDebug
```
APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

#### For Release APK (Production)
```powershell
cd android
.\gradlew assembleRelease
```
APK location: `android\app\build\outputs\apk\release\app-release.apk`

### Method 2: Manual Build & Install

#### Step 1: Generate Native Code (First Time Only)
```powershell
npx expo prebuild
```

#### Step 2: Build APK
```powershell
cd android
.\gradlew assembleDebug
```

#### Step 3: Install on Device
```powershell
adb install app\build\outputs\apk\debug\app-debug.apk
```

---

## Running the App

### Start Metro Bundler (for Development)
```powershell
npm start
```

The app on your device will connect to the Metro bundler for hot reload.

### Install and Open App Directly
```powershell
npx expo run:android
```

---

## Common Issues & Solutions

### Issue 1: "JAVA_HOME is set to an invalid directory"
**Solution:**
```powershell
# Find your JDK installation
Get-ChildItem "C:\Program Files\Eclipse Adoptium" | Select-Object Name

# Set JAVA_HOME to the correct path
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
```

### Issue 2: "SDK location not found"
**Solution:**
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### Issue 3: Gradle cache corruption
**Solution:**
```powershell
# Stop all Gradle daemons
cd android
.\gradlew --stop

# Clean build
.\gradlew clean

# Remove cache
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue

# Use custom Gradle home
$env:GRADLE_USER_HOME = "C:\gradle_home"
.\gradlew assembleDebug
```

### Issue 4: Device not detected
**Solution:**
1. Check USB cable (use data cable, not charge-only)
2. Try different USB port
3. Restart ADB:
   ```powershell
   adb kill-server
   adb start-server
   adb devices
   ```
4. Re-enable USB debugging on device

### Issue 5: App stuck on splash screen
**Solution:**
1. Check Metro bundler is running (`npm start`)
2. Reload app: Shake device → "Reload"
3. Check device is on same network (for wireless debugging)
4. Check firewall isn't blocking Metro (port 8081)

### Issue 6: "Execution failed for task ':app:mergeDebugResources'"
**Solution:**
```powershell
cd android
.\gradlew clean
Remove-Item -Recurse -Force app\build
.\gradlew assembleDebug
```

### Issue 7: Build successful but app crashes on launch
**Solution:**
1. Check device Android version (needs Android 8.0+)
2. View logs:
   ```powershell
   adb logcat | Select-String "DocsShelf"
   ```
3. Uninstall old version:
   ```powershell
   adb uninstall com.docsshelf.app
   ```
4. Reinstall fresh build

---

## Testing Workflow

### Daily Development
1. Start Metro bundler:
   ```powershell
   npm start
   ```
2. App connects automatically
3. Make code changes
4. App hot reloads automatically

### Full Rebuild (After native changes)
```powershell
# Set environment variables
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:GRADLE_USER_HOME = "C:\gradle_home"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

# Clean and rebuild
cd android
.\gradlew clean
cd ..
npx expo run:android
```

### Production Testing
```powershell
# Build release APK
cd android
.\gradlew assembleRelease

# Install on device
adb install app\build\outputs\apk\release\app-release.apk
```

---

## Build Times

**First Build**: 5-10 minutes
**Incremental Builds**: 1-3 minutes
**Hot Reload**: < 5 seconds

---

## Next Steps

- **Enable Dark Mode Testing**: Change device theme
- **Test Different Screen Sizes**: Use multiple devices
- **Monitor Performance**: Use Android Studio Profiler
- **Check Memory Usage**: `adb shell dumpsys meminfo com.docsshelf.app`
- **View Logs**: `adb logcat`

---

## Quick Reference Commands

```powershell
# Check environment
java -version
adb devices
echo $env:ANDROID_HOME

# Build commands
npx expo run:android                    # Build & install (dev)
cd android; .\gradlew assembleDebug    # Debug APK
cd android; .\gradlew assembleRelease  # Release APK

# Device commands
adb devices                            # List devices
adb install path\to\app.apk           # Install APK
adb uninstall com.docsshelf.app       # Uninstall app
adb logcat                            # View logs
adb shell pm clear com.docsshelf.app  # Clear app data

# Development
npm start                              # Start Metro bundler
npm run android:dev                    # Build & start
```

---

## Support

If you encounter issues not covered here:
1. Check the error message carefully
2. Review the "Common Issues" section above
3. Search the error on Google/Stack Overflow
4. Check Expo documentation: https://docs.expo.dev

---

**Last Updated**: December 6, 2025
**Tested On**: Windows 11, Android 12-14

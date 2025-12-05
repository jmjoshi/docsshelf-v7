# Android Emulator Testing Guide

## 🖥️ Testing on Android Emulator

### Available Emulator
- **Device:** Pixel 5 (Android Virtual Device)

## 🚀 Quick Start

### Method 1: Start Emulator and Install APK

```powershell
# 1. Start the emulator
emulator -avd Pixel_5

# 2. Wait for emulator to fully boot (30-60 seconds)

# 3. In a NEW terminal, verify emulator is running
adb devices

# 4. Install the debug APK
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# 5. Launch the app
adb shell am start -n com.docsshelf.app/.MainActivity
```

### Method 2: Use Expo CLI (Faster for Development)

```powershell
# Start development server with emulator
npx expo run:android
```

This will:
- Start Metro bundler
- Launch emulator automatically
- Install and run the app
- Enable hot reload for development

## 📋 Step-by-Step Instructions

### Step 1: Start the Emulator

**Option A: Command Line**
```powershell
emulator -avd Pixel_5
```

**Option B: Android Studio**
1. Open Android Studio
2. Click "Device Manager" (phone icon on right sidebar)
3. Click ▶️ play button next to Pixel_5
4. Wait for emulator to boot

### Step 2: Verify Emulator is Running

```powershell
adb devices
```

**Expected Output:**
```
List of devices attached
emulator-5554    device
```

### Step 3: Install the APK

```powershell
# Navigate to project root
cd C:\projects\docsshelf-v7

# Install debug APK
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

**Expected Output:**
```
Performing Streamed Install
Success
```

### Step 4: Launch the App

```powershell
adb shell am start -n com.docsshelf.app/.MainActivity
```

The app should now open in the emulator!

## 🛠️ Emulator Management

### List Available Emulators
```powershell
emulator -list-avds
```

### Create New Emulator (if needed)
```powershell
# Open Android Studio AVD Manager
# Or use command line:
avdmanager create avd -n MyEmulator -k "system-images;android-33;google_apis;x86_64" -d pixel_5
```

### Stop Emulator
```powershell
adb -s emulator-5554 emu kill
```

### Cold Boot (Fresh Start)
```powershell
emulator -avd Pixel_5 -no-snapshot-load
```

## 🐛 Debugging on Emulator

### View Real-time Logs
```powershell
adb logcat | Select-String "ReactNativeJS|ExpoModules|DocsShelf"
```

### Clear App Data (Fresh Start)
```powershell
adb shell pm clear com.docsshelf.app
```

### Uninstall App
```powershell
adb uninstall com.docsshelf.app
```

### Take Screenshot
```powershell
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

### Record Video
```powershell
# Start recording (max 3 minutes)
adb shell screenrecord /sdcard/demo.mp4

# Stop recording: Ctrl+C

# Pull video to computer
adb pull /sdcard/demo.mp4
```

## 🧪 Testing Features on Emulator

### ✅ What Works Well on Emulator:
- UI/UX testing
- Navigation flow
- Authentication (login, registration)
- Database operations
- Search functionality
- Settings and preferences
- Animations and transitions
- Dark/light theme
- Responsive design
- Welcome tutorial
- Toast notifications
- Error handling

### ⚠️ Emulator Limitations:
- **Camera:** Uses virtual camera (limited functionality)
  - Document scanning may not work well
  - Use file picker instead
- **Biometric Auth:** Not available on most emulators
  - Test fingerprint/face ID on real device
- **USB Backup:** Cannot test USB storage
  - Emulator doesn't support USB-OTG
- **Performance:** May be slower than real device
  - Launch time will be longer
  - Memory usage different
- **Sensors:** Accelerometer, gyroscope limited
- **Network:** Different behavior than real cellular

### 📸 Testing Camera Features

Since emulator camera is limited, test document upload with:

```powershell
# Push test files to emulator
adb push "C:\path\to\test-document.pdf" /sdcard/Download/
adb push "C:\path\to\test-image.jpg" /sdcard/Pictures/
```

Then use the file picker in the app to select these files.

## 🎯 Recommended Testing Strategy

### On Emulator (Initial Testing):
1. **UI/UX Verification:**
   - All screens render correctly
   - Navigation works
   - Buttons and interactions
   - Toast notifications
   - Error messages
   - Empty states
   - Loading screens
   - Animations

2. **Core Functionality:**
   - Registration/Login
   - Category management
   - Document upload (via file picker)
   - Document viewing
   - Search
   - Favorites
   - Settings

3. **Performance Baseline:**
   - Note launch time (will be slower)
   - Check search speed
   - Verify no crashes

### On Real Device (Final Testing):
1. **Camera Features:**
   - Document scanning
   - Multi-page PDFs
   - Image quality

2. **Biometric Auth:**
   - Fingerprint
   - Face ID

3. **Real-World Performance:**
   - Actual launch time (< 2s target)
   - Accurate memory usage
   - Battery consumption
   - USB backup with adapter

4. **Hardware-Specific:**
   - Different screen sizes
   - Various Android versions
   - Manufacturer-specific features

## 💡 Pro Tips

### 1. Speed Up Emulator
```powershell
# Use hardware acceleration
emulator -avd Pixel_5 -gpu host

# Allocate more RAM (if available)
# Edit AVD settings in Android Studio: 2GB+ RAM
```

### 2. Multiple Emulators
```powershell
# Run multiple instances
emulator -avd Pixel_5 &
emulator -avd Pixel_3a &
```

### 3. Keyboard Shortcuts in Emulator
- `Ctrl + M` - Open React Native dev menu
- `R R` (double tap R) - Reload app
- `Ctrl + Shift + H` - Home button
- `Ctrl + Shift + B` - Back button

### 4. Enable Hot Reload
```powershell
# For development mode
npx expo start --android

# Shake emulator to open dev menu
adb shell input keyevent 82

# Enable Fast Refresh
```

### 5. Test Different Configurations
```powershell
# Rotate to landscape
adb shell settings put system user_rotation 1

# Back to portrait
adb shell settings put system user_rotation 0

# Toggle dark mode
adb shell "cmd uimode night yes"
adb shell "cmd uimode night no"
```

## 🔧 Troubleshooting

### Emulator Won't Start
```powershell
# Check if emulator is already running
adb devices

# Kill all emulator processes
taskkill /F /IM qemu-system-x86_64.exe

# Restart
emulator -avd Pixel_5
```

### App Won't Install
```powershell
# Uninstall old version first
adb uninstall com.docsshelf.app

# Then reinstall
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

### Emulator is Slow
- Close other applications
- Allocate more RAM to emulator
- Use x86_64 system image (faster than ARM)
- Enable hardware acceleration in BIOS

### Can't Connect to Emulator
```powershell
# Restart ADB server
adb kill-server
adb start-server
adb devices
```

## 📊 Performance Testing on Emulator

### Measure Launch Time
```powershell
# Start app and time it
adb shell am start -W -n com.docsshelf.app/.MainActivity
```

Look for `TotalTime` in output.

### Monitor Memory Usage
```powershell
adb shell dumpsys meminfo com.docsshelf.app | Select-String "TOTAL"
```

### Check CPU Usage
```powershell
adb shell top -n 1 | Select-String "docsshelf"
```

## ✅ Emulator Testing Checklist

### Basic Functionality
- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] Registration works
- [ ] Login works
- [ ] Navigation between screens
- [ ] Category management
- [ ] Document upload (file picker)
- [ ] Document viewing
- [ ] Search functionality
- [ ] Settings changes persist

### UI/UX Components (New!)
- [ ] Toast notifications appear
- [ ] Error messages display correctly
- [ ] Empty states show
- [ ] Skeleton loading screens
- [ ] Animations smooth
- [ ] Buttons work (all variants)
- [ ] Dark/light theme toggle
- [ ] Welcome tutorial on first launch
- [ ] Responsive layout
- [ ] Portrait/landscape orientation

### Edge Cases
- [ ] App works in airplane mode
- [ ] Handles low storage
- [ ] Background/foreground transitions
- [ ] Screen rotation during operations
- [ ] Back button navigation
- [ ] Long text handling

## 🚀 Next Steps

1. **Start Testing:**
   ```powershell
   emulator -avd Pixel_5
   adb install -r android\app\build\outputs\apk\debug\app-debug.apk
   ```

2. **Run Through Checklist:** Test all features systematically

3. **Document Issues:** Note any bugs or improvements

4. **Real Device Testing:** Test critical features (camera, biometric, USB) on physical device

5. **Performance Report:** Compare emulator vs target metrics

---

**Last Updated:** November 27, 2025  
**Emulator:** Pixel 5 AVD  
**Build:** app-debug.apk (228.75 MB)

# Android Local Build Testing Guide

## 📦 Build Information

**Build Type:** Debug APK  
**Build Date:** November 27, 2025  
**Version:** 1.0.0  
**Build Duration:** ~2 hours 13 minutes (first build)  

## 📍 APK Location

**Debug APK:**
```
C:\projects\docsshelf-v7\android\app\build\outputs\apk\debug\app-debug.apk
```
- **Size:** 228.75 MB
- **Signing:** Debug keystore (for testing only)
- **Last Modified:** November 27, 2025 6:55 PM

**Release APK (from previous build):**
```
C:\projects\docsshelf-v7\android\app\build\outputs\apk\release\app-release.apk
```
- **Size:** 135.65 MB
- **Signing:** Release keystore
- **Last Modified:** November 26, 2025 6:00 PM

## 🔧 Build Commands

### Debug Build (Development/Testing)
```powershell
cd android
.\gradlew assembleDebug
```

### Release Build (Production)
```powershell
cd android
.\gradlew assembleRelease
```

### Clean Build (if needed)
```powershell
cd android
.\gradlew clean
.\gradlew assembleDebug
```

## 📱 Installation Methods

### Method 1: USB Connection (ADB)

1. **Enable Developer Options on Android device:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Enable "USB Debugging" in Developer Options

2. **Connect device via USB**

3. **Install APK using ADB:**
```powershell
# Navigate to Android SDK platform-tools or ensure adb is in PATH
adb devices  # Verify device is connected
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

4. **Launch the app:**
```powershell
adb shell am start -n com.docsshelf.app/.MainActivity
```

### Method 2: Direct Transfer

1. **Copy APK to device:**
   - Connect device via USB
   - Copy `app-debug.apk` to device's Download folder
   - Or use file sharing (Google Drive, email, etc.)

2. **Install on device:**
   - Open Files app on Android
   - Navigate to Downloads
   - Tap on `app-debug.apk`
   - Allow "Install from Unknown Sources" if prompted
   - Tap "Install"

### Method 3: Wireless ADB (Android 11+)

1. **Enable Wireless Debugging:**
   - Settings > Developer Options > Wireless Debugging
   - Tap "Pair device with pairing code"

2. **Pair from computer:**
```powershell
adb pair <IP>:<PORT>  # Enter pairing code when prompted
adb connect <IP>:<PORT>
```

3. **Install APK:**
```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

## 🧪 Testing Checklist

### Option A: Device Testing (Production Readiness)

#### 1. Installation & Launch
- [ ] APK installs successfully
- [ ] App launches without crashes
- [ ] Splash screen displays correctly
- [ ] Launch time < 2 seconds ⏱️

#### 2. Authentication Flow
- [ ] Registration screen works
- [ ] Password validation (12+ chars, uppercase, lowercase, numbers, symbols)
- [ ] Account creation saves to local DB
- [ ] Login with created account
- [ ] Account lockout after 5 failed attempts
- [ ] MFA setup (if enabled)
- [ ] Biometric authentication (if supported)

#### 3. Core Features
- [ ] Category management (create, edit, delete, nested)
- [ ] Document upload (file picker works)
- [ ] Document scanning (camera access)
- [ ] Document viewing (PDF, images)
- [ ] Search functionality (< 500ms) 🔍
- [ ] Favorites system
- [ ] Document encryption/decryption

#### 4. Backup & Restore
- [ ] Create encrypted backup
- [ ] Export backup to storage
- [ ] USB backup (with adapter)
- [ ] Restore from backup
- [ ] Verify data integrity

#### 5. Settings & Security
- [ ] Profile management
- [ ] Security settings
- [ ] About page displays correctly
- [ ] Privacy Policy & Terms accessible
- [ ] Session management

#### 6. Performance Metrics
- [ ] Launch time: < 2s ⏱️
- [ ] Search speed: < 500ms 🔍
- [ ] Animations: 60fps 🎬
- [ ] Memory usage: < 200MB 💾
- [ ] No lag or stuttering
- [ ] Battery consumption reasonable

#### 7. UI/UX Polish (New!)
- [ ] Toast notifications appear correctly
- [ ] Error messages are user-friendly
- [ ] Empty states show helpful messages
- [ ] Skeleton loading screens smooth
- [ ] Animations feel natural
- [ ] Buttons respond correctly (5 variants)
- [ ] Dark/light theme switches properly
- [ ] Welcome tutorial on first launch
- [ ] Feature highlights work

#### 8. Responsive Design (New!)
- [ ] Tablet layout (if available)
- [ ] Landscape orientation
- [ ] Portrait orientation
- [ ] Proper spacing on different screen sizes
- [ ] Text scales appropriately

#### 9. Accessibility
- [ ] Screen reader support (TalkBack)
- [ ] Touch targets ≥ 44x44px
- [ ] Sufficient color contrast
- [ ] Text readable at default size

#### 10. Edge Cases
- [ ] Airplane mode (offline functionality)
- [ ] Low storage warnings
- [ ] Large files (max size handling)
- [ ] Network interruptions during sync
- [ ] App backgrounding/foregrounding
- [ ] Device rotation during operations

## 🐛 Debugging

### View Logs (Real-time)
```powershell
adb logcat | Select-String "ReactNativeJS|ExpoModules|DocsShelf"
```

### Save Logs to File
```powershell
adb logcat -d > android-logs.txt
```

### Clear App Data (Fresh Start)
```powershell
adb shell pm clear com.docsshelf.app
```

### Uninstall App
```powershell
adb uninstall com.docsshelf.app
```

## 📊 Performance Monitoring

### Check Memory Usage
```powershell
adb shell dumpsys meminfo com.docsshelf.app
```

### Check Battery Stats
```powershell
adb shell dumpsys batterystats com.docsshelf.app
```

### Monitor Performance
```powershell
adb shell top | Select-String "docsshelf"
```

## ⚠️ Known Limitations (Debug Build)

1. **Larger Size:** Debug builds are ~230MB vs ~135MB release builds (includes debug symbols)
2. **Not Signed for Production:** Uses debug keystore, not suitable for Play Store
3. **Performance:** Slightly slower than release builds (no optimizations)
4. **Security:** Debug mode allows some development features

## 🚀 Production Build (Release)

For production deployment, use the release APK:

```powershell
cd android
.\gradlew assembleRelease
```

**Release APK Location:**
```
android\app\build\outputs\apk\release\app-release.apk
```

**Release Build Features:**
- Smaller size (~135MB)
- Optimized performance (R8 enabled)
- Signed with release keystore
- ProGuard obfuscation
- Resource shrinking

## 📝 Next Steps

After successful testing:

1. **Document Issues:** Create list of bugs/improvements found
2. **Performance Report:** Record actual metrics vs targets
3. **User Feedback:** Note UX improvements needed
4. **Device-Specific Issues:** Document any hardware-specific problems
5. **Production Readiness:** Complete Option A checklist
6. **Final Polish:** Address critical issues before v1.0

## 🎯 Production Readiness Status

- ✅ **Option B (Performance):** Tools ready
- ✅ **Option C (UI/UX):** All 10 phases complete
- ✅ **Option D (Documentation):** Core docs complete
- 🧪 **Option A (Device Testing):** IN PROGRESS (Current Task)

**Overall v1.0 Readiness:** 90% → 95% (with successful testing)

---

**Last Updated:** November 27, 2025  
**Build Engineer:** GitHub Copilot  
**Project:** DocsShelf v7 - Secure Document Management

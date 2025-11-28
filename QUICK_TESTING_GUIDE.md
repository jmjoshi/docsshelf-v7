# 🧪 Quick Testing Commands - DocsShelf on Emulator

## App is Now Running! ✅

Your DocsShelf app is successfully installed and running on the Pixel 5 emulator.

## 📱 Useful Commands While Testing

### View App Logs (Real-time)
```powershell
# In a new terminal
adb logcat | Select-String "ReactNativeJS|ExpoModules|DocsShelf"
```

### Take Screenshot
```powershell
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./emulator-screenshots/
```

### Clear App Data (Fresh Start)
```powershell
adb shell pm clear com.docsshelf.app
```

### Restart App
```powershell
adb shell am force-stop com.docsshelf.app
adb shell am start -n com.docsshelf.app/.MainActivity
```

### Toggle Dark Mode
```powershell
# Enable dark mode
adb shell "cmd uimode night yes"

# Disable dark mode
adb shell "cmd uimode night no"
```

### Rotate Screen
```powershell
# Landscape
adb shell settings put system user_rotation 1

# Portrait
adb shell settings put system user_rotation 0
```

### Check Memory Usage
```powershell
adb shell dumpsys meminfo com.docsshelf.app | Select-String "TOTAL"
```

### Add Test Files to Emulator
```powershell
# Add a test PDF
adb push "C:\path\to\test.pdf" /sdcard/Download/

# Add a test image
adb push "C:\path\to\test.jpg" /sdcard/Pictures/
```

## 🧪 Testing Checklist (Priority Order)

### 1. Launch & First Impressions ⭐
- [ ] App launches successfully
- [ ] Welcome tutorial appears (5 screens)
- [ ] Can skip or go through tutorial
- [ ] No crashes on launch

### 2. Registration & Login ⭐⭐⭐
- [ ] Registration screen works
- [ ] Password validation enforced (12+ chars, symbols, etc.)
- [ ] Account created successfully
- [ ] Can log out and log back in
- [ ] Account lockout after 5 failed attempts

### 3. UI/UX Components ⭐⭐
- [ ] Toast notifications appear correctly
- [ ] Error messages are user-friendly
- [ ] Empty states show (try viewing categories before creating any)
- [ ] Skeleton loading screens appear
- [ ] Buttons respond correctly
- [ ] Dark/light theme works

### 4. Core Features ⭐⭐⭐
- [ ] Create category
- [ ] Edit category
- [ ] Delete category
- [ ] Upload document (use file picker)
- [ ] View document
- [ ] Search documents
- [ ] Add to favorites

### 5. Navigation ⭐⭐
- [ ] Bottom tabs work
- [ ] Back button works
- [ ] Screen transitions smooth
- [ ] No stuck screens

### 6. Settings ⭐
- [ ] Profile settings accessible
- [ ] Security settings work
- [ ] About page displays
- [ ] Theme preference saves

## ⚠️ Known Emulator Limitations

**Won't Work on Emulator:**
- ❌ Camera/Document scanning (test on real device)
- ❌ Biometric authentication (test on real device)
- ❌ USB backup (test on real device)

**Use These Instead:**
- ✅ File picker for document upload
- ✅ Standard login (no biometric)
- ✅ Internal storage backup

## 📊 Performance Observations

Note these while testing:
- Launch time (should be < 3s on emulator, < 2s on device)
- Search speed
- Animation smoothness
- Any lag or stuttering
- Memory usage (check with command above)

## 🐛 Report Issues

If you find issues, note:
1. **What you did** (steps to reproduce)
2. **What happened** (actual behavior)
3. **What you expected** (expected behavior)
4. **Screenshot** (use screencap command)
5. **Logs** (use logcat command)

## 🎯 Critical Test Scenarios

### Scenario 1: New User Flow
1. Launch app → See tutorial
2. Complete or skip tutorial
3. Register new account
4. Create first category
5. Upload first document
6. View and search document

### Scenario 2: Document Management
1. Create multiple categories
2. Upload documents to different categories
3. Search for documents
4. Add documents to favorites
5. Edit document metadata
6. Delete documents

### Scenario 3: UI/UX Testing
1. Toggle dark/light mode
2. Rotate screen (portrait/landscape)
3. Trigger error messages (try invalid operations)
4. Observe empty states
5. Check loading screens
6. Test all button variants

## 📝 Next Steps After Emulator Testing

1. **Document Results:**
   - Create list of bugs found
   - Note UI/UX improvements
   - Record performance metrics

2. **Physical Device Testing:**
   - Test camera features
   - Test biometric auth
   - Test USB backup
   - Verify actual performance

3. **iOS Testing:**
   - Create iOS build
   - Test on iPhone or iOS simulator
   - Verify cross-platform consistency

## 💡 Pro Tips

- Keep logcat running in a separate terminal
- Take screenshots of any issues
- Test in both dark and light mode
- Try edge cases (very long text, many items, etc.)
- Test offline functionality (enable airplane mode in emulator)

---

**Happy Testing! 🚀**

The app is running - explore all features and note any issues you find!

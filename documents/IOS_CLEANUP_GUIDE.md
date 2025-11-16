# iOS Physical Device Cleanup Guide
**DocsShelf v7 - Development Reference**  
**Last Updated:** November 15, 2025

This guide explains how to completely reset/cleanup the DocsShelf app on your physical iOS device during development.

---

## 🔄 Quick Reset Methods

### Method 1: Delete and Reinstall via Expo Go (Recommended)

1. **On your iPhone:**
   - Open the **Expo Go** app
   - Find **DocsShelf** in your recent projects list
   - **Long press** on the DocsShelf project
   - Tap **"Remove from Recents"** or swipe left and tap **Delete**

2. **Clear App Data:**
   - Go to **Settings** → **General** → **iPhone Storage**
   - Find and tap **Expo Go**
   - Tap **"Offload App"** (this keeps documents and data) OR
   - Tap **"Delete App"** (completely removes everything)
   - Reinstall **Expo Go** from the App Store if you deleted it

3. **Reload the App:**
   - On your development machine, run: `npm start`
   - Scan the QR code again with your iPhone camera
   - App will load fresh with no cached data

---

### Method 2: Clear Expo Go Cache

1. **Open Expo Go** on your iPhone
2. **Shake your device** (or use 3-finger tap on simulator)
3. A menu will appear with options
4. Tap **"Reload"** to refresh without clearing data
5. OR tap **"Go to Home"** and remove the app from recents

---

### Method 3: Force Reload from Dev Menu

1. **While app is running:**
   - **Shake your device** to open the developer menu
   - Tap **"Reload"** to do a normal reload
   - OR tap **"Reload and Clear Cache"** for a fresh start

2. **If stuck/frozen:**
   - Force quit Expo Go (swipe up from bottom, swipe app away)
   - Reopen Expo Go
   - Scan QR code again

---

### Method 4: Complete Nuclear Reset

If the app is completely broken or won't load:

1. **Delete Expo Go:**
   - Long press Expo Go app icon on home screen
   - Tap **"Remove App"** → **"Delete App"**
   - Confirm deletion

2. **Reinstall Expo Go:**
   - Open **App Store**
   - Search for **"Expo Go"**
   - Tap **"Get"** / **"Install"**

3. **Clear Development Server Cache:**
   ```powershell
   # On your development machine (Windows PowerShell):
   npx expo start --clear
   ```

4. **Reconnect:**
   - Open Expo Go on iPhone
   - Scan the QR code from terminal
   - App loads completely fresh

---

## 📱 iOS Settings to Check

### Camera Permissions
If camera isn't working:

1. **Settings** → **Privacy & Security** → **Camera**
2. Find **Expo Go** in the list
3. Make sure toggle is **ON** (green)

### Storage Space
If app won't load:

1. **Settings** → **General** → **iPhone Storage**
2. Check available space (need at least 1-2 GB free)
3. Clear space if needed

### Background App Refresh
For better development experience:

1. **Settings** → **General** → **Background App Refresh**
2. Find **Expo Go**
3. Set to **Wi-Fi** or **Wi-Fi & Cellular Data**

---

## 🔍 Checking App State

### View Console Logs

1. **Open Terminal on Mac/PC**
2. Run: `npx expo start`
3. When app runs on phone, logs appear in terminal
4. Look for **`[ScanFlowScreen]`** and **`[DocumentScanScreen]`** logs
5. These show what's happening during scan flow

### Check for Errors

1. **Shake device** while app is running
2. If there are JavaScript errors, they'll show in red
3. Take a screenshot and share for debugging

---

## ⚡ Quick Fixes for Common Issues

### "App won't load / Stuck on splash screen"
```
1. Force quit Expo Go
2. On dev machine: Ctrl+C to stop server
3. Run: npx expo start --clear
4. Scan QR code again
```

### "Camera permissions not working"
```
1. Settings → Privacy → Camera → Expo Go → ON
2. Delete app from Expo Go recents
3. Reload and test again
```

### "Changes not appearing on phone"
```
1. On dev machine: Press 'r' in terminal to reload
2. OR shake device → tap "Reload"
3. If still not working: npx expo start --clear
```

### "App crashes immediately"
```
1. Check terminal for error messages (red text)
2. Force quit Expo Go on phone
3. On dev machine: Ctrl+C, then npx expo start --clear
4. Reload app on phone
```

### "Can't scan QR code"
```
1. Make sure phone and computer are on same Wi-Fi
2. Try: npx expo start --tunnel (slower but works across networks)
3. OR manually type the URL shown in terminal into Expo Go
```

---

## 🎯 Development Workflow

### Best Practice for Testing Changes

1. **Make code changes** on computer
2. **Save files** (changes auto-reload in most cases)
3. **Check terminal** for any errors
4. **On phone:**
   - Changes should appear automatically (Fast Refresh)
   - If not, shake → "Reload"
5. **Test the feature**
6. **Repeat**

### When to Force Restart

Force restart (stop server + clear cache) when:
- ✅ Adding/removing npm packages
- ✅ Changing app.json configuration
- ✅ Modifying Metro bundler settings
- ✅ App is completely frozen/broken
- ✅ Navigation isn't working correctly

Regular reload is fine for:
- ✅ Changing component code
- ✅ Modifying styles
- ✅ Updating text/UI
- ✅ Changing state logic

---

## 📋 Checklist for Clean Test

Before testing a new feature from scratch:

- [ ] Stop development server (Ctrl+C)
- [ ] Clear caches: `npx expo start --clear`
- [ ] Delete app from Expo Go recents (long press)
- [ ] Check terminal shows "Metro waiting on exp://..."
- [ ] Scan QR code with iPhone camera
- [ ] Wait for app to fully load (splash screen → home)
- [ ] Check camera permissions if testing scan feature
- [ ] Test the feature step by step
- [ ] Watch console logs in terminal

---

## 🆘 Emergency Commands

### Development Machine (Windows PowerShell)

```powershell
# Stop everything and start fresh
# 1. Stop server (Ctrl+C)

# 2. Clear all caches
npx expo start --clear

# 3. If metro bundler is stuck
Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process -Force
npx expo start --clear

# 4. Nuclear option (if nothing works)
Remove-Item -Recurse -Force .expo, node_modules\.cache
npm install
npx expo start --clear
```

### On iPhone

```
1. Force quit Expo Go (swipe up, swipe away)
2. Restart iPhone if really stuck (hold power + volume)
3. Reopen Expo Go
4. Scan QR code
```

---

## 📝 Notes

- **Expo Go** stores your app in a sandboxed environment
- Each "reload" keeps the database and state unless you clear data
- **Removing from recents** clears the cached JavaScript bundle
- **Deleting Expo Go** clears ALL apps and data
- Your **source code on computer** is never affected - only the running app

---

**Remember:** Most issues are fixed by:
1. `npx expo start --clear` on computer
2. Force quit + reopen Expo Go on phone
3. Rescan QR code

That's it! 🎉

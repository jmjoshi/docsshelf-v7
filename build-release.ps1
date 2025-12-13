# DocsShelf Build Script - Fixes Gradle hang at 92%
# This script uses --no-daemon and proper output handling to prevent terminal hangs

Write-Host "Starting DocsShelf Release Build..." -ForegroundColor Green

# Navigate to android directory
Set-Location android

# Kill any existing Gradle daemons
Write-Host "Stopping Gradle daemons..." -ForegroundColor Yellow
& .\gradlew --stop | Out-Null

# Build with --no-daemon to prevent hanging
Write-Host "Building release APK (this may take 5-10 minutes)..." -ForegroundColor Yellow
& .\gradlew assembleRelease --no-daemon

# Return to root
Set-Location ..

# Check if APK exists
if (Test-Path "android\app\build\outputs\apk\release\app-release.apk") {
    $apkSize = (Get-Item "android\app\build\outputs\apk\release\app-release.apk").Length / 1MB
    Write-Host "`n✓ Build successful!" -ForegroundColor Green
    Write-Host "✓ APK created: $($apkSize.ToString('0.00')) MB" -ForegroundColor Green
    
    # Auto install
    Write-Host "Installing on emulator..." -ForegroundColor Yellow
    & "C:\Users\janer\AppData\Local\Android\Sdk\platform-tools\adb.exe" -s emulator-5554 install -r android\app\build\outputs\apk\release\app-release.apk
    Write-Host "✓ Installation complete!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Build failed - APK not found" -ForegroundColor Red
}

# Build APK Script for Task Tracker
# This script sets up Capacitor and builds an Android APK

Write-Host "=== Task Tracker APK Builder ===" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "app/frontend")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "`n[1/6] Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Step 2: Install Capacitor in frontend
Write-Host "`n[2/6] Installing Capacitor..." -ForegroundColor Yellow
Set-Location "app/frontend"
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install Capacitor" -ForegroundColor Red
    exit 1
}

# Step 3: Initialize Capacitor (if not already done)
if (-not (Test-Path "capacitor.config.ts")) {
    Write-Host "`n[3/6] Initializing Capacitor..." -ForegroundColor Yellow
    npx cap init "Task Tracker" "com.shillongpixels.tasktracker" --web-dir=dist
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to initialize Capacitor" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Build frontend
Write-Host "`n[4/6] Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build frontend" -ForegroundColor Red
    exit 1
}

# Step 5: Add Android platform (if not exists)
if (-not (Test-Path "android")) {
    Write-Host "`n[5/6] Adding Android platform..." -ForegroundColor Yellow
    npx cap add android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to add Android platform" -ForegroundColor Red
        Write-Host "`nNote: You may need Android SDK installed. Install Android Studio or Android SDK command-line tools." -ForegroundColor Yellow
        exit 1
    }
}

# Step 6: Sync and copy web assets
Write-Host "`n[6/6] Syncing Capacitor..." -ForegroundColor Yellow
npx cap copy android
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to sync Capacitor" -ForegroundColor Red
    exit 1
}

# Step 7: Build APK using Gradle
Write-Host "`n[7/7] Building APK..." -ForegroundColor Yellow
Set-Location "android"

# Check if Gradle wrapper exists
if (-not (Test-Path "gradlew.bat")) {
    Write-Host "Gradle wrapper not found. Attempting to generate..." -ForegroundColor Yellow
    # Try to use gradle if available globally
    if (Get-Command gradle -ErrorAction SilentlyContinue) {
        gradle wrapper
    } else {
        Write-Host "`nERROR: Gradle wrapper not found and 'gradle' command not available." -ForegroundColor Red
        Write-Host "Please install Android Studio or Android SDK with build tools." -ForegroundColor Yellow
        Write-Host "`nAlternative: Open Android Studio and use:" -ForegroundColor Cyan
        Write-Host "  File > Open > Select 'android' folder" -ForegroundColor Cyan
        Write-Host "  Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor Cyan
        Set-Location "../.."
        exit 1
    }
}

# Build debug APK
Write-Host "Running Gradle build (this may take a few minutes)..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
        Write-Host "APK built successfully!" -ForegroundColor Green
        Write-Host "Location: $(Resolve-Path $apkPath)" -ForegroundColor Cyan
        Write-Host "`nYou can now share this APK file with your team members." -ForegroundColor Yellow
        Write-Host "They need to enable 'Install unknown apps' in their Android settings." -ForegroundColor Yellow
    } else {
        Write-Host "`nBuild completed but APK not found at expected location." -ForegroundColor Yellow
        Write-Host "Check: android\app\build\outputs\apk\debug\" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n=== BUILD FAILED ===" -ForegroundColor Red
    Write-Host "Gradle build failed. Common issues:" -ForegroundColor Yellow
    Write-Host "1. Android SDK not installed or ANDROID_HOME not set" -ForegroundColor Yellow
    Write-Host "2. Java JDK not installed" -ForegroundColor Yellow
    Write-Host "3. Missing Android build tools" -ForegroundColor Yellow
    Write-Host "`nTo fix:" -ForegroundColor Cyan
    Write-Host "1. Install Android Studio (includes SDK and build tools)" -ForegroundColor Cyan
    Write-Host "2. OR install Android SDK command-line tools and set ANDROID_HOME" -ForegroundColor Cyan
    Write-Host "3. Install Java JDK 11 or higher" -ForegroundColor Cyan
}

Set-Location "../.."

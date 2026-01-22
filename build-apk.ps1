# Task Tracker - APK Builder Script
# This script builds an Android APK for sharing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Task Tracker - APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "app/frontend")) {
    Write-Host "ERROR: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Check API URL configuration
Write-Host "[1/5] Checking API URL configuration..." -ForegroundColor Yellow
$envFile = "app/frontend/.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "VITE_API_BASE_URL=(.+)") {
        $apiUrl = $matches[1].Trim()
        Write-Host "  Found: VITE_API_BASE_URL=$apiUrl" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: VITE_API_BASE_URL not set in .env" -ForegroundColor Yellow
        Write-Host "  The APK will use localhost:4000 (won't work on other devices)" -ForegroundColor Yellow
        Write-Host ""
        $useAppsScript = Read-Host "Do you want to use Apps Script backend? (y/n)"
        if ($useAppsScript -eq "y") {
            $scriptUrl = Read-Host "Enter your Apps Script Web App URL"
            Add-Content -Path $envFile -Value "`nVITE_API_BASE_URL=$scriptUrl"
            Write-Host "  Added VITE_API_BASE_URL to .env" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  .env file not found, creating..." -ForegroundColor Yellow
    $useAppsScript = Read-Host "Do you want to use Apps Script backend? (y/n)"
    if ($useAppsScript -eq "y") {
        $scriptUrl = Read-Host "Enter your Apps Script Web App URL"
        Set-Content -Path $envFile -Value "VITE_API_BASE_URL=$scriptUrl"
        Write-Host "  Created .env with VITE_API_BASE_URL" -ForegroundColor Green
    } else {
        Set-Content -Path $envFile -Value "VITE_API_BASE_URL=http://localhost:4000"
        Write-Host "  Created .env with localhost (won't work on other devices)" -ForegroundColor Yellow
    }
}

# Step 2: Build frontend
Write-Host ""
Write-Host "[2/5] Building frontend..." -ForegroundColor Yellow
Set-Location app/frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Write-Host "  Frontend built successfully" -ForegroundColor Green

# Step 3: Sync Capacitor
Write-Host ""
Write-Host "[3/5] Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Capacitor sync failed!" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Write-Host "  Capacitor synced" -ForegroundColor Green

# Step 4: Check Java
Write-Host ""
Write-Host "[4/5] Checking Java installation..." -ForegroundColor Yellow
$javaVersion = java -version 2>&1 | Select-String "version"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING: Java not found in PATH" -ForegroundColor Yellow
    Write-Host "  The build might fail. Install Java JDK 11+ if needed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Alternative: Use GitHub Actions for cloud builds" -ForegroundColor Cyan
    Write-Host "  See: .github/workflows/build-apk.yml" -ForegroundColor Cyan
} else {
    Write-Host "  Java found: $javaVersion" -ForegroundColor Green
}

# Step 5: Build APK
Write-Host ""
Write-Host "[5/5] Building APK (this may take a few minutes)..." -ForegroundColor Yellow
Set-Location android
if (Test-Path "gradlew.bat") {
    .\gradlew.bat assembleDebug
} else {
    Write-Host "ERROR: gradlew.bat not found!" -ForegroundColor Red
    Set-Location ../..
    exit 1
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: APK build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Java JDK not installed (download from https://adoptium.net/)" -ForegroundColor White
    Write-Host "  - ANDROID_HOME not set (install Android Studio)" -ForegroundColor White
    Write-Host "  - Gradle wrapper issues" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Use GitHub Actions for cloud builds" -ForegroundColor Cyan
    Set-Location ../..
    exit 1
}

# Find the APK
$apkPath = "app/build/outputs/apk/debug/app-debug.apk"
if (Test-Path $apkPath) {
    $fullPath = (Resolve-Path $apkPath).Path
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  APK BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK Location: $fullPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now share this APK with others!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To install on Android device:" -ForegroundColor Yellow
    Write-Host "  1. Transfer the APK to your Android device" -ForegroundColor White
    Write-Host "  2. Enable 'Install from Unknown Sources' in settings" -ForegroundColor White
    Write-Host "  3. Open the APK file and install" -ForegroundColor White
} else {
    Write-Host "ERROR: APK file not found at expected location!" -ForegroundColor Red
    Write-Host "Expected: $apkPath" -ForegroundColor Yellow
}

Set-Location ../..

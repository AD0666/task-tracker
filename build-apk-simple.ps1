# Simple APK Build Script for Task Tracker
# This script builds the APK file for sharing with your team

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Task Tracker - APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if frontend is built
Write-Host "[1/5] Checking frontend build..." -ForegroundColor Yellow
if (-not (Test-Path "app\frontend\dist\index.html")) {
    Write-Host "  Building frontend..." -ForegroundColor Gray
    Set-Location "app\frontend"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
        Set-Location "..\.."
        exit 1
    }
    Set-Location "..\.."
    Write-Host "  ✓ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "  ✓ Frontend already built" -ForegroundColor Green
}

# Step 2: Check backend URL configuration
Write-Host ""
Write-Host "[2/5] Checking backend URL configuration..." -ForegroundColor Yellow
$envFile = "app\frontend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "VITE_API_BASE_URL=(.+)") {
        $apiUrl = $matches[1].Trim()
        Write-Host "  Found: VITE_API_BASE_URL=$apiUrl" -ForegroundColor Gray
        if ($apiUrl -eq "" -or $apiUrl -eq "http://localhost:4000") {
            Write-Host ""
            Write-Host "  ⚠ WARNING: Backend URL is localhost!" -ForegroundColor Red
            Write-Host "  The APK will NOT work on different networks." -ForegroundColor Red
            Write-Host ""
            Write-Host "  You need to:" -ForegroundColor Yellow
            Write-Host "    1. Deploy backend to Railway/Render/Heroku" -ForegroundColor Yellow
            Write-Host "    2. Set VITE_API_BASE_URL to your public URL" -ForegroundColor Yellow
            Write-Host "    3. Rebuild the frontend" -ForegroundColor Yellow
            Write-Host ""
            $continue = Read-Host "  Continue anyway? (y/n)"
            if ($continue -ne "y") {
                Write-Host "  Build cancelled." -ForegroundColor Yellow
                exit 0
            }
        } else {
            Write-Host "  ✓ Backend URL configured: $apiUrl" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠ No VITE_API_BASE_URL found in .env" -ForegroundColor Yellow
        Write-Host "  App will use relative URLs (only works if backend is on same network)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ No .env file found" -ForegroundColor Yellow
    Write-Host "  Create app/frontend/.env with: VITE_API_BASE_URL=https://your-backend-url.com" -ForegroundColor Yellow
}

# Step 3: Sync Capacitor
Write-Host ""
Write-Host "[3/5] Syncing Capacitor..." -ForegroundColor Yellow
Set-Location "app\frontend"
npx cap copy android
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Capacitor sync failed!" -ForegroundColor Red
    Set-Location "..\.."
    exit 1
}
Write-Host "  ✓ Capacitor synced" -ForegroundColor Green
Set-Location "..\.."

# Step 4: Build APK
Write-Host ""
Write-Host "[4/5] Building APK (this may take a few minutes)..." -ForegroundColor Yellow
Set-Location "app\frontend\android"

# Check for Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "  Using: $javaVersion" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "  ⚠ WARNING: Java not found in PATH" -ForegroundColor Yellow
    Write-Host "  The build might fail. Install Java JDK 11+ if needed." -ForegroundColor Yellow
    Write-Host ""
}

# Build APK
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: APK build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Java JDK not installed (download from https://adoptium.net/)" -ForegroundColor Yellow
    Write-Host "  - ANDROID_HOME not set (install Android Studio)" -ForegroundColor Yellow
    Write-Host "  - Gradle wrapper issues (try: gradle wrapper)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use GitHub Actions for cloud builds (see BUILD_INSTRUCTIONS.md)" -ForegroundColor Cyan
    Set-Location "..\..\.."
    exit 1
}

Set-Location "..\..\.."

# Step 5: Locate APK
Write-Host ""
Write-Host "[5/5] APK Build Complete!" -ForegroundColor Green
Write-Host ""
$apkPath = "app\frontend\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ APK Built Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: $apkPath" -ForegroundColor Cyan
    Write-Host "Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Share this APK file with your team" -ForegroundColor White
    Write-Host "  2. They need to enable 'Install unknown apps' in Android settings" -ForegroundColor White
    Write-Host "  3. Open the APK file and tap 'Install'" -ForegroundColor White
    Write-Host ""
    
    # Ask if user wants to open the folder
    $open = Read-Host "Open APK folder? (y/n)"
    if ($open -eq "y") {
        $folder = Split-Path $apkPath -Parent
        explorer.exe $folder
    }
} else {
    Write-Host "ERROR: APK file not found at expected location!" -ForegroundColor Red
    Write-Host "Expected: $apkPath" -ForegroundColor Yellow
    exit 1
}

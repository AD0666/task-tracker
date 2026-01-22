# Build APK Locally - Step by Step Guide

## Prerequisites: Install Java JDK

### Step 1: Download Java JDK
1. Go to: https://adoptium.net/
2. Click "Latest LTS Release" (Java 21 or 17)
3. Select:
   - **Version:** 21 (LTS) or 17 (LTS)
   - **Operating System:** Windows
   - **Architecture:** x64
   - **Package Type:** JDK
4. Click "Latest" button to download

### Step 2: Install Java JDK
1. Run the downloaded installer (e.g., `OpenJDK21U-jdk_x64_windows_hotspot_21.0.1_12.msi`)
2. Follow the installation wizard
3. **Important:** Check "Add to PATH" during installation
4. Complete the installation

### Step 3: Verify Java Installation
Open PowerShell and run:
```powershell
java -version
```

You should see something like:
```
openjdk version "21.0.1" 2024-04-16
OpenJDK Runtime Environment Temurin-21.0.1+12 (build 21.0.1+12)
OpenJDK 64-Bit Server VM Temurin-21.0.1+12 (build 21.0.1+12, mixed mode)
```

If you see an error, Java is not in PATH. Restart PowerShell or add Java to PATH manually.

## Build the APK

### Step 1: Verify API URL Configuration
Make sure `app/frontend/.env` contains:
```
VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 2: Run the Build Script
From the project root directory:
```powershell
.\build-apk.ps1
```

The script will:
1. Check API URL configuration
2. Build the frontend
3. Sync Capacitor
4. Build the APK

### Step 3: Find Your APK
After successful build, the APK will be at:
```
app/frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

### "Java not found" error
- Restart PowerShell after installing Java
- Or manually add Java to PATH:
  1. Find Java installation (usually `C:\Program Files\Eclipse Adoptium\jdk-21.x.x\bin`)
  2. Add to System Environment Variables → Path

### "ANDROID_HOME not set" error
- This is OK for debug builds - Gradle will download Android SDK automatically
- For release builds, install Android Studio

### Build fails with Gradle error
- First build may take 10-15 minutes (downloading dependencies)
- Make sure you have internet connection
- Try running again if it fails

## Share the APK

1. Copy `app-debug.apk` to your Android device
2. On Android device:
   - Go to Settings → Security
   - Enable "Install from Unknown Sources" or "Install unknown apps"
   - Open the APK file
   - Tap "Install"

Done! Your team can now install and use the app.

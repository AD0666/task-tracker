# Building Android APK for Task Tracker

This guide explains how to build an Android APK file without Android Studio.

## Prerequisites

You need one of these options:

### Option A: Android Studio (Recommended - Easiest)
1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, make sure "Android SDK" and "Android SDK Platform" are selected
3. Open Android Studio once to complete setup
4. That's it! The build script will use the SDK automatically.

### Option B: Android SDK Command-Line Tools Only
1. Download [Android SDK Command-Line Tools](https://developer.android.com/studio#command-tools)
2. Extract to a folder (e.g., `C:\Android\sdk`)
3. Set environment variable `ANDROID_HOME` to that folder
4. Add `%ANDROID_HOME%\tools\bin` and `%ANDROID_HOME%\platform-tools` to PATH
5. Install Java JDK 11 or higher

## Quick Build (PowerShell)

From the project root directory, run:

```powershell
.\build-apk.ps1
```

This script will:
1. Install all dependencies
2. Set up Capacitor
3. Build the frontend
4. Create Android project
5. Build the APK

The APK will be at: `app/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## Manual Steps (if script fails)

```powershell
# 1. Install dependencies
npm install
cd app/frontend
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev

# 2. Initialize Capacitor (first time only)
npx cap init "Task Tracker" "com.shillongpixels.tasktracker" --web-dir=dist

# 3. Build frontend
npm run build

# 4. Add Android platform (first time only)
npx cap add android

# 5. Sync Capacitor
npx cap copy android
npx cap sync android

# 6. Build APK
cd android
.\gradlew.bat assembleDebug
```

## Sharing the APK

1. Find the APK at: `app/frontend/android/app/build/outputs/apk/debug/app-debug.apk`
2. Share via WhatsApp, email, or Google Drive
3. Recipients need to:
   - Enable "Install unknown apps" in Android Settings
   - Open the APK file and tap "Install"

## Important: Backend URL Configuration

For the APK to work on mobile devices, you need to configure the backend URL:

1. Create `app/frontend/.env` file:
```
VITE_API_BASE_URL=http://YOUR_SERVER_IP:4000
```

Replace `YOUR_SERVER_IP` with:
- Your local network IP (e.g., `192.168.1.100`) for testing on same WiFi
- Your public server URL (e.g., `https://api.yourdomain.com`) for production

2. Rebuild:
```powershell
cd app/frontend
npm run build
npx cap copy android
cd android
.\gradlew.bat assembleDebug
```

## Troubleshooting

**Error: "ANDROID_HOME not set"**
- Install Android Studio OR set ANDROID_HOME environment variable

**Error: "Gradle wrapper not found"**
- Run `cd app/frontend/android` then `gradle wrapper` (if gradle is installed)
- OR open the `android` folder in Android Studio

**Error: "Java not found"**
- Install Java JDK 11 or higher
- Set JAVA_HOME environment variable

**APK builds but app doesn't connect to backend**
- Check VITE_API_BASE_URL in `.env` file
- Ensure backend server is accessible from mobile device
- Check firewall settings

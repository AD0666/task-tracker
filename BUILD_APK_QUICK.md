# Quick APK Build Guide

## ⚠️ IMPORTANT: Backend Must Be Publicly Accessible

**Before building the APK**, you need to deploy your backend to a public server so it works on different networks.

### Quick Setup (Railway - Recommended)

1. **Deploy backend to Railway**:
   - Go to https://railway.app
   - Sign up with GitHub
   - Create new project → Deploy from GitHub
   - Add all environment variables from your `.env` file
   - Get your public URL (e.g., `https://task-tracker.up.railway.app`)

2. **Configure frontend**:
   - Create `app/frontend/.env`:
   ```
   VITE_API_BASE_URL=https://your-railway-url.up.railway.app
   ```

3. **Build APK**:
   ```powershell
   .\build-apk-simple.ps1
   ```

---

## Building the APK

### Option 1: Simple Script (Recommended)

```powershell
.\build-apk-simple.ps1
```

This script will:
- ✅ Check if frontend is built
- ✅ Verify backend URL configuration
- ✅ Sync Capacitor
- ✅ Build the APK
- ✅ Show you where the APK is located

### Option 2: Manual Steps

```powershell
# 1. Build frontend
cd app/frontend
npm run build

# 2. Sync Capacitor
npx cap copy android
npx cap sync android

# 3. Build APK
cd android
.\gradlew.bat assembleDebug
```

The APK will be at:
```
app/frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Prerequisites

You need one of these:

### Option A: Android Studio (Easiest)
1. Download: https://developer.android.com/studio
2. Install (includes Android SDK and Java)
3. Done! ✅

### Option B: Android SDK + Java JDK
1. Download Android SDK Command-Line Tools
2. Install Java JDK 11+ from https://adoptium.net/
3. Set `ANDROID_HOME` environment variable
4. Add to PATH: `%ANDROID_HOME%\tools\bin` and `%ANDROID_HOME%\platform-tools`

### Option C: GitHub Actions (No Local Setup)
- Push code to GitHub
- Use the workflow in `.github/workflows/build-apk.yml`
- Download APK from Actions tab

---

## Sharing the APK

1. **Find the APK**: `app/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

2. **Share it**:
   - Email
   - WhatsApp
   - Google Drive
   - Any file sharing service

3. **Recipients need to**:
   - Enable "Install unknown apps" in Android Settings
   - Open the APK file
   - Tap "Install"

---

## Troubleshooting

**"Java not found"**
- Install Java JDK 11+ from https://adoptium.net/
- Set `JAVA_HOME` environment variable

**"ANDROID_HOME not set"**
- Install Android Studio (easiest)
- OR set `ANDROID_HOME` to your Android SDK path

**"Gradle build failed"**
- Make sure Android SDK is installed
- Check that `ANDROID_HOME` is set correctly
- Try opening `app/frontend/android` in Android Studio

**"APK builds but app doesn't connect"**
- Check `VITE_API_BASE_URL` in `app/frontend/.env`
- Make sure backend is deployed and publicly accessible
- Test backend URL in browser: `https://your-backend-url.com/health`

---

## Need Help?

See detailed guides:
- `DEPLOYMENT_GUIDE.md` - Backend deployment options
- `BUILD_INSTRUCTIONS.md` - Complete build instructions
- `BUILD_APK.md` - Detailed APK build guide

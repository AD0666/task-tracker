# Building APK - Complete Instructions

I've set up everything needed to build your Android APK. Here are your options:

## ✅ Option 1: GitHub Actions (Easiest - No Local Setup Required)

This builds the APK automatically in the cloud - **no Android Studio or Java needed on your computer!**

### Steps:

1. **Create a GitHub repository** (if you don't have one):
   ```powershell
   cd "C:\Users\npmd1\Startup\Task Tracker"
   git init
   git add .
   git commit -m "Initial commit"
   ```
   
   Then create a new repo on GitHub and push:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/task-tracker.git
   git push -u origin main
   ```

2. **Trigger the build**:
   - Go to your GitHub repo
   - Click **Actions** tab
   - Click **Build Android APK** workflow
   - Click **Run workflow** → **Run workflow**
   - Wait 5-10 minutes for build to complete

3. **Download the APK**:
   - After build completes, click on the workflow run
   - Scroll down to **Artifacts**
   - Download `app-debug-apk.zip`
   - Extract to get `app-debug.apk`

**That's it!** You can share this APK with your team.

---

## Option 2: Local Build (Requires Java JDK)

If you prefer to build locally:

### Prerequisites:
1. **Install Java JDK 11 or higher**
   - Download from: https://adoptium.net/
   - Install and set `JAVA_HOME` environment variable

2. **Install Android SDK** (choose one):
   - **Option A**: Install Android Studio (includes SDK)
   - **Option B**: Install Android SDK command-line tools only

### Build Steps:

```powershell
# Run the automated build script
.\build-apk.ps1
```

Or manually:

```powershell
cd app/frontend
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

APK will be at: `app/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚠️ CRITICAL: Backend URL Configuration

**For the app to work on different networks, your backend must be publicly accessible!**

### The Problem
- If you use `localhost:4000` or a local IP (e.g., `192.168.1.100`), the app will **only work on the same WiFi network**
- Users on different networks (mobile data, different WiFi) **cannot connect**

### The Solution
You need to deploy your backend to a public server. See **`DEPLOYMENT_GUIDE.md`** for complete instructions.

**Quick options:**
1. **Railway** (easiest, free tier): https://railway.app
2. **Render** (free tier): https://render.com  
3. **Heroku**: https://heroku.com
4. **ngrok** (testing only): https://ngrok.com

### After Deploying Backend:

1. Create `app/frontend/.env`:
```
VITE_API_BASE_URL=https://your-backend-url.com
```

Replace with your **public backend URL** (e.g., `https://task-tracker.up.railway.app`)

2. Rebuild APK:
```powershell
cd app/frontend
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

**Now the APK will work from anywhere!** ✅

---

## Sharing the APK

1. Send the APK file via WhatsApp, email, or Google Drive
2. Recipients need to:
   - Enable **"Install unknown apps"** in Android Settings → Security
   - Open the APK file and tap **Install**

---

## Troubleshooting

**GitHub Actions build fails:**
- Check the Actions tab for error messages
- Ensure all files are committed and pushed

**Local build: "JAVA_HOME not set"**
- Install Java JDK and set JAVA_HOME environment variable

**Local build: "Android SDK not found"**
- Install Android Studio OR set ANDROID_HOME environment variable

**APK installs but app doesn't connect:**
- Check VITE_API_BASE_URL in `.env` file
- Ensure backend server is accessible from mobile device

---

## Recommendation

**Use GitHub Actions (Option 1)** - it's the easiest and doesn't require any local Android/Java setup!

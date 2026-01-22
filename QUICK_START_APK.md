# Quick Start: Build APK for Sharing

## ⚠️ Two Critical Requirements

### 1. Backend Must Be Publicly Accessible

**The APK won't work on different networks unless your backend is deployed!**

**Quick Solution - Deploy to Railway:**
1. Go to https://railway.app
2. Sign up → New Project → Deploy from GitHub
3. Add environment variables from your `.env`
4. Get your URL (e.g., `https://task-tracker.up.railway.app`)

**Then create `app/frontend/.env`:**
```
VITE_API_BASE_URL=https://your-railway-url.up.railway.app
```

### 2. Java JDK Required for Building

You need Java JDK 11 or higher to build the APK.

**Install Java:**
- Download: https://adoptium.net/
- Install the JDK (not JRE)
- Restart your terminal/PowerShell

**OR use GitHub Actions (no Java needed):**
- Push code to GitHub
- Go to Actions tab
- Run "Build Android APK" workflow
- Download APK from artifacts

---

## Build the APK

### Option 1: Local Build (Requires Java)

```powershell
.\build-apk-simple.ps1
```

### Option 2: GitHub Actions (No Local Setup)

1. **Push to GitHub** (if not already):
   ```powershell
   git add .
   git commit -m "Ready for APK build"
   git push
   ```

2. **Build in GitHub**:
   - Go to your GitHub repo
   - Click **Actions** tab
   - Click **Build Android APK**
   - Click **Run workflow** → **Run workflow**
   - Wait 5-10 minutes
   - Download APK from **Artifacts**

---

## After Building

1. **Find APK**: `app/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

2. **Share with team**:
   - Email, WhatsApp, Google Drive, etc.

3. **Team members install**:
   - Enable "Install unknown apps" in Android Settings
   - Open APK file
   - Tap "Install"

---

## Need Help?

- **Backend deployment**: See `DEPLOYMENT_GUIDE.md`
- **Detailed build steps**: See `BUILD_APK_QUICK.md`
- **Troubleshooting**: See `BUILD_APK.md`

# Deploy Backend via GitHub

GitHub stores your code, but you need a hosting service to run your Node.js backend. Here's how to deploy from GitHub:

---

## Option 1: Railway (Easiest - Auto-Deploy from GitHub)

Railway can automatically deploy your backend from GitHub and update it whenever you push code.

### Step 1: Push Code to GitHub

1. **Initialize Git** (if not already):
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `task-tracker-backend`)
   - **Don't** initialize with README (you already have files)

3. **Push your code**:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/task-tracker-backend.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Railway

1. **Sign up for Railway**:
   - Go to https://railway.app
   - Sign up with GitHub (free tier available)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `task-tracker-backend` repository

3. **Configure Deployment**:
   - Railway auto-detects Node.js
   - **Root Directory**: Leave empty (or set to project root)
   - **Start Command**: `node app/api/server.js`

4. **Add Environment Variables**:
   - Click on your service
   - Go to "Variables" tab
   - Add all variables from your `.env`:
     ```
     JWT_SECRET=your_secret_here
     JWT_EXPIRES_IN=8h
     GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
     SPREADSHEET_ID=1T4twRnuavxvmJk_qfU0leeeRy6LMrpl37z5U0uRURZM
     SHEET_NAME=RoadMap
     ADMIN_EMAIL=shillongpixels@gmail.com
     SMTP_HOST=shillongpixels.com
     SMTP_PORT=465
     SMTP_SECURE=true
     SMTP_USER=no-reply@shillongpixels.com
     SMTP_PASS=RQ4LQjSDF2Hm2ca
     SMTP_FROM=no-reply@shillongpixels.com
     OWNER_MIKI=mikirahnamrabon22@gmail.com
     OWNER_JAMES=jmsmxwll4@gmail.com
     OWNER_DAMON=cmydamon@gmail.com
     OWNER_ANUP=npmd162@gmail.com
     ```

5. **Add service-account.json as Environment Variable**:
   - Open your `service-account.json` file
   - Copy the **entire JSON content** (all of it, including `{` and `}`)
   - In Railway, go to "Variables" tab
   - Click "New Variable"
   - Name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: Paste the entire JSON content (as a single line, or Railway will handle it)
   - **Important**: Make sure it's valid JSON (no extra quotes, just the raw JSON)

6. **Get Your URL**:
   - Railway provides a URL like: `https://task-tracker-production.up.railway.app`
   - You can also set a custom domain

### Step 3: Handle service-account.json

**Easy Method (Recommended):**

1. **Open `service-account.json`** in a text editor
2. **Copy the entire JSON content** (everything from `{` to `}`)
3. **In Railway Variables**, add:
   - Name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: Paste the entire JSON (Railway handles multi-line JSON)

**The code is already updated** to support this! ✅

Your backend will automatically use the JSON from the environment variable if it's set, otherwise it will use the file.

---

## Option 2: Render (Auto-Deploy from GitHub)

Similar to Railway, but with Render:

1. **Push code to GitHub** (same as Step 1 above)

2. **Sign up for Render**:
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `task-tracker-backend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node app/api/server.js`
     - **Plan**: Free (or paid)

4. **Add Environment Variables**:
   - Same as Railway (all your `.env` variables)

5. **Get Your URL**:
   - Render provides: `https://task-tracker-backend.onrender.com`

---

## Option 3: GitHub Actions (Deploy to Multiple Services)

You can use GitHub Actions to automatically deploy when you push code. I'll create a workflow file for you.

---

## Quick Start: Railway (Recommended)

**Fastest way to get your backend online:**

1. ✅ Push code to GitHub
2. ✅ Sign up at https://railway.app
3. ✅ Deploy from GitHub
4. ✅ Add environment variables
5. ✅ Get your URL
6. ✅ Update frontend `.env`
7. ✅ Build APK

**Time**: 15 minutes  
**Cost**: Free (with limits)

---

## Handling service-account.json in Railway

Since Railway doesn't easily accept file uploads, I'll create a solution that reads from an environment variable.

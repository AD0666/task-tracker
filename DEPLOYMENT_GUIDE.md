# Making Your App Work Across Different Networks

## The Problem

Currently, your backend runs on `localhost:4000` or a local IP (like `192.168.1.100`). This means:
- ✅ Works on your local network (same WiFi)
- ❌ **Does NOT work** for users on different networks (different WiFi, mobile data, etc.)

## Solution Options

You need to make your backend **publicly accessible** on the internet. Here are your options:

---

## Option 1: Deploy Backend to Cloud (Recommended for Production)

Deploy your Node.js backend to a cloud service so it's always accessible.

### A. Railway (Easiest - Free tier available)

1. **Sign up**: https://railway.app
2. **Create new project** → **Deploy from GitHub repo**
3. **Add environment variables** from your `.env` file:
   - `PORT` (Railway sets this automatically)
   - `JWT_SECRET`
   - `GOOGLE_APPLICATION_CREDENTIALS` (upload service-account.json)
   - `SPREADSHEET_ID`
   - `SHEET_NAME`
   - All SMTP settings
   - All owner email mappings

4. **Deploy**: Railway will auto-detect Node.js and deploy
5. **Get your URL**: `https://your-app-name.up.railway.app`
6. **Update APK**: Set `VITE_API_BASE_URL=https://your-app-name.up.railway.app` in `app/frontend/.env`
7. **Rebuild APK**

### B. Heroku (Free tier discontinued, but still popular)

1. Install Heroku CLI
2. `heroku create task-tracker-api`
3. `git push heroku main`
4. Set environment variables: `heroku config:set KEY=value`
5. Get URL: `https://task-tracker-api.herokuapp.com`

### C. Render (Free tier available)

1. Sign up: https://render.com
2. Create new **Web Service**
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `node app/api/server.js`
6. Add environment variables
7. Deploy and get URL

### D. AWS / Google Cloud / Azure

More complex but scalable. Good for production with high traffic.

---

## Option 2: Use ngrok (Quick Testing - Not for Production)

For **quick testing** with team members, use ngrok to expose your local server:

1. **Install ngrok**: https://ngrok.com/download
2. **Start your backend**:
   ```powershell
   npm start
   ```

3. **In another terminal, expose it**:
   ```powershell
   ngrok http 4000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)
5. **Update APK**: Set `VITE_API_BASE_URL=https://abc123.ngrok.io` in `app/frontend/.env`
6. **Rebuild APK**

⚠️ **Limitations**:
- Free tier: URL changes every time you restart ngrok
- Free tier: Limited requests per month
- Not suitable for production

---

## Option 3: Use Your Own Server (VPS)

If you have a VPS or dedicated server:

1. **Deploy backend** to your server
2. **Set up domain** (optional, or use IP address)
3. **Configure firewall** to allow port 4000 (or use reverse proxy with nginx)
4. **Update APK** with your server URL/IP

---

## Step-by-Step: Deploy to Railway (Recommended)

### 1. Prepare Your Code

Ensure your backend can read environment variables (already done ✅)

### 2. Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**

### 3. Configure Railway

1. **Select your repository**
2. **Add environment variables** (from your `.env`):
   ```
   JWT_SECRET=your_secret_here
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

3. **Upload service-account.json**:
   - In Railway dashboard, go to **Variables** tab
   - Add a file variable or upload via Railway CLI

4. **Set start command** (if needed):
   - Railway auto-detects, but you can set: `node app/api/server.js`

### 4. Get Your Public URL

After deployment, Railway gives you a URL like:
```
https://task-tracker-production.up.railway.app
```

### 5. Update Frontend for Mobile

Create `app/frontend/.env`:
```
VITE_API_BASE_URL=https://task-tracker-production.up.railway.app
```

### 6. Rebuild APK

```powershell
cd app/frontend
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

Or use GitHub Actions (it will use the `.env` file automatically).

---

## Testing

1. **Test backend is accessible**:
   - Open browser: `https://your-backend-url.com/health`
   - Should return: `{"status":"ok"}`

2. **Test from mobile**:
   - Install APK on phone
   - Try to login
   - If it works, backend is accessible! ✅

---

## Security Notes

- ✅ Use HTTPS (Railway/Heroku/Render provide this automatically)
- ✅ Keep `JWT_SECRET` secure
- ✅ Don't commit `.env` files to GitHub
- ✅ Use environment variables for all secrets

---

## Summary

**For production with team members on different networks:**
1. Deploy backend to Railway/Heroku/Render (Option 1)
2. Get public URL
3. Set `VITE_API_BASE_URL` in `app/frontend/.env`
4. Rebuild APK
5. Share APK - it will work from anywhere! ✅

**For quick testing:**
- Use ngrok (Option 2) - but remember it's temporary

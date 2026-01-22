# Quick Start: Deploy to Railway via GitHub

**Fastest way to get your backend online (10 minutes)**

## Step 1: Push Code to GitHub

```powershell
# If not already a git repo
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/task-tracker-backend.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

1. **Go to**: https://railway.app
2. **Sign up** with GitHub (free tier)
3. **Click**: "New Project" → "Deploy from GitHub repo"
4. **Select**: Your `task-tracker-backend` repository
5. **Railway auto-detects** Node.js ✅

## Step 3: Configure

### A. Set Start Command

1. Click on your service
2. Go to **Settings** tab
3. **Start Command**: `node app/api/server.js`

### B. Add Environment Variables

Go to **Variables** tab and add:

```
JWT_SECRET=your_secret_here_change_me
JWT_EXPIRES_IN=8h
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

### C. Add Service Account JSON

1. **Open** `service-account.json` in a text editor
2. **Copy** the entire JSON content (from `{` to `}`)
3. **In Railway Variables**, add:
   - **Name**: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - **Value**: Paste the entire JSON content

**Important**: 
- Paste the raw JSON (no extra quotes)
- Railway will handle multi-line JSON automatically
- Make sure it's valid JSON

## Step 4: Deploy

1. Railway will **automatically deploy** when you add variables
2. **Check logs** to see deployment progress
3. **Wait for**: "API server listening on port..."

## Step 5: Get Your URL

1. Railway provides a URL like: `https://task-tracker-production.up.railway.app`
2. **Test it**: Open `https://your-url.up.railway.app/health`
3. Should return: `{"status":"ok"}`

## Step 6: Update Frontend

Create `app/frontend/.env`:
```
VITE_API_BASE_URL=https://your-railway-url.up.railway.app
```

Then rebuild and build your APK!

---

## Troubleshooting

**"Cannot find module" errors**
- Check that `package.json` is in the root
- Railway should auto-run `npm install`

**"Google credentials error"**
- Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is valid JSON
- Check that you copied the entire JSON (including `{` and `}`)

**"Port already in use"**
- Railway sets `PORT` automatically - don't override it
- Your code already handles this ✅

**Deployment fails**
- Check Railway logs
- Verify all environment variables are set
- Make sure `service-account.json` JSON is valid

---

## Auto-Deploy on Git Push

Railway automatically redeploys when you push to GitHub! 🎉

Just:
1. Make changes
2. `git push`
3. Railway redeploys automatically

---

## Next Steps

✅ Backend deployed  
✅ Test: `https://your-url/health`  
✅ Update `app/frontend/.env`  
✅ Build APK  
✅ Share with team!

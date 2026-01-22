# Fix CORS Issue - Step by Step

## The Problem
- CORS error when accessing from localhost
- No execution records in Apps Script
- `/u/2/` redirect in browser (this is normal, but fetch should work)

## The Solution

### Step 1: Update Apps Script Code
1. Copy the entire code from `APPS_SCRIPT_CODE.gs`
2. Paste into Apps Script editor
3. **Save** (Ctrl+S)

### Step 2: Redeploy with CORRECT Settings

**CRITICAL - These settings MUST be exact:**

1. Go to **Deploy** → **Manage deployments**
2. Click **Edit** (pencil icon) on your Web App
3. Set these **EXACT** values:
   - **Type:** `Web app` (NOT "API executable")
   - **Execute as:** `Me` (your email address)
   - **Who has access:** `Anyone` (NOT "Only myself" or "Anyone with Google account")
4. Click **Deploy**
5. **Copy the NEW Web App URL** (it might be different!)

### Step 3: Update .env File

Update `app/frontend/.env`:
```
VITE_API_BASE_URL=<paste the NEW URL from step 2>
```

### Step 4: Restart Dev Server

```powershell
cd app/frontend
# Stop server (Ctrl+C)
npm run dev
```

### Step 5: Test

1. Go to `http://localhost:3000/login`
2. Login with `Damon / Damon123`
3. Check Apps Script → Executions for `doPost` entry

## Why This Works

- **"Who has access: Anyone"** enables CORS automatically
- Apps Script adds CORS headers automatically for "Anyone" deployments
- The `/u/2/` redirect only happens in browsers, not in fetch requests
- Fetch requests from JavaScript bypass the redirect

## If Still Not Working

1. Verify deployment settings are EXACTLY as above
2. Make sure you're using the URL from "Manage deployments" (not the editor URL)
3. Check browser console for exact CORS error message
4. Verify the URL in `.env` matches the deployment URL exactly

# Deploy Google Apps Script as Web App

## Step-by-Step Deployment

### 1. Open Your Apps Script Project
- Go to https://script.google.com
- Open your "Task Tracker" project

### 2. Deploy as Web App

1. **Click "Deploy"** button (top right)
2. **Click "New deployment"**
3. **Click the gear icon** (⚙️) next to "Select type"
4. **Choose "Web app"**

### 3. Configure Deployment

Fill in the settings:

- **Description**: `Task Tracker API` (or any name)
- **Execute as**: `Me` (your Google account)
- **Who has access**: `Anyone` (or "Anyone with Google account" if you want to restrict)

### 4. Deploy

1. **Click "Deploy"** button
2. **Authorize** if prompted (click "Authorize access")
3. **Copy the Web app URL** - it will look like:
   ```
   https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec
   ```
   ⚠️ **Important**: This URL will be DIFFERENT from the one in your `.env` file!

### 5. Update Your .env File

1. Open `app/frontend/.env`
2. Replace the URL with your NEW deployment URL:
   ```
   VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec
   ```
3. Save the file

### 6. Restart Dev Server

```powershell
# Stop current server (Ctrl+C)
cd app/frontend
npm run dev
```

### 7. Test

1. Try logging in from `http://localhost:3000/login`
2. Check Apps Script > Executions for a new `doPost` execution
3. Click on it to see the logs

---

## Important Notes

- **Each deployment gets a NEW URL** - if you redeploy, you need to update `.env`
- **"Execute as: Me"** means it runs with YOUR permissions (can access your Google Sheets)
- **"Who has access: Anyone"** allows your app to call it without Google login
- The URL format is: `https://script.google.com/macros/s/SCRIPT_ID/exec`

---

## Troubleshooting

**"File does not exist" error:**
- Web App is not deployed
- Using wrong/old deployment URL
- Deployment was deleted

**Solution:** Create a new deployment and use the new URL

**No execution logs:**
- Request isn't reaching Apps Script
- Check proxy is working (see Vite console)
- Verify URL in `.env` matches deployment URL

**401 Unauthorized:**
- Request reaches Apps Script but body is empty
- Check execution logs to see what body is received
- Verify POST body is being forwarded by proxy

---

## Quick Checklist

- [ ] Apps Script code is saved
- [ ] Web App is deployed (Deploy > New deployment > Web app)
- [ ] Copied the NEW Web app URL
- [ ] Updated `app/frontend/.env` with new URL
- [ ] Restarted dev server
- [ ] Tested login
- [ ] Checked Apps Script Executions for `doPost` entry

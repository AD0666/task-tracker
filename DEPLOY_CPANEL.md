# Deploying Backend to GoDaddy cPanel

This guide will help you deploy your Node.js backend to GoDaddy cPanel.

## Prerequisites

1. **Check if Node.js is available in your cPanel**
   - Log into your GoDaddy cPanel
   - Look for "Node.js" or "Node.js Selector" in the Software section
   - If you don't see it, contact GoDaddy support to enable Node.js

2. **Your domain/subdomain** (e.g., `api.yourdomain.com` or `yourdomain.com/api`)

---

## Step 1: Prepare Your Files

### 1.1 Create Deployment Package

You need to upload these files/folders to cPanel:

**Required files:**
```
app/
├── api/
│   └── server.js
├── auth_service/
├── sheet_service/
├── task_service/
├── notification_service/
├── config/
├── utils/
package.json
package-lock.json
.env
service-account.json
```

### 1.2 Update Server Configuration

The server needs to use the port provided by cPanel. I'll create a cPanel-compatible version.

---

## Step 2: Upload Files to cPanel

### Option A: Using cPanel File Manager

1. **Log into cPanel**
2. **Open File Manager**
3. **Navigate to your domain's root** (usually `public_html` or `yourdomain.com`)
4. **Create a folder** for your API (e.g., `api` or `backend`)
5. **Upload all files**:
   - Upload the entire `app` folder
   - Upload `package.json`
   - Upload `package-lock.json`
   - Upload `.env` (you'll edit this in cPanel)
   - Upload `service-account.json`

### Option B: Using FTP/SFTP

1. **Connect via FTP client** (FileZilla, WinSCP, etc.)
   - Host: `ftp.yourdomain.com` or your server IP
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Upload files** to the same location as above

---

## Step 3: Set Up Node.js App in cPanel

1. **In cPanel, go to "Node.js Selector"** (or "Node.js" in Software section)

2. **Click "Create Application"**

3. **Fill in the details**:
   - **Node.js Version**: Select latest LTS (e.g., 18.x or 20.x)
   - **Application Mode**: Production
   - **Application Root**: `/home/username/api` (or wherever you uploaded files)
   - **Application URL**: Choose:
     - **Subdomain**: `api.yourdomain.com` (recommended)
     - **Subdirectory**: `yourdomain.com/api`
   - **Application Startup File**: `app/api/server.js`
   - **Load App File**: Leave empty or use `package.json`

4. **Click "Create"**

---

## Step 4: Configure Environment Variables

1. **In Node.js Selector, find your app** and click **"Manage"** or **"Edit"**

2. **Go to "Environment Variables"** section

3. **Add all variables from your `.env` file**:
   ```
   PORT=4000
   JWT_SECRET=your_jwt_secret_here
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

4. **Important**: 
   - cPanel may provide a `PORT` variable automatically - **don't override it**
   - If cPanel sets `PORT`, your app will use it automatically
   - The path to `service-account.json` should be relative to your app root

---

## Step 5: Install Dependencies

1. **In Node.js Selector, click "Run NPM Install"** (or similar button)
   - This will run `npm install` in your app directory

2. **Wait for installation to complete** (may take a few minutes)

---

## Step 6: Start/Restart the Application

1. **In Node.js Selector, click "Restart App"** (or "Start App")

2. **Check the logs** for any errors:
   - Look for "Logs" or "View Logs" button
   - Should see: `API server listening on port XXXX`

---

## Step 7: Test Your Backend

1. **Get your app URL** from cPanel (e.g., `https://api.yourdomain.com`)

2. **Test the health endpoint**:
   ```
   https://api.yourdomain.com/health
   ```
   Should return: `{"status":"ok"}`

3. **Test login**:
   ```
   POST https://api.yourdomain.com/auth/login
   Body: {"username":"Damon","password":"Damon123"}
   ```

---

## Step 8: Update Frontend Configuration

1. **Create `app/frontend/.env`**:
   ```
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```
   (Replace with your actual cPanel Node.js app URL)

2. **Rebuild frontend**:
   ```powershell
   cd app/frontend
   npm run build
   ```

3. **Now build your APK** with the new backend URL!

---

## Troubleshooting

### App won't start
- **Check logs** in Node.js Selector
- **Verify** `package.json` has correct `start` script: `"start": "node app/api/server.js"`
- **Check** that all files are uploaded correctly
- **Verify** environment variables are set correctly

### Port errors
- cPanel usually provides `PORT` automatically
- Your app should use `process.env.PORT || 4000` (already configured ✅)
- Don't set `PORT` in environment variables if cPanel provides it

### Module not found errors
- Run "NPM Install" again in cPanel
- Check that `node_modules` folder exists
- Verify `package.json` is correct

### Cannot connect to Google Sheets
- **Verify** `service-account.json` is uploaded
- **Check** path in `GOOGLE_APPLICATION_CREDENTIALS` (should be relative: `./service-account.json`)
- **Ensure** service account has access to your Google Sheet

### CORS errors
- Your backend already has `cors()` enabled ✅
- If issues persist, check cPanel firewall settings

### 404 errors
- **Verify** your app URL is correct
- **Check** that the app is running (green status in Node.js Selector)
- **Test** with `/health` endpoint first

---

## Important Notes

1. **File Paths**: All paths in your code should be relative (they already are ✅)

2. **Port**: cPanel will assign a port automatically - your app will use `process.env.PORT`

3. **HTTPS**: cPanel usually provides HTTPS automatically via Let's Encrypt

4. **Auto-restart**: Some cPanel setups auto-restart on file changes, others require manual restart

5. **Logs**: Always check logs in Node.js Selector for debugging

6. **Updates**: After code changes:
   - Upload new files
   - Click "Restart App" in Node.js Selector

---

## Getting Your Public URL

After setup, your backend will be accessible at:
- **Subdomain**: `https://api.yourdomain.com`
- **Subdirectory**: `https://yourdomain.com/api`

Use this URL in your frontend `.env` file!

---

## Next Steps

1. ✅ Backend deployed to cPanel
2. ✅ Test backend is accessible
3. ✅ Update `app/frontend/.env` with your cPanel URL
4. ✅ Rebuild frontend
5. ✅ Build APK (see `BUILD_APK_QUICK.md`)

Your APK will now work from anywhere! 🎉

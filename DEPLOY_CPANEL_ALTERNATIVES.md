# Alternative Deployment Methods (No Node.js in cPanel)

Since Node.js is not available in your cPanel, here are your options:

---

## Option 1: SSH Access (Recommended if Available)

If your GoDaddy hosting plan includes **SSH access**, you can run Node.js directly.

### Check if you have SSH access:

1. **In cPanel**, look for "Terminal" or "SSH Access" in the Advanced section
2. **OR** try connecting via SSH client:
   - Host: `yourdomain.com` or server IP
   - Username: Your cPanel username
   - Port: 22

### If you have SSH access:

1. **Connect via SSH** (use PuTTY on Windows, or PowerShell):
   ```powershell
   ssh username@yourdomain.com
   ```

2. **Upload files** (via FTP/SFTP or cPanel File Manager) to:
   ```
   /home/username/api/
   ```

3. **Install Node.js** (if not installed):
   ```bash
   # Check if Node.js exists
   node --version
   
   # If not, install via nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```

4. **Install dependencies**:
   ```bash
   cd ~/api
   npm install --production
   ```

5. **Set up PM2** (process manager to keep Node.js running):
   ```bash
   npm install -g pm2
   pm2 start app/api/server.js --name task-tracker
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start
   ```

6. **Set environment variables**:
   ```bash
   # Create .env file
   nano ~/api/.env
   # Add all your environment variables
   ```

7. **Your backend will be accessible at**:
   - `http://yourdomain.com:4000` (if port 4000 is open)
   - OR set up a reverse proxy (see below)

### Set up Reverse Proxy (to use port 80/443):

If you want `https://api.yourdomain.com` instead of `http://yourdomain.com:4000`:

1. **Create `.htaccess` in your domain root**:
   ```apache
   RewriteEngine On
   RewriteRule ^api/(.*)$ http://localhost:4000/$1 [P,L]
   ```

2. **OR use subdomain** - Create `api.yourdomain.com` subdomain in cPanel and point it to your Node.js app

---

## Option 2: Free Cloud Hosting (Easiest - Recommended)

Deploy to a free cloud service that supports Node.js natively:

### A. Railway (Easiest - Free tier)

1. **Sign up**: https://railway.app (free tier available)
2. **Deploy from GitHub**:
   - Connect your GitHub repo
   - Railway auto-detects Node.js
   - Add environment variables
   - Get URL: `https://your-app.up.railway.app`

**Time**: 10 minutes  
**Cost**: Free (with limits)

### B. Render (Free tier)

1. **Sign up**: https://render.com
2. **Create Web Service**:
   - Connect GitHub repo
   - Build command: `npm install`
   - Start command: `node app/api/server.js`
   - Add environment variables
   - Get URL: `https://your-app.onrender.com`

**Time**: 10 minutes  
**Cost**: Free (spins down after inactivity)

### C. Heroku (Paid now, but reliable)

1. **Sign up**: https://heroku.com
2. **Install Heroku CLI**
3. **Deploy**:
   ```bash
   heroku create your-app-name
   git push heroku main
   heroku config:set KEY=value  # Set env vars
   ```

**Time**: 15 minutes  
**Cost**: $7/month (free tier discontinued)

### D. Fly.io (Free tier)

1. **Sign up**: https://fly.io
2. **Install flyctl**
3. **Deploy**:
   ```bash
   fly launch
   fly secrets set KEY=value
   ```

**Time**: 15 minutes  
**Cost**: Free tier available

---

## Option 3: PHP Proxy (Advanced - Not Recommended)

If you absolutely must use cPanel without Node.js, you can create a PHP proxy that runs Node.js via shell commands. **This is complex and unreliable.**

### Limitations:
- Requires `shell_exec()` or `exec()` to be enabled (often disabled for security)
- Node.js must be installed on the server
- Process management is difficult
- Not production-ready

**I don't recommend this approach.**

---

## Option 4: Upgrade Hosting Plan

Contact GoDaddy to:
1. **Upgrade to a VPS or dedicated server** (includes SSH and Node.js support)
2. **OR switch to a hosting provider** that supports Node.js:
   - DigitalOcean ($5/month)
   - Linode ($5/month)
   - AWS Lightsail ($3.50/month)
   - Vultr ($2.50/month)

---

## Option 5: Use Your Domain with Cloud Hosting

Keep your GoDaddy domain, but point it to a cloud-hosted backend:

1. **Deploy backend to Railway/Render** (free)
2. **Get your backend URL**: `https://your-app.up.railway.app`
3. **Point subdomain** (optional):
   - In GoDaddy cPanel, create subdomain `api.yourdomain.com`
   - Set CNAME record to point to your Railway/Render URL
   - Now use `https://api.yourdomain.com` instead

---

## My Recommendation

**Best Option: Railway (Free & Easy)**

1. ✅ Free tier available
2. ✅ No credit card required
3. ✅ Auto-deploys from GitHub
4. ✅ HTTPS included
5. ✅ Easy environment variable setup
6. ✅ Takes 10 minutes

**Steps:**
1. Push your code to GitHub
2. Sign up at https://railway.app
3. New Project → Deploy from GitHub
4. Add environment variables
5. Get your URL
6. Update `app/frontend/.env` with the URL
7. Build APK

**Second Best: Check SSH Access**

If your GoDaddy plan includes SSH:
- You can run Node.js directly
- More control
- No additional services needed

---

## Quick Comparison

| Option | Cost | Difficulty | Time | Reliability |
|--------|------|------------|------|-------------|
| Railway | Free | Easy | 10 min | ⭐⭐⭐⭐⭐ |
| Render | Free | Easy | 10 min | ⭐⭐⭐⭐ |
| SSH + PM2 | Free | Medium | 30 min | ⭐⭐⭐⭐⭐ |
| Heroku | $7/mo | Easy | 15 min | ⭐⭐⭐⭐⭐ |
| Upgrade Hosting | $5-20/mo | Medium | 1 hour | ⭐⭐⭐⭐⭐ |

---

## Next Steps

1. **Try Railway first** (easiest, free)
2. **OR check if you have SSH access** in cPanel
3. **OR contact GoDaddy** to upgrade/add Node.js support

Once your backend is deployed, update `app/frontend/.env` and build your APK!

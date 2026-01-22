# cPanel Deployment Checklist

Use this checklist to deploy your backend to GoDaddy cPanel:

## Pre-Deployment

- [ ] Verify Node.js is available in your cPanel
- [ ] Have your domain/subdomain ready
- [ ] Have all environment variable values ready

## File Upload

- [ ] Upload `app/` folder to cPanel
- [ ] Upload `package.json` to cPanel
- [ ] Upload `package-lock.json` to cPanel
- [ ] Upload `service-account.json` to cPanel
- [ ] Verify all files are in the correct location

## cPanel Node.js Setup

- [ ] Open "Node.js Selector" in cPanel
- [ ] Click "Create Application"
- [ ] Set Node.js version (latest LTS)
- [ ] Set Application Root path
- [ ] Set Application URL (subdomain or subdirectory)
- [ ] Set Startup File: `app/api/server.js`
- [ ] Click "Create"

## Environment Variables

- [ ] Add `JWT_SECRET`
- [ ] Add `JWT_EXPIRES_IN=8h`
- [ ] Add `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`
- [ ] Add `SPREADSHEET_ID`
- [ ] Add `SHEET_NAME=RoadMap`
- [ ] Add `ADMIN_EMAIL`
- [ ] Add `SMTP_HOST`
- [ ] Add `SMTP_PORT=465`
- [ ] Add `SMTP_SECURE=true`
- [ ] Add `SMTP_USER`
- [ ] Add `SMTP_PASS`
- [ ] Add `SMTP_FROM`
- [ ] Add `OWNER_MIKI`
- [ ] Add `OWNER_JAMES`
- [ ] Add `OWNER_DAMON`
- [ ] Add `OWNER_ANUP`
- [ ] **DO NOT** set `PORT` (cPanel provides this automatically)

## Dependencies & Start

- [ ] Click "Run NPM Install" in Node.js Selector
- [ ] Wait for installation to complete
- [ ] Click "Restart App" or "Start App"
- [ ] Check logs for "API server listening on port..."

## Testing

- [ ] Test health endpoint: `https://your-url.com/health`
- [ ] Should return: `{"status":"ok"}`
- [ ] Test login endpoint with Postman or curl
- [ ] Verify backend is accessible from outside

## Frontend Configuration

- [ ] Create `app/frontend/.env` file
- [ ] Add `VITE_API_BASE_URL=https://your-cpanel-url.com`
- [ ] Rebuild frontend: `cd app/frontend && npm run build`

## APK Build

- [ ] Build APK: `.\build-apk-simple.ps1`
- [ ] Test APK on your phone
- [ ] Share APK with team members

---

## Quick Reference

**Your cPanel Backend URL**: `https://___________________`

**Frontend .env file**:
```
VITE_API_BASE_URL=https://___________________
```

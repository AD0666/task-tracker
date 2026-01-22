## Task Tracker – Google Sheets–Driven

This is a modular task-tracking web application that uses **Google Sheets** as the task store and a **Google Drive–hosted JSON file** for authentication.

### Architecture Overview

- **Backend**: Node.js + Express
  - `auth_service`: authentication, JWT, role-based access, in-memory users for 4 owners
  - `sheet_service`: Google Sheets integration and row ↔ task mapping
  - `task_service`: business logic (priority, status, overdue calculation)
  - `notification_service`: email notifications on P1 owner tasks
  - `api`: Express server exposing clean REST endpoints
- **Frontend**: React + Vite
  - Screens for Login, Dashboard, My Tasks, P1 Tasks, Overdue Tasks, Task Detail
- **No user database** – users are managed via a JSON file on Google Drive.

### Setup

1. **Install dependencies**

```bash
npm install
cd app/frontend && npm install
```

2. **Configure environment**

Create a `.env` in the project root (values based on your config):

```bash
PORT=4000

# Google service account credentials JSON (downloaded from GCP)
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Google Sheets
SPREADSHEET_ID=1T4twRnuavxvmJk_qfU0leeeRy6LMrpl37z5U0uRURZM
SHEET_NAME=RoadMap

# JWT
JWT_SECRET=change_me
JWT_EXPIRES_IN=8h

# Admin who gets escalation emails / fallback recipient
ADMIN_EMAIL=shillongpixels@gmail.com

# SMTP
SMTP_HOST=shillongpixels.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@shillongpixels.com
SMTP_PASS=RQ4LQjSDF2Hm2ca
SMTP_FROM=no-reply@shillongpixels.com

# Map owners from the sheet to real email IDs
OWNER_MIKI=mikirahnamrabon22@gmail.com
OWNER_JAMES=jmsmxwll4@gmail.com
OWNER_DAMON=cmydamon@gmail.com
OWNER_ANUP=npmd162@gmail.com
```
There is **no external user database**: authentication uses 4 fixed users with passwords `<Username>123` (see below).

3. **Static users and passwords**

- `admin` / `admin123` – **admin**
- `Damon` / `Damon123` – user
- `Miki` / `Miki123` – user
- `James` / `James123` – user
- `Anup` / `Anup123` – user

3. **Run in development**

```bash
npm run dev
```

Backend will run on `http://localhost:4000`, frontend on `http://localhost:3000`.

### Key API Endpoints

- `POST /auth/login` – returns `{ token, user }` on success
- `POST /auth/logout` – stateless logout (client discards token)
- `GET /tasks` – all tasks with `isOverdue` flag
- `GET /tasks/my` – tasks for current owner
- `GET /tasks/p1` – P1 tasks
- `GET /tasks/overdue` – overdue tasks
- `POST /tasks` – create task (admin)
- `PUT /tasks/:rowIndex` – update task; triggers notification if `priority = P1` and logged-in user is the owner and status is not `Done`.

### Notes

- All sensitive values come from environment variables.
- Modules are **loosely coupled** and can be tested in isolation.
- Logging is structured JSON for login attempts and notification events.


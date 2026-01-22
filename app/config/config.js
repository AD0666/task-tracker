require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  google: {
    // Support both file path and JSON string (for cloud deployments)
    credentialsFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json',
    credentialsJson: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, // JSON string for Railway/Render
    sheetsSpreadsheetId: process.env.SPREADSHEET_ID,
    sheetName: process.env.SHEET_NAME || 'RoadMap',
    // You still need to set this in .env to point to the auth JSON file in Drive
    authJsonFileId: process.env.DRIVE_AUTH_JSON_FILE_ID
  },
  email: {
    admin: process.env.ADMIN_EMAIL,
    from: process.env.SMTP_FROM,
    ownerEmails: {
      MIKI: process.env.OWNER_MIKI,
      JAMES: process.env.OWNER_JAMES,
      DAMON: process.env.OWNER_DAMON,
      ANUP: process.env.OWNER_ANUP
    },
    transport: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  }
};

module.exports = config;


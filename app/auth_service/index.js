const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { AppError } = require('../utils/errors');
const config = require('../config/config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('auth_service');

// Cache for downloaded auth data
let authDataCache = null;
let authDataCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Downloads JSON file from Google Drive
 * Uses the same approach as chekc_rev0p.py
 */
async function downloadAuthFile(fileId) {
  return new Promise((resolve, reject) => {
    const url = `https://drive.google.com/uc?id=${fileId}&export=download`;
    // Use a temp directory to avoid triggering nodemon restarts
    const tempDir = path.join(__dirname, '../../.tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(tempDir, 'login_check.json');
    
    // Delete existing file if it exists
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (err) {
        logger.warn('Failed to delete existing auth file', { error: err.message });
      }
    }

    const file = fs.createWriteStream(tempPath);
    
    const request = https.get(url, (response) => {
      // Handle redirects (Google Drive returns 303, 302, 301)
      if (response.statusCode === 303 || response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          try {
            fs.unlinkSync(tempPath);
          } catch (e) {}
          logger.info('Following redirect', { from: url, to: redirectUrl, statusCode: response.statusCode });
          // Recursively follow redirect - handle both absolute and relative URLs
          const fullRedirectUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://drive.google.com${redirectUrl}`;
          return downloadAuthFile(fullRedirectUrl).then(resolve).catch(reject);
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {}
        logger.error('Download failed', { statusCode: response.statusCode, url });
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        try {
          const data = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
          // Clean up temp file
          try {
            fs.unlinkSync(tempPath);
          } catch (e) {}
          resolve(data);
        } catch (err) {
          try {
            fs.unlinkSync(tempPath);
          } catch (e) {}
          reject(new Error(`Failed to parse JSON: ${err.message}`));
        }
      });
    });
    
    request.on('error', (err) => {
      file.close();
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (e) {}
      reject(err);
    });
  });
}

/**
 * Fetches authentication data from Google Drive
 * Uses caching to avoid repeated downloads
 */
async function fetchAuthData() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (authDataCache && authDataCacheTime && (now - authDataCacheTime) < CACHE_DURATION) {
    logger.info('Using cached auth data');
    return authDataCache;
  }

  // Get file ID from config or environment
  const fileId = config.google.authJsonFileId || process.env.GOOGLE_DRIVE_FILE_ID || '1L93tkLFIcHiNAra5Zc45m4nnNO2jtEOP';
  
  try {
    logger.info('Downloading auth data from Google Drive', { fileId });
    const data = await downloadAuthFile(fileId);
    authDataCache = data;
    authDataCacheTime = now;
    
    // Support both array format [{"username": "...", "password": "..."}] 
    // and object format {users: [...]}
    const userCount = Array.isArray(data) ? data.length : (data.users?.length || 0);
    logger.info('Auth data downloaded successfully', { userCount, format: Array.isArray(data) ? 'array' : 'object' });
    return data;
  } catch (err) {
    logger.error('Failed to download auth data', { error: err.message });
    // Fallback to static users if download fails
    logger.warn('Falling back to static users');
    return [
      { username: 'Damon', password: 'Damon123', role: 'user' },
      { username: 'Anup', password: 'Anup123', role: 'user' }
    ];
  }
}

/**
 * Validates credentials against Google Drive auth file
 * Simplified version - only checks username and password
 */
async function validateCredentials(username, password) {
  try {
    const authData = await fetchAuthData();
    // Support both array format and {users: [...]} format
    const users = Array.isArray(authData) ? authData : (authData.users || []);
    
    logger.info('Validating credentials', { 
      username, 
      totalUsers: users.length,
      usernames: users.map(u => u.username)
    });

    // Simple username and password match (no status or id checks)
    const user = users.find((u) => {
      const usernameMatch = String(u.username || '').trim().toLowerCase() === String(username || '').trim().toLowerCase();
      const passwordMatch = String(u.password || '') === String(password || '');
      
      return usernameMatch && passwordMatch;
    });

    if (!user) {
      logger.warn('Login failed - invalid credentials', { username });
      throw new AppError('Invalid credentials', 401);
    }

    logger.info('Login successful', { username: user.username });

    // Map to our user format
    return {
      username: user.username,
      role: user.role || 'user'
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error('Authentication error', { error: err.message });
    throw new AppError('Authentication service error', 500);
  }
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.username,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

async function login(username, password) {
  try {
    logger.info('Login attempt started', { username });
    const user = await validateCredentials(username, password);
    const token = signToken(user);
    logger.info('Login success', { username: user.username });
    return { token, user: { username: user.username, role: user.role } };
  } catch (err) {
    logger.error('Login failed', { username, error: err.message, stack: err.stack });
    throw err;
  }
}

function logout() {
  // Stateless JWT logout is handled client-side by discarding the token.
  return true;
}

function get_current_user(req) {
  return req.user || null;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }
  const token = header.substring(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = {
      username: payload.sub,
      role: payload.role
    };
    next();
  } catch (err) {
    logger.warn('Invalid token', { error: err.message });
    next(new AppError('Invalid or expired token', 401));
  }
}

function authorize_role(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const user = req.user;
    if (!user || !allowed.includes(user.role)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}

module.exports = {
  login,
  logout,
  get_current_user,
  authorize_role,
  authMiddleware
};


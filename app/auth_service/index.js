const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const config = require('../config/config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('auth_service');

// Static in-memory users.
// Password rule: password must be "<Username>123", e.g. Damon123, Miki123
const STATIC_USERS = [
  { username: 'Damon', role: 'user' },
  { username: 'Miki', role: 'user' },
  { username: 'James', role: 'user' },
  { username: 'Anup', role: 'user' },
  { username: 'admin', role: 'admin', password: 'admin123' }
];

async function validateCredentials(username, password) {
  const user = STATIC_USERS.find(
    (u) => u.username.toLowerCase() === String(username).toLowerCase()
  );
  if (!user) {
    logger.warn('Login failed - user not found', { username });
    throw new AppError('Invalid credentials', 401);
  }

  const expectedPassword =
    user.username === 'admin'
      ? user.password
      : `${user.username}123`;
  if (password !== expectedPassword) {
    logger.warn('Login failed - bad password', { username });
    throw new AppError('Invalid credentials', 401);
  }

  return user;
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
  const user = await validateCredentials(username, password);
  const token = signToken(user);
  logger.info('Login success', { username: user.username });
  return { token, user: { username: user.username, role: user.role } };
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


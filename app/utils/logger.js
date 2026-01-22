const morgan = require('morgan');

// Simple structured logger wrapper – can be swapped for pino/winston later
function createLogger(scope) {
  const prefix = scope ? `[${scope}]` : '';

  function log(level, message, meta) {
    const payload = {
      level,
      message: `${prefix} ${message}`.trim(),
      ...(meta ? { meta } : {})
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload));
  }

  return {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta)
  };
}

const httpLoggerMiddleware = morgan('combined');

module.exports = {
  createLogger,
  httpLoggerMiddleware
};


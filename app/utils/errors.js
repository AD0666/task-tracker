class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function errorMiddleware(err, req, res, next) {
  const status = err.statusCode || 500;
  const payload = {
    error: {
      message: err.message || 'Internal Server Error'
    }
  };
  if (process.env.NODE_ENV !== 'production' && err.details) {
    payload.error.details = err.details;
  }
  res.status(status).json(payload);
}

module.exports = {
  AppError,
  errorMiddleware
};


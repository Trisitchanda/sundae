import AppError from '../utils/AppError.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;

  // Log error for dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404);
    statusCode = error.statusCode;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = new AppError('Duplicate field value entered', 400);
    statusCode = error.statusCode;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
    statusCode = error.statusCode;
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

export { errorHandler };

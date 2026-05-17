/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */

const errorHandler = (error, req, res, next) => {
  // Log error for debugging
  console.error('Error:', error.message);

  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
      .map(err => err.message)
      .join(', ');
    
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      details: messages,
    });
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists. Please use a different value.`,
    });
  }

  // Send error response
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error.stack }),
  });
};

module.exports = errorHandler;

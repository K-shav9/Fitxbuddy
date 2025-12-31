import messages from '../utils/message.utils.js';
import statusCodes from '../utils/status.code.js';


const ErrorMiddleware = async (err, req, res, next) => {
  // Default error properties
  const status = Number(err.statusCode) || Number(statusCodes.ERROR) || 500;
  let message = err.message || messages.INTERNAL_SERVER_ERROR;

  // Database error handling
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    status = statusCodes.BAD_REQUEST;
    message = err.errors?.map((error) => error.message).join(', ') || messages.BAD_REQUEST;
  } else if (err.name === 'SequelizeDatabaseError') {
    status = statusCodes.ERROR;
    message = 'A database error occurred. Please try again later.';
  } else if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    status = 503; // Not defined in your `statusCodes`, so kept as-is
    message = 'Database connection failed. Please try again later.';
  }

  const response = { status, message };

  // Include stack trace for non-production environments
  if (['development', 'staging'].includes(process.env.NODE_ENV || '')) {
    response.stack = err.stack;
  }

  // Log the error
  console.error('Error occurred:', err);

  console.error('Error status:', status);


  // Send the response
  res.status(status).json(response);
};

export default ErrorMiddleware;


/**
 * QueueEase V2 — Error Handler Middleware
 */

const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  // Issue #22 fix: do not echo back `err.value` — for routes like
  // `GET /api/appointments/:id`, an invalid ID cast error's `value` is
  // the raw path parameter, which is low-risk, but for other routes a
  // bad cast can originate from request body fields that may contain
  // patient names, NICs, etc. Keep the message generic.
  const message = `Invalid ${err.path}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Issue #22 fix: report which *field* caused the conflict, not its
  // value (e.g. don't echo back an email/NIC in the response/logs).
  const fields = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'field';
  const message = `An account or record with this ${fields} already exists.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // Issue #22 fix: Mongoose ValidationError messages can embed the
  // invalid *value* (which may be PHI, e.g. a name or NIC that failed a
  // regex). Use each field's validator message/path only, not raw value.
  const errors = Object.values(err.errors).map((el) => `${el.path}: ${el.kind || 'invalid value'}`);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  // Issue #22 fix: previously this spread the *entire* raw error object
  // (`error: err`) into the JSON response. For Mongoose errors that
  // object can contain the offending document's field values — which,
  // for this app, are frequently patient names, phone numbers, NICs, or
  // symptoms. Only return the message, error name, and stack trace
  // (code locations — not data).
  res.status(err.statusCode).json({
    success: false,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational/trusted error: send message
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programming or unknown error: don't leak details
    console.error('💥 ERROR:', err.message);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Issue #22 fix: sanitize known Mongoose/JWT error types in BOTH
  // development and production, so PHI embedded in raw validation/cast
  // error values never reaches logs or responses, even during local dev.
  let error = err;
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  error.statusCode = error.statusCode || err.statusCode;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

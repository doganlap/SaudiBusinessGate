/**
 * Comprehensive Error Handling Module
 * Handles all application errors with proper logging and recovery
 */

const auditLogger = require('./audit-logger');

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message, details = {}) {
    super(message, 409, 'CONFLICT');
    this.details = details;
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 503, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

class TimeoutError extends AppError {
  constructor(operation = 'Operation') {
    super(`${operation} timed out`, 504, 'TIMEOUT');
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

/**
 * Error Logger
 */
class ErrorLogger {
  static log(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      errorCode: error.errorCode || 'UNKNOWN',
      statusCode: error.statusCode || 500,
      stack: error.stack,
      context
    };

    if (process.env.LOG_FORMAT === 'json') {
      console.error(JSON.stringify(errorEntry, null, 2));
    } else {
      console.error(`[ERROR] ${errorEntry.timestamp} - ${error.message}`, context);
    }

    // Log to file if configured
    if (process.env.LOG_DESTINATION && process.env.LOG_DESTINATION.includes('file')) {
      const fs = require('fs');
      const logPath = process.env.LOG_FILE_PATH || '/var/log/document-processing.log';
      fs.appendFileSync(logPath, JSON.stringify(errorEntry) + '\n');
    }

    // Send alert if configured
    if (process.env.ERROR_NOTIFICATION_ENABLED === 'true') {
      ErrorLogger.sendAlert(error, context);
    }

    // Log to audit
    if (auditLogger) {
      auditLogger.logError(error, context);
    }
  }

  static sendAlert(error, context) {
    // Slack notification
    if (process.env.ERROR_ALERT_SLACK === 'true' && process.env.SLACK_WEBHOOK_URL) {
      const message = {
        text: `🚨 Application Error: ${error.message}`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Error Code', value: error.errorCode, short: true },
            { title: 'Status Code', value: error.statusCode, short: true },
            { title: 'Message', value: error.message },
            { title: 'Context', value: JSON.stringify(context) },
            { title: 'Time', value: new Date().toISOString() }
          ]
        }]
      };

      // Send to Slack (async, don't block)
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify(message)
      }).catch(e => console.error('Failed to send Slack alert:', e));
    }

    // Email notification
    if (process.env.ERROR_NOTIFICATION_EMAIL && process.env.SMTP_HOST) {
      // Queue for async email sending
      setImmediate(() => {
        ErrorLogger.sendEmailAlert(error, context).catch(
          e => console.error('Failed to send email alert:', e)
        );
      });
    }
  }

  static async sendEmailAlert(error, context) {
    // Email implementation would go here
    // This is a placeholder for email alert functionality
  }
}

/**
 * Error Recovery Middleware
 */
class ErrorRecovery {
  static async retry(fn, options = {}) {
    const {
      maxAttempts = parseInt(process.env.ERROR_RETRY_ATTEMPTS || 3),
      delayMs = parseInt(process.env.ERROR_RETRY_DELAY || 5000),
      backoffMultiplier = 2,
      timeout = parseInt(process.env.PROCESSING_TIMEOUT || 300000)
    } = options;

    let lastError;
    let delay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new TimeoutError('Operation')), timeout)
          )
        ]);
      } catch (error) {
        lastError = error;

        // Don't retry on validation or auth errors
        if (error instanceof ValidationError || error instanceof UnauthorizedError) {
          throw error;
        }

        if (attempt < maxAttempts) {
          console.log(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= backoffMultiplier;
        }
      }
    }

    throw lastError;
  }

  static async withFallback(primaryFn, fallbackFn) {
    try {
      return await primaryFn();
    } catch (error) {
      console.warn('Primary operation failed, attempting fallback:', error.message);
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        throw new Error(`Both primary and fallback operations failed: ${fallbackError.message}`);
      }
    }
  }
}

/**
 * Express error handling middleware
 */
function errorHandlerMiddleware(err, req, res, next) {
  const error = err instanceof AppError ? err : new AppError(
    err.message || 'Internal Server Error',
    err.statusCode || 500
  );

  // Log the error
  ErrorLogger.log(error, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id
  });

  // Sanitize error response
  const response = {
    success: false,
    error: {
      code: error.errorCode,
      message: error.message,
      timestamp: error.timestamp
    }
  };

  // Include details in development
  if (process.env.NODE_ENV !== 'production') {
    response.error.stack = error.stack;
    if (error.details) {
      response.error.details = error.details;
    }
  }

  // Include retry-after for rate limit errors
  if (error instanceof RateLimitError) {
    res.set('Retry-After', error.retryAfter);
  }

  res.status(error.statusCode).json(response);
}

/**
 * Async route wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validates error and decides action
 */
function analyzeError(error) {
  const analysis = {
    isRetryable: false,
    shouldAlert: true,
    severity: 'error'
  };

  if (error instanceof ValidationError) {
    analysis.isRetryable = false;
    analysis.shouldAlert = false;
    analysis.severity = 'warning';
  } else if (error instanceof TimeoutError || error instanceof DatabaseError) {
    analysis.isRetryable = true;
    analysis.severity = 'critical';
  } else if (error instanceof RateLimitError) {
    analysis.isRetryable = true;
    analysis.severity = 'warning';
  } else if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
    analysis.isRetryable = false;
    analysis.shouldAlert = false;
    analysis.severity = 'warning';
  }

  return analysis;
}

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  TimeoutError,
  RateLimitError,

  // Logger
  ErrorLogger,

  // Recovery
  ErrorRecovery,

  // Middleware
  errorHandlerMiddleware,
  asyncHandler,

  // Utilities
  analyzeError
};
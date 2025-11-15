// Error Handler Middleware
// Professional error handling and tracking

import { NextResponse } from 'next/server';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(400, message, true, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, true, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(403, message, true, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, true, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, true, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, message, true, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message, false, 'INTERNAL_ERROR');
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    logger.error(error.message, {
      statusCode: error.statusCode,
      code: error.code,
      isOperational: error.isOperational
    }, error);

    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          ...(error instanceof ValidationError && { errors: error.errors })
        }
      },
      { status: error.statusCode }
    );
  }

  // Unknown error
  logger.fatal('Unhandled error', {}, error as Error);

  return NextResponse.json(
    {
      error: {
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : (error as Error).message,
        code: 'INTERNAL_ERROR'
      }
    },
    { status: 500 }
  );
}

export function asyncHandler(fn: Function) {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error);
    }
  };
}

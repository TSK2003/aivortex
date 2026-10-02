import { AppError } from '../utils/appError.js'
import { errorResponse } from '../utils/responseWrapper.js'

export function errorHandler(err, req, res, next) {
  // Operational errors
  if (err instanceof AppError) {
    return errorResponse(res, err.statusCode, err.code, err.message, err.details)
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Input validation failed', err.errors)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'INVALID_TOKEN', 'Malformed or invalid authentication token')
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'TOKEN_EXPIRED', 'Authentication token has expired. Please sign in again.')
  }

  // Unexpected runtime errors
  console.error('[ERROR] Unhandled Exception:', err)
  const message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message
  return errorResponse(res, 500, 'INTERNAL_SERVER_ERROR', message)
}

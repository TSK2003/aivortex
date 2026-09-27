export function successResponse(res, data = null, message = null, statusCode = 200) {
  const payload = {
    success: true,
    data
  }
  if (message) {
    payload.message = message
  }
  return res.status(statusCode).json(payload)
}

export function errorResponse(res, statusCode = 500, code = 'INTERNAL_ERROR', message = 'An error occurred', details = null) {
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  }
  if (details) {
    payload.error.details = details
  }
  return res.status(statusCode).json(payload)
}

/**
 * Standardized application error class.
 * Thrown from services/controllers and caught by the global error middleware.
 */
export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: unknown[];
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: unknown[] = [],
    stack = ""
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request", errors: unknown[] = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not Found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict", errors: unknown[] = []) {
    return new ApiError(409, message, errors);
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(500, message);
  }
}

export default ApiError;

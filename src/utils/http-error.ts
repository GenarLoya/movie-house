export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpErrorCode = keyof typeof HttpStatus;
export type HttpErrorStatus = (typeof HttpStatus)[HttpErrorCode];

export class HttpError extends Error {
  readonly status: HttpErrorStatus;
  readonly code?: HttpErrorCode;
  readonly cause?: unknown;

  constructor(
    status: HttpErrorStatus,
    message: string,
    options?: {
      cause?: unknown;
    },
  ) {
    super(message);

    this.status = status;
    this.cause = options?.cause;

    // Necesario para que instanceof funcione bien
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  /* =====================
   * Helpers estáticos
   * ===================== */

  static badRequest(message: string, cause?: unknown) {
    return new HttpError(HttpStatus.BAD_REQUEST, message, {
      cause,
    });
  }

  static notFound(message = "Resource not found", cause?: unknown) {
    return new HttpError(HttpStatus.NOT_FOUND, message, {
      cause,
    });
  }

  static conflict(message: string, cause?: unknown) {
    return new HttpError(HttpStatus.CONFLICT, message, {
      cause,
    });
  }

  static unauthorized(message = "Unauthorized", cause?: unknown) {
    return new HttpError(HttpStatus.UNAUTHORIZED, message, {
      cause,
    });
  }

  static forbidden(message = "Forbidden", cause?: unknown) {
    return new HttpError(HttpStatus.FORBIDDEN, message, {
      cause,
    });
  }

  static internalError(message = "Internal server error", cause?: unknown) {
    return new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, message, {
      cause,
    });
  }
}

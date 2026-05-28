export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_EMAIL_NOT_CONFIRMED"
  | "AUTH_TOO_MANY_REQUESTS"
  | "AUTH_USER_NOT_FOUND"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly isOperational: boolean;

  constructor(message: string, code: ErrorCode = "UNKNOWN", status = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static unauthorized(message = "Não autorizado."): AppError {
    return new AppError(message, "UNAUTHORIZED", 401);
  }

  static forbidden(message = "Acesso negado."): AppError {
    return new AppError(message, "FORBIDDEN", 403);
  }

  static notFound(message = "Recurso não encontrado."): AppError {
    return new AppError(message, "NOT_FOUND", 404);
  }

  static validation(message: string): AppError {
    return new AppError(message, "VALIDATION_ERROR", 422);
  }

  static server(message = "Erro interno do servidor."): AppError {
    return new AppError(message, "SERVER_ERROR", 500);
  }
}

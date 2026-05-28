import type { ErrorCode } from "./app-error";

interface AuthErrorEntry {
  pattern: string;
  message: string;
  code: ErrorCode;
}

const AUTH_ERROR_MAP: AuthErrorEntry[] = [
  {
    pattern: "invalid login credentials",
    message: "E-mail ou senha inválidos.",
    code: "AUTH_INVALID_CREDENTIALS",
  },
  {
    pattern: "invalid email or password",
    message: "E-mail ou senha inválidos.",
    code: "AUTH_INVALID_CREDENTIALS",
  },
  {
    pattern: "email not confirmed",
    message: "Confirme seu e-mail antes de fazer login.",
    code: "AUTH_EMAIL_NOT_CONFIRMED",
  },
  {
    pattern: "too many requests",
    message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    code: "AUTH_TOO_MANY_REQUESTS",
  },
  {
    pattern: "user not found",
    message: "Usuário não encontrado.",
    code: "AUTH_USER_NOT_FOUND",
  },
  {
    pattern: "network request failed",
    message: "Falha na conexão. Verifique sua internet.",
    code: "NETWORK_ERROR",
  },
  {
    pattern: "email link is invalid or has expired",
    message: "Link expirado. Solicite um novo.",
    code: "VALIDATION_ERROR",
  },
];

export interface ResolvedError {
  message: string;
  code: ErrorCode;
}

export function resolveAuthError(raw: string): ResolvedError {
  const normalized = raw.toLowerCase();
  const match = AUTH_ERROR_MAP.find((entry) =>
    normalized.includes(entry.pattern)
  );

  return {
    message: match?.message ?? "Ocorreu um erro inesperado. Tente novamente.",
    code: match?.code ?? "UNKNOWN",
  };
}

export function resolveAuthErrorMessage(raw: string): string {
  return resolveAuthError(raw).message;
}

export function isOperationalError(error: unknown): boolean {
  if (error instanceof Error) {
    return (error as { isOperational?: boolean }).isOperational === true;
  }
  return false;
}

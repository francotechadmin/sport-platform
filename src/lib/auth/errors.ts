// Authentication error handling classes and types

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  PASSWORDS_DONT_MATCH = 'PASSWORDS_DONT_MATCH',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  STORAGE_ERROR = 'STORAGE_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  CRYPTO_ERROR = 'CRYPTO_ERROR'
}

export class AuthError extends Error {
  constructor(public type: AuthErrorType, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Error message mappings for user-friendly display
export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  [AuthErrorType.INVALID_CREDENTIALS]: 'Invalid email or password',
  [AuthErrorType.EMAIL_EXISTS]: 'Email already registered',
  [AuthErrorType.PASSWORDS_DONT_MATCH]: 'Passwords do not match',
  [AuthErrorType.INVALID_EMAIL]: 'Please enter a valid email address',
  [AuthErrorType.WEAK_PASSWORD]: 'Password must be at least 8 characters long',
  [AuthErrorType.STORAGE_ERROR]: 'Unable to save data. Please try again.',
  [AuthErrorType.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [AuthErrorType.CRYPTO_ERROR]: 'Security operation failed. Please try again.'
};

// Utility function to get user-friendly error message
export function getAuthErrorMessage(error: AuthError | Error): string {
  if (error instanceof AuthError) {
    return AUTH_ERROR_MESSAGES[error.type] || error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
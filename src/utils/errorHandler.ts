export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export const createError = (message: string, code?: string, status?: number, details?: any): AppError => ({
  message,
  code,
  status,
  details
});

export const handleApiError = (error: any): AppError => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 400:
        return createError(message || 'Bad request', 'BAD_REQUEST', status);
      case 401:
        return createError('Authentication required', 'UNAUTHORIZED', status);
      case 403:
        return createError('Access denied', 'FORBIDDEN', status);
      case 404:
        return createError('Resource not found', 'NOT_FOUND', status);
      case 422:
        return createError(message || 'Validation failed', 'VALIDATION_ERROR', status, error.response.data?.errors);
      case 500:
        return createError('Internal server error', 'SERVER_ERROR', status);
      default:
        return createError(message || 'An error occurred', 'API_ERROR', status);
    }
  }
  
  if (error.request) {
    return createError('Network error - please check your connection', 'NETWORK_ERROR');
  }
  
  return createError(error.message || 'An unexpected error occurred', 'UNKNOWN_ERROR');
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

export const isValidationError = (error: AppError): boolean => {
  return error.code === 'VALIDATION_ERROR' && error.status === 422;
};

export const isAuthError = (error: AppError): boolean => {
  return error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN';
};

export const isNetworkError = (error: AppError): boolean => {
  return error.code === 'NETWORK_ERROR';
};
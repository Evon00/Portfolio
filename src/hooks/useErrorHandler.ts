import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { handleApiError, isAuthError, getErrorMessage, AppError } from '@/utils/errorHandler';
import { useAuthStore } from '@/stores';

export const useErrorHandler = () => {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleError = useCallback(async (error: any): Promise<AppError> => {
    const appError = handleApiError(error);
    
    if (isAuthError(appError)) {
      await logout();
      router.push('/admin/login');
    }
    
    console.error('Application Error:', appError);
    return appError;
  }, [logout, router]);

  const getErrorMessage = useCallback((error: any): string => {
    return getErrorMessage(error);
  }, []);

  return {
    handleError,
    getErrorMessage
  };
};
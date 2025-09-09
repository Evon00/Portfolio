import { useState, useCallback, useEffect } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  executeOnMount?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useAsync = <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) => {
  const { executeOnMount = false, onSuccess, onError } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null
  });

  const { handleError, getErrorMessage } = useErrorHandler();

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await asyncFunction(...args);
      setState({ data, isLoading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const appError = await handleError(error);
      const errorMessage = getErrorMessage(appError);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      onError?.(errorMessage);
      throw error;
    }
  }, [asyncFunction, handleError, getErrorMessage, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (executeOnMount) {
      execute();
    }
  }, [executeOnMount]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    execute,
    reset,
    clearError
  };
};
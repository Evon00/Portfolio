import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { LoginCredentials } from '@/services';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    checkAuth,
    clearError
  } = useAuthStore();

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 로그인
  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      return true;
    } catch (error) {
      return false;
    }
  }, [login]);

  // 로그아웃
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      return true;
    } catch (error) {
      return false;
    }
  }, [logout]);

  // 토큰 갱신
  const handleRefreshToken = useCallback(async () => {
    try {
      await refreshToken();
      return true;
    } catch (error) {
      return false;
    }
  }, [refreshToken]);

  return {
    // 상태
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // 액션
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    clearError
  };
};
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, LoginCredentials } from '@/services';
import { AdminAuth } from '@/types';

interface AuthState {
  // 상태
  user: AdminAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 로그인
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const authData = await authService.login(credentials);
          set({
            user: authData,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed'
          });
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Logout failed'
          });
        }
      },

      // 토큰 갱신
      refreshToken: async () => {
        try {
          const authData = await authService.refreshToken();
          set({
            user: authData,
            isAuthenticated: true,
            error: null
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            error: error instanceof Error ? error.message : 'Token refresh failed'
          });
          throw error;
        }
      },

      // 인증 상태 확인
      checkAuth: () => {
        const isAuth = authService.isAuthenticated();
        const token = authService.getToken();
        const expiresAt = authService.getTokenExpiration();
        
        if (isAuth && token && expiresAt) {
          set({
            user: { token, expiresAt: expiresAt.toISOString() },
            isAuthenticated: true,
            error: null
          });
          
          // 토큰 자동 갱신 필요한지 확인
          if (authService.shouldRefreshToken()) {
            get().refreshToken().catch(() => {
              // 갱신 실패시 로그아웃
              get().logout();
            });
          }
        } else {
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
        }
      },

      // 에러 초기화
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
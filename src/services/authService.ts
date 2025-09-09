import { AdminAuth } from '@/types';
import { BaseApiService } from './apiService';

export interface LoginCredentials {
  username: string;
  password: string;
}

export class AuthService extends BaseApiService {
  private readonly TOKEN_KEY = 'admin_token';
  private readonly EXPIRES_KEY = 'admin_token_expires';

  constructor() {
    super('/api/auth');
  }

  async login(credentials: LoginCredentials): Promise<AdminAuth> {
    return this.post<AdminAuth>('/login', credentials);
  }

  async logout(): Promise<void> {
    await this.post<void>('/logout');
    // 로컬 스토리지에서 제거
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
  }

  async refreshToken(): Promise<AdminAuth> {
    const authData = await this.post<AdminAuth>('/refresh');
    
    // 로컬 스토리지 업데이트
    localStorage.setItem(this.TOKEN_KEY, authData.token);
    localStorage.setItem(this.EXPIRES_KEY, authData.expiresAt);
    
    return authData;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiresAt = localStorage.getItem(this.EXPIRES_KEY);
    
    if (!token || !expiresAt) {
      return false;
    }
    
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    
    return now < expirationDate;
  }

  getToken(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getTokenExpiration(): Date | null {
    const expiresAt = localStorage.getItem(this.EXPIRES_KEY);
    if (!expiresAt) {
      return null;
    }
    
    return new Date(expiresAt);
  }

  // 토큰 자동 갱신 (만료 1시간 전)
  shouldRefreshToken(): boolean {
    const expirationDate = this.getTokenExpiration();
    if (!expirationDate) {
      return false;
    }
    
    const now = new Date();
    const oneHourBeforeExpiration = new Date(expirationDate.getTime() - 60 * 60 * 1000);
    
    return now >= oneHourBeforeExpiration;
  }
}

// 싱글톤 인스턴스 생성
export const authService = new AuthService();
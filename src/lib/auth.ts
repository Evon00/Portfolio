// 인증 관련 유틸리티 함수들

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  message?: string;
}

// API 응답 타입
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface LoginResponse {
  jwt: string;
}

// 환경 변수
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const JWT_STORAGE_KEY = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'portfolio_auth_token';

// 실제 API 로그인 함수
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/member/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: response.status === 401 
          ? '아이디 또는 비밀번호가 올바르지 않습니다.' 
          : `로그인 실패: ${errorText}`
      };
    }

    const result: ApiResponse<LoginResponse> = await response.json();
    
    if (result.code === 200 && result.data.jwt) {
      return {
        success: true,
        token: result.data.jwt,
        message: result.message || '로그인에 성공했습니다.'
      };
    } else {
      return {
        success: false,
        message: result.message || '로그인에 실패했습니다.'
      };
    }
  } catch (error) {
    console.error('Login API Error:', error);
    return {
      success: false,
      message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

// 토큰 저장
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(JWT_STORAGE_KEY, token);
  }
}

// 토큰 가져오기
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(JWT_STORAGE_KEY);
  }
  return null;
}

// 토큰 삭제
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(JWT_STORAGE_KEY);
  }
}

// Authorization 헤더 생성
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 토큰 유효성 검사
export function isTokenValid(token?: string): boolean {
  const tokenToCheck = token || getToken();
  if (!tokenToCheck) return false;

  try {
    // JWT는 3개 부분으로 구성됨 (header.payload.signature)
    const parts = tokenToCheck.split('.');
    if (parts.length !== 3) return false;

    // payload 디코드
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // exp가 있다면 만료 시간 체크
    if (payload.exp && payload.exp < currentTime) {
      removeToken();
      return false;
    }

    return true;
  } catch {
    removeToken();
    return false;
  }
}

// 인증 상태 확인
export function isAuthenticated(): boolean {
  const token = getToken();
  return token ? isTokenValid(token) : false;
}

// 로그아웃
export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/admin';
  }
}
import { getAuthHeader, removeToken } from '@/lib/auth';

// API 응답 공통 타입
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// 에러 타입 정의
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 인증 에러 타입
export class AuthenticationError extends ApiError {
  constructor(message: string = '인증이 만료되었습니다. 다시 로그인해주세요.') {
    super(401, 401, message);
    this.name = 'AuthenticationError';
  }
}

// API 기본 서비스 클래스
export abstract class BaseApiService {
  protected readonly baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  private handleAuthenticationError(): void {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, response.status, `HTTP ${response.status}: ${errorText}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (result.code !== 200) {
      throw new ApiError(result.code, result.code, result.message || 'API 요청이 실패했습니다.');
    }

    return result.data;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (requiresAuth) {
      Object.assign(headers, getAuthHeader());
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // 401 인증 오류 처리
      if (response.status === 401 && requiresAuth) {
        this.handleAuthenticationError();
        throw new AuthenticationError();
      }
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new ApiError(0, 0, error.message);
      }
      
      throw new ApiError(0, 0, '알 수 없는 오류가 발생했습니다.');
    }
  }

  private createRequestWithBody(method: HttpMethod, data: unknown): RequestInit {
    return {
      method,
      body: JSON.stringify(data),
    };
  }

  protected async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, requiresAuth);
  }

  protected async post<T>(endpoint: string, data: unknown, requiresAuth: boolean = false): Promise<T> {
    return this.makeRequest<T>(endpoint, this.createRequestWithBody('POST', data), requiresAuth);
  }

  protected async put<T>(endpoint: string, data: unknown, requiresAuth: boolean = false): Promise<T> {
    return this.makeRequest<T>(endpoint, this.createRequestWithBody('PUT', data), requiresAuth);
  }

  protected async patch<T>(endpoint: string, data: unknown, requiresAuth: boolean = false): Promise<T> {
    return this.makeRequest<T>(endpoint, this.createRequestWithBody('PATCH', data), requiresAuth);
  }

  protected async delete<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' }, requiresAuth);
  }

  // 파일 업로드용 메서드
  protected async uploadFile<T>(
    endpoint: string, 
    formData: FormData, 
    requiresAuth: boolean = true,
    method: HttpMethod = 'POST'
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // FormData 사용시 Content-Type을 설정하지 않아야 브라우저가 자동으로 boundary 설정
    const headers: Record<string, string> = {};
    
    if (requiresAuth) {
      Object.assign(headers, getAuthHeader());
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: formData,
      });
      
      // 401 인증 오류 처리
      if (response.status === 401 && requiresAuth) {
        this.handleAuthenticationError();
        throw new AuthenticationError();
      }
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new ApiError(0, 0, error.message);
      }
      
      throw new ApiError(0, 0, '알 수 없는 오류가 발생했습니다.');
    }
  }
}
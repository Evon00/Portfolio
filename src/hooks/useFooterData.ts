'use client';

import { useCallback, useEffect, useState } from 'react';
import { memberService, type UserInfo } from '@/services/memberService';
import { ApiError } from '@/services/apiService';

// Footer 상태 타입 정의
export interface FooterDataState {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

// Footer 액션 타입 정의
export interface FooterDataActions {
  reload: () => Promise<void>;
  clearError: () => void;
}

// 에러 처리 유틸리티
const handleFooterError = (error: unknown): string => {
  if (error instanceof ApiError) {
    // Footer는 중요하지 않은 UI이므로 에러를 간소화
    return '사용자 정보를 불러올 수 없습니다';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '정보를 불러오는데 실패했습니다';
};

/**
 * Footer 데이터 관리 커스텀 훅
 * - 사용자 정보만 필요하므로 단순한 구조
 * - 에러가 발생해도 앱 전체에 영향을 주지 않도록 처리
 */
export const useFooterData = (): FooterDataState & FooterDataActions => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadUserInfo = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const profileResponse = await memberService.getProfile();
      setUserInfo(profileResponse);
    } catch (err) {
      console.error('Footer 사용자 정보 로드 실패:', err);
      const errorMessage = handleFooterError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  return {
    userInfo,
    isLoading,
    error,
    reload: loadUserInfo,
    clearError,
  };
};

// 개별 사용자 정보 훅 (재사용 가능)
export const useUserInfo = (autoLoad: boolean = true) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await memberService.getProfile();
      setUserInfo(profile);
    } catch (err) {
      setError(handleFooterError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  return { 
    userInfo, 
    loading, 
    error, 
    load,
    clear: () => {
      setUserInfo(null);
      setError(null);
      setLoading(false);
    }
  };
};
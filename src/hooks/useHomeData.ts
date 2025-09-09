'use client';

import { useCallback, useEffect, useState } from 'react';
import { memberService, type UserInfo } from '@/services/memberService';
import { skillService, type SkillResponse } from '@/services/skillService';
import { projectService } from '@/services/projectService';
import { blogService, type BlogPost } from '@/services/blogService';
import { ApiError } from '@/services/apiService';
import { Project } from '@/types';

// 상수 추출
export const HOME_DATA_CONSTANTS = {
  LATEST_BLOG_POSTS_LIMIT: 3,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
} as const;

// 상태 타입 정의
export interface HomeDataState {
  userInfo: UserInfo | null;
  adminSkills: SkillResponse[];
  featuredProjects: Project[];
  latestBlogPosts: BlogPost[];
  loading: boolean;
  error: string | null;
  refreshKey: number;
}

// 초기 상태
const initialState: HomeDataState = {
  userInfo: null,
  adminSkills: [],
  featuredProjects: [],
  latestBlogPosts: [],
  loading: true,
  error: null,
  refreshKey: 0,
};

// 에러 처리 유틸리티
const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 404:
        return '요청한 데이터를 찾을 수 없습니다.';
      case 500:
        return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.';
      default:
        return error.message || '데이터를 불러오는데 실패했습니다.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

// 데이터 로딩 액션 타입
export interface HomeDataActions {
  loadData: () => Promise<void>;
  retry: () => void;
  clearError: () => void;
}

/**
 * 홈페이지 데이터 관리 커스텀 훅
 * - 사용자 정보, 기술 스택, 주요 프로젝트, 최신 블로그 포스트를 관리
 * - 에러 처리 및 재시도 기능 제공
 * - 로딩 상태 관리
 */
export const useHomeData = (): HomeDataState & HomeDataActions => {
  const [state, setState] = useState<HomeDataState>(initialState);
  const [retryCount, setRetryCount] = useState(0);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 모든 데이터를 병렬로 로드
      const [profileResponse, skillsResponse, featuredProjectsResponse, blogResponse] = 
        await Promise.all([
          memberService.getProfile(),
          skillService.getAdminSkills(),
          projectService.getFeaturedProjects(),
          blogService.getBlogPosts(0, HOME_DATA_CONSTANTS.LATEST_BLOG_POSTS_LIMIT, 'createdAt', 'desc')
        ]);

      setState(prev => ({
        ...prev,
        userInfo: profileResponse,
        adminSkills: skillsResponse.skills,
        featuredProjects: featuredProjectsResponse,
        latestBlogPosts: [...blogResponse.posts],
        refreshKey: prev.refreshKey + 1,
        loading: false,
        error: null,
      }));

      // 성공시 재시도 카운트 초기화
      setRetryCount(0);
    } catch (error) {
      console.error('홈페이지 데이터 로드 실패:', error);
      const errorMessage = handleApiError(error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const retry = useCallback(async () => {
    if (retryCount < HOME_DATA_CONSTANTS.MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      
      // 재시도 딜레이
      setTimeout(() => {
        loadData();
      }, HOME_DATA_CONSTANTS.RETRY_DELAY * (retryCount + 1));
    } else {
      setState(prev => ({ 
        ...prev, 
        error: '최대 재시도 횟수를 초과했습니다. 페이지를 새로고침해 주세요.' 
      }));
    }
  }, [loadData, retryCount]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    loadData,
    retry,
    clearError,
  };
};

// 개별 섹션별 훅 (필요시 사용)
export const useUserProfile = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await memberService.getProfile();
      setUserInfo(profile);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return { userInfo, loading, error, reload: loadUserProfile };
};
import { useCallback, useEffect } from 'react';
import { useUserStore } from '@/stores';
import { UpdateUserInfoData } from '@/services';

export const useUser = () => {
  const {
    user,
    isLoading,
    error,
    fetchUser,
    updateBasicInfo,
    updateTechStack,
    updateFeaturedProjects,
    updateProfileImage,
    clearError
  } = useUserStore();

  // 사용자 정보 조회
  const loadUser = useCallback(async () => {
    try {
      await fetchUser();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchUser]);

  // 기본 정보 수정
  const handleUpdateBasicInfo = useCallback(async (data: UpdateUserInfoData) => {
    try {
      const updatedUser = await updateBasicInfo(data);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [updateBasicInfo]);

  // 기술 스택 수정
  const handleUpdateTechStack = useCallback(async (techStacks: string[]) => {
    try {
      const updatedUser = await updateTechStack(techStacks);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [updateTechStack]);

  // 주요 프로젝트 수정
  const handleUpdateFeaturedProjects = useCallback(async (projectIds: string[]) => {
    try {
      const updatedUser = await updateFeaturedProjects(projectIds);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [updateFeaturedProjects]);

  // 프로필 이미지 수정
  const handleUpdateProfileImage = useCallback(async (imageUrl: string) => {
    try {
      const updatedUser = await updateProfileImage(imageUrl);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [updateProfileImage]);

  return {
    // 상태
    user,
    isLoading,
    error,
    
    // 액션
    loadUser,
    updateBasicInfo: handleUpdateBasicInfo,
    updateTechStack: handleUpdateTechStack,
    updateFeaturedProjects: handleUpdateFeaturedProjects,
    updateProfileImage: handleUpdateProfileImage,
    clearError
  };
};

// 사용자 정보를 자동으로 로드하는 훅
export const useUserWithAutoLoad = () => {
  const userHooks = useUser();
  
  useEffect(() => {
    userHooks.loadUser();
  }, []);
  
  return userHooks;
};
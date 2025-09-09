import { create } from 'zustand';
import { User } from '@/types';
import { memberService, MemberUpdateRequest } from '@/services';

interface UserState {
  // 상태
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  fetchUser: () => Promise<void>;
  updateBasicInfo: (data: MemberUpdateRequest) => Promise<User>;
  updateTechStack: (techStacks: string[]) => Promise<User>;
  updateFeaturedProjects: (projectIds: string[]) => Promise<User>;
  updateProfileImage: (imageUrl: string) => Promise<User>;
  
  // UI 상태 관리
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // 초기 상태
  user: null,
  isLoading: false,
  error: null,

  // 사용자 정보 조회
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const user = await memberService.getProfile();
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoading: false
      });
    }
  },

  // 기본 정보 수정
  updateBasicInfo: async (data: MemberUpdateRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedUser = await memberService.updateProfile(data);
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update basic info',
        isLoading: false
      });
      throw error;
    }
  },

  // 기술 스택 수정
  updateTechStack: async (techStacks: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      // 기술 스택 이름으로 skillService에서 ID를 찾아서 memberService에 업데이트
      const { skillService } = await import('@/services');
      const allSkills = await skillService.getAll();
      const skillIds = techStacks.map(stackName => 
        allSkills.find(skill => skill.skillName === stackName)?.id
      ).filter((id): id is number => id !== undefined);
      
      await memberService.updateSkills(skillIds);
      const updatedUser = await memberService.getProfile();
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update tech stack',
        isLoading: false
      });
      throw error;
    }
  },

  // 주요 프로젝트 수정
  updateFeaturedProjects: async (projectIds: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      // memberService에는 featured projects 업데이트 기능이 없으므로 
      // 현재는 에러를 발생시키거나 다른 방식으로 처리 필요
      throw new Error('Featured projects update not implemented in memberService');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update featured projects',
        isLoading: false
      });
      throw error;
    }
  },

  // 프로필 이미지 수정
  updateProfileImage: async (imageUrl: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedUser = await memberService.updateProfile({ profileUrl: imageUrl });
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update profile image',
        isLoading: false
      });
      throw error;
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null })
}));
import { create } from 'zustand';
import { TechStack } from '@/types';
import { skillService, SkillResponse, SkillAddRequest, SkillUpdateRequest } from '@/services';

interface TechStackState {
  // 상태
  techStacks: TechStack[];
  currentTechStack: TechStack | null;
  categories: string[];
  isLoading: boolean;
  error: string | null;
  
  // 필터링 및 검색
  searchQuery: string;
  selectedCategory: string;
  
  // 통계
  stats: {
    totalTechStacks: number;
    totalCategories: number;
    techStacksWithIcons: number;
    categoryStats: Array<{ category: string; count: number }>;
  } | null;
  
  // 액션
  fetchTechStacks: () => Promise<void>;
  fetchTechStackById: (id: number) => Promise<void>;
  createTechStack: (data: SkillAddRequest, file: File) => Promise<TechStack>;
  updateTechStack: (id: number, data: SkillUpdateRequest, file?: File) => Promise<TechStack>;
  deleteTechStack: (id: number) => Promise<void>;
  searchTechStacks: (query: string, category?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTechStacksByCategory: (category: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  uploadIcon: (file: File) => Promise<string>;
  
  // UI 상태 관리
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  clearError: () => void;
  clearCurrentTechStack: () => void;
}

export const useTechStackStore = create<TechStackState>((set, get) => ({
  // 초기 상태
  techStacks: [],
  currentTechStack: null,
  categories: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: '',
  stats: null,

  // 모든 기술 스택 조회
  fetchTechStacks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const skillsResponse = await skillService.getAllSkills();
      const techStacks = skillsResponse.skills.map((skill: SkillResponse) => ({
        id: skill.id.toString(),
        name: skill.skillName,
        category: skill.category,
        iconUrl: skill.uploadUrl,
        createdAt: skill.createdAt
      }));
      set({ techStacks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tech stacks',
        isLoading: false
      });
    }
  },

  // 특정 기술 스택 조회
  fetchTechStackById: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const techStacks = get().techStacks;
      let techStack = techStacks.find(t => t.id === id.toString());
      
      if (!techStack) {
        // skillService에는 개별 조회 API가 없으므로 전체 조회 후 필터링
        const skillsResponse = await skillService.getAllSkills();
        const skill = skillsResponse.skills.find(s => s.id === id);
        if (skill) {
          techStack = {
            id: skill.id.toString(),
            name: skill.skillName,
            category: skill.category,
            iconUrl: skill.uploadUrl,
            createdAt: skill.createdAt
          };
        }
      }
      
      if (techStack) {
        set({ currentTechStack: techStack, isLoading: false });
      } else {
        set({
          error: 'Tech stack not found',
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tech stack',
        isLoading: false
      });
    }
  },

  // 기술 스택 생성
  createTechStack: async (data: SkillAddRequest, file: File) => {
    set({ isLoading: true, error: null });
    
    try {
      const skillResponse = await skillService.addSkill(data, file);
      const newTechStack = {
        id: skillResponse.id.toString(),
        name: skillResponse.skillName,
        category: skillResponse.category,
        iconUrl: skillResponse.uploadUrl,
        createdAt: skillResponse.createdAt
      };
      const techStacks = get().techStacks;
      set({
        techStacks: [...techStacks, newTechStack],
        isLoading: false
      });
      
      // 카테고리 목록 갱신
      if (data.category && !get().categories.includes(data.category)) {
        set({ categories: [...get().categories, data.category] });
      }
      
      return newTechStack;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create tech stack',
        isLoading: false
      });
      throw error;
    }
  },

  // 기술 스택 수정
  updateTechStack: async (id: number, data: SkillUpdateRequest, file?: File) => {
    set({ isLoading: true, error: null });
    
    try {
      const skillResponse = await skillService.updateSkill(id, data, file);
      const updatedTechStack = {
        id: skillResponse.id.toString(),
        name: skillResponse.skillName,
        category: skillResponse.category,
        iconUrl: skillResponse.uploadUrl,
        createdAt: skillResponse.createdAt
      };
      const techStacks = get().techStacks;
      const updatedTechStacks = techStacks.map(t => t.id === id.toString() ? updatedTechStack : t);
      
      set({
        techStacks: updatedTechStacks,
        currentTechStack: updatedTechStack,
        isLoading: false
      });
      
      // 카테고리 목록 갱신
      if (data.category && !get().categories.includes(data.category)) {
        set({ categories: [...get().categories, data.category] });
      }
      
      return updatedTechStack;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update tech stack',
        isLoading: false
      });
      throw error;
    }
  },

  // 기술 스택 삭제
  deleteTechStack: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await skillService.deleteSkill(id);
      const techStacks = get().techStacks;
      const filteredTechStacks = techStacks.filter(t => t.id !== id.toString());
      
      set({
        techStacks: filteredTechStacks,
        currentTechStack: get().currentTechStack?.id === id.toString() ? null : get().currentTechStack,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete tech stack',
        isLoading: false
      });
      throw error;
    }
  },

  // 기술 스택 검색
  searchTechStacks: async (query: string, category?: string) => {
    set({ isLoading: true, error: null, searchQuery: query });
    
    if (category !== undefined) {
      set({ selectedCategory: category });
    }
    
    try {
      const skillsResponse = await skillService.searchSkills(query);
      let techStacks = skillsResponse.skills.map((skill: SkillResponse) => ({
        id: skill.id.toString(),
        name: skill.skillName,
        category: skill.category,
        iconUrl: skill.uploadUrl,
        createdAt: skill.createdAt
      }));
      
      // 카테고리 필터링 (필요시)
      if (category) {
        techStacks = techStacks.filter(t => t.category === category);
      }
      
      set({ techStacks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to search tech stacks',
        isLoading: false
      });
    }
  },

  // 카테고리 목록 조회
  fetchCategories: async () => {
    try {
      const categoriesResponse = await skillService.getCategories();
      set({ categories: categoriesResponse.categories });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      });
    }
  },

  // 카테고리별 기술 스택 조회
  fetchTechStacksByCategory: async (category: string) => {
    set({ isLoading: true, error: null, selectedCategory: category });
    
    try {
      const skillsResponse = await skillService.getSkillsByCategory(category);
      const techStacks = skillsResponse.skills.map((skill: SkillResponse) => ({
        id: skill.id.toString(),
        name: skill.skillName,
        category: skill.category,
        iconUrl: skill.uploadUrl,
        createdAt: skill.createdAt
      }));
      set({ techStacks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tech stacks by category',
        isLoading: false
      });
    }
  },

  // 통계 데이터 조회
  fetchStats: async () => {
    try {
      // skillService에는 통계 API가 없으므로 전체 데이터로부터 계산
      const skillsResponse = await skillService.getAllSkills();
      const skills = skillsResponse.skills;
      
      const categoryStats = skills.reduce((acc, skill) => {
        const existing = acc.find(item => item.category === skill.category);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ category: skill.category, count: 1 });
        }
        return acc;
      }, [] as Array<{ category: string; count: number }>);
      
      const stats = {
        totalTechStacks: skills.length,
        totalCategories: categoryStats.length,
        techStacksWithIcons: skills.filter(s => s.uploadUrl).length,
        categoryStats
      };
      
      set({ stats });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats'
      });
    }
  },

  // 아이콘 이미지 업로드
  uploadIcon: async (file: File) => {
    set({ isLoading: true, error: null });
    
    try {
      // skillService에는 별도의 아이콘 업로드 API가 없으므로 스킬 생성 시 함께 업로드
      // 이 메서드는 전용 아이콘 업로드용이므로 URL만 반환
      throw new Error('Icon upload should be done through createTechStack or updateTechStack methods');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload icon',
        isLoading: false
      });
      throw error;
    }
  },

  // UI 상태 관리
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  clearError: () => set({ error: null }),
  clearCurrentTechStack: () => set({ currentTechStack: null })
}));
import { useCallback, useEffect } from 'react';
import { useTechStackStore } from '@/stores';
import { CreateTechStackData, UpdateTechStackData } from '@/services';

export const useTechStack = () => {
  const {
    techStacks,
    currentTechStack,
    categories,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    stats,
    fetchTechStacks,
    fetchTechStackById,
    createTechStack,
    updateTechStack,
    deleteTechStack,
    searchTechStacks,
    fetchCategories,
    fetchTechStacksByCategory,
    fetchStats,
    uploadIcon,
    setSearchQuery,
    setSelectedCategory,
    clearError,
    clearCurrentTechStack
  } = useTechStackStore();

  // 기술 스택 목록 조회
  const loadTechStacks = useCallback(async () => {
    try {
      await fetchTechStacks();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchTechStacks]);

  // 특정 기술 스택 조회
  const loadTechStackById = useCallback(async (id: string) => {
    try {
      await fetchTechStackById(id);
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchTechStackById]);

  // 기술 스택 생성
  const handleCreateTechStack = useCallback(async (data: CreateTechStackData) => {
    try {
      const newTechStack = await createTechStack(data);
      return newTechStack;
    } catch (error) {
      throw error;
    }
  }, [createTechStack]);

  // 기술 스택 수정
  const handleUpdateTechStack = useCallback(async (id: string, data: UpdateTechStackData) => {
    try {
      const updatedTechStack = await updateTechStack(id, data);
      return updatedTechStack;
    } catch (error) {
      throw error;
    }
  }, [updateTechStack]);

  // 기술 스택 삭제
  const handleDeleteTechStack = useCallback(async (id: string) => {
    try {
      await deleteTechStack(id);
      return true;
    } catch (error) {
      return false;
    }
  }, [deleteTechStack]);

  // 기술 스택 검색
  const handleSearchTechStacks = useCallback(async (query: string, category?: string) => {
    try {
      await searchTechStacks(query, category);
      return true;
    } catch (error) {
      return false;
    }
  }, [searchTechStacks]);

  // 카테고리 목록 조회
  const loadCategories = useCallback(async () => {
    try {
      await fetchCategories();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchCategories]);

  // 카테고리별 기술 스택 조회
  const loadTechStacksByCategory = useCallback(async (category: string) => {
    try {
      await fetchTechStacksByCategory(category);
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchTechStacksByCategory]);

  // 통계 조회
  const loadStats = useCallback(async () => {
    try {
      await fetchStats();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchStats]);

  // 아이콘 업로드
  const handleUploadIcon = useCallback(async (file: File) => {
    try {
      const imageUrl = await uploadIcon(file);
      return imageUrl;
    } catch (error) {
      throw error;
    }
  }, [uploadIcon]);

  return {
    // 상태
    techStacks,
    currentTechStack,
    categories,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    stats,
    
    // 액션
    loadTechStacks,
    loadTechStackById,
    createTechStack: handleCreateTechStack,
    updateTechStack: handleUpdateTechStack,
    deleteTechStack: handleDeleteTechStack,
    searchTechStacks: handleSearchTechStacks,
    loadCategories,
    loadTechStacksByCategory,
    loadStats,
    uploadIcon: handleUploadIcon,
    
    // UI 상태 관리
    setSearchQuery,
    setSelectedCategory,
    clearError,
    clearCurrentTechStack
  };
};

// 기술 스택과 카테고리를 자동으로 로드하는 훅
export const useTechStackWithAutoLoad = () => {
  const techStackHooks = useTechStack();
  
  useEffect(() => {
    techStackHooks.loadTechStacks();
    techStackHooks.loadCategories();
  }, []);
  
  return techStackHooks;
};
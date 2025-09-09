import { useCallback, useEffect } from 'react';
import { useProjectStore } from '@/stores';
import { CreateProjectData, UpdateProjectData } from '@/services';

export const useProjects = () => {
  const {
    projects,
    currentProject,
    isLoading,
    error,
    searchQuery,
    selectedTechStacks,
    stats,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    searchProjects,
    fetchOngoingProjects,
    fetchCompletedProjects,
    fetchStats,
    setSearchQuery,
    setSelectedTechStacks,
    clearError,
    clearCurrentProject
  } = useProjectStore();

  // 프로젝트 목록 조회
  const loadProjects = useCallback(async () => {
    try {
      await fetchProjects();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchProjects]);

  // 특정 프로젝트 조회
  const loadProjectById = useCallback(async (id: string) => {
    try {
      await fetchProjectById(id);
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchProjectById]);

  // 프로젝트 생성
  const handleCreateProject = useCallback(async (data: CreateProjectData) => {
    try {
      const newProject = await createProject(data);
      return newProject;
    } catch (error) {
      throw error;
    }
  }, [createProject]);

  // 프로젝트 수정
  const handleUpdateProject = useCallback(async (id: string, data: UpdateProjectData) => {
    try {
      const updatedProject = await updateProject(id, data);
      return updatedProject;
    } catch (error) {
      throw error;
    }
  }, [updateProject]);

  // 프로젝트 삭제
  const handleDeleteProject = useCallback(async (id: string) => {
    try {
      await deleteProject(id);
      return true;
    } catch (error) {
      return false;
    }
  }, [deleteProject]);

  // 프로젝트 검색
  const handleSearchProjects = useCallback(async (query: string, techStacks?: string[]) => {
    try {
      await searchProjects(query, techStacks);
      return true;
    } catch (error) {
      return false;
    }
  }, [searchProjects]);

  // 진행중인 프로젝트 조회
  const loadOngoingProjects = useCallback(async () => {
    try {
      await fetchOngoingProjects();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchOngoingProjects]);

  // 완료된 프로젝트 조회
  const loadCompletedProjects = useCallback(async () => {
    try {
      await fetchCompletedProjects();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchCompletedProjects]);

  // 통계 조회
  const loadStats = useCallback(async () => {
    try {
      await fetchStats();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchStats]);

  return {
    // 상태
    projects,
    currentProject,
    isLoading,
    error,
    searchQuery,
    selectedTechStacks,
    stats,
    
    // 액션
    loadProjects,
    loadProjectById,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    searchProjects: handleSearchProjects,
    loadOngoingProjects,
    loadCompletedProjects,
    loadStats,
    
    // UI 상태 관리
    setSearchQuery,
    setSelectedTechStacks,
    clearError,
    clearCurrentProject
  };
};

// 프로젝트 목록을 자동으로 로드하는 훅
export const useProjectsWithAutoLoad = () => {
  const projectHooks = useProjects();
  
  useEffect(() => {
    projectHooks.loadProjects();
  }, []);
  
  return projectHooks;
};
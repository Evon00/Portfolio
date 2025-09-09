import { create } from 'zustand';
import { Project } from '@/types';
import { projectService, CreateProjectData, UpdateProjectData } from '@/services';

interface ProjectState {
  // 상태
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // 필터링 및 검색
  searchQuery: string;
  selectedTechStacks: string[];
  
  // 통계
  stats: {
    totalProjects: number;
    ongoingProjects: number;
    completedProjects: number;
    topTechStacks: Array<{ tech: string; count: number }>;
  } | null;
  
  // 액션
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  searchProjects: (query: string, techStacks?: string[]) => Promise<void>;
  fetchOngoingProjects: () => Promise<void>;
  fetchCompletedProjects: () => Promise<void>;
  fetchStats: () => Promise<void>;
  
  // UI 상태 관리
  setSearchQuery: (query: string) => void;
  setSelectedTechStacks: (techStacks: string[]) => void;
  clearError: () => void;
  clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // 초기 상태
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedTechStacks: [],
  stats: null,

  // 모든 프로젝트 조회
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const projects = await projectService.getAll();
      set({ projects, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false
      });
    }
  },

  // 특정 프로젝트 조회
  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const projects = get().projects;
      let project = projects.find(p => p.id === id);
      
      if (!project) {
        project = await projectService.getById(id);
      }
      
      if (project) {
        set({ currentProject: project, isLoading: false });
      } else {
        set({
          error: 'Project not found',
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch project',
        isLoading: false
      });
    }
  },

  // 프로젝트 생성
  createProject: async (data: CreateProjectData) => {
    set({ isLoading: true, error: null });
    
    try {
      const newProject = await projectService.create(data);
      const projects = get().projects;
      set({
        projects: [newProject, ...projects],
        isLoading: false
      });
      return newProject;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false
      });
      throw error;
    }
  },

  // 프로젝트 수정
  updateProject: async (id: string, data: UpdateProjectData) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedProject = await projectService.update(id, data);
      const projects = get().projects;
      const updatedProjects = projects.map(p => p.id === id ? updatedProject : p);
      
      set({
        projects: updatedProjects,
        currentProject: updatedProject,
        isLoading: false
      });
      return updatedProject;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update project',
        isLoading: false
      });
      throw error;
    }
  },

  // 프로젝트 삭제
  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await projectService.delete(id);
      const projects = get().projects;
      const filteredProjects = projects.filter(p => p.id !== id);
      
      set({
        projects: filteredProjects,
        currentProject: get().currentProject?.id === id ? null : get().currentProject,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false
      });
      throw error;
    }
  },

  // 프로젝트 검색
  searchProjects: async (query: string, techStacks?: string[]) => {
    set({ isLoading: true, error: null, searchQuery: query });
    
    if (techStacks) {
      set({ selectedTechStacks: techStacks });
    }
    
    try {
      const projects = await projectService.search(query, techStacks);
      set({ projects, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to search projects',
        isLoading: false
      });
    }
  },

  // 진행중인 프로젝트 조회
  fetchOngoingProjects: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const projects = await projectService.getOngoing();
      set({ projects, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch ongoing projects',
        isLoading: false
      });
    }
  },

  // 완료된 프로젝트 조회
  fetchCompletedProjects: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const projects = await projectService.getCompleted();
      set({ projects, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch completed projects',
        isLoading: false
      });
    }
  },

  // 통계 데이터 조회
  fetchStats: async () => {
    try {
      const stats = await projectService.getStats();
      set({ stats });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats'
      });
    }
  },

  // UI 상태 관리
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedTechStacks: (techStacks: string[]) => set({ selectedTechStacks: techStacks }),
  clearError: () => set({ error: null }),
  clearCurrentProject: () => set({ currentProject: null })
}));
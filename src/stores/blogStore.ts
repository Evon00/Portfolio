import { create } from 'zustand';
import { BlogPost } from '@/types';
import { blogService, CreateBlogPostData, UpdateBlogPostData } from '@/services';

interface BlogState {
  // 상태
  blogs: BlogPost[];
  currentBlog: BlogPost | null;
  isLoading: boolean;
  error: string | null;
  
  // 필터링 및 검색
  searchQuery: string;
  selectedTechStacks: string[];
  
  // 통계
  stats: {
    totalPosts: number;
    totalViews: number;
    avgViewsPerPost: number;
    topTechStacks: Array<{ tech: string; count: number }>;
  } | null;
  
  // 액션
  fetchBlogs: () => Promise<void>;
  fetchBlogById: (id: string) => Promise<void>;
  createBlog: (data: CreateBlogPostData) => Promise<BlogPost>;
  updateBlog: (id: string, data: UpdateBlogPostData) => Promise<BlogPost>;
  deleteBlog: (id: string) => Promise<void>;
  searchBlogs: (query: string, techStacks?: string[]) => Promise<void>;
  fetchStats: () => Promise<void>;
  
  // UI 상태 관리
  setSearchQuery: (query: string) => void;
  setSelectedTechStacks: (techStacks: string[]) => void;
  clearError: () => void;
  clearCurrentBlog: () => void;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  // 초기 상태
  blogs: [],
  currentBlog: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedTechStacks: [],
  stats: null,

  // 모든 블로그 포스트 조회
  fetchBlogs: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const blogs = await blogService.getAll();
      set({ blogs, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch blogs',
        isLoading: false
      });
    }
  },

  // 특정 블로그 포스트 조회
  fetchBlogById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const blogs = get().blogs;
      let blog = blogs.find(b => b.id === id);
      
      if (!blog) {
        blog = await blogService.getById(id);
      }
      
      if (blog) {
        set({ currentBlog: blog, isLoading: false });
        // 조회수 증가
        blogService.incrementViewCount(id);
      } else {
        set({
          error: 'Blog post not found',
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch blog',
        isLoading: false
      });
    }
  },

  // 블로그 포스트 생성
  createBlog: async (data: CreateBlogPostData) => {
    set({ isLoading: true, error: null });
    
    try {
      const newBlog = await blogService.create(data);
      const blogs = get().blogs;
      set({
        blogs: [newBlog, ...blogs],
        isLoading: false
      });
      return newBlog;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create blog',
        isLoading: false
      });
      throw error;
    }
  },

  // 블로그 포스트 수정
  updateBlog: async (id: string, data: UpdateBlogPostData) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedBlog = await blogService.update(id, data);
      const blogs = get().blogs;
      const updatedBlogs = blogs.map(b => b.id === id ? updatedBlog : b);
      
      set({
        blogs: updatedBlogs,
        currentBlog: updatedBlog,
        isLoading: false
      });
      return updatedBlog;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update blog',
        isLoading: false
      });
      throw error;
    }
  },

  // 블로그 포스트 삭제
  deleteBlog: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await blogService.delete(id);
      const blogs = get().blogs;
      const filteredBlogs = blogs.filter(b => b.id !== id);
      
      set({
        blogs: filteredBlogs,
        currentBlog: get().currentBlog?.id === id ? null : get().currentBlog,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete blog',
        isLoading: false
      });
      throw error;
    }
  },

  // 블로그 검색
  searchBlogs: async (query: string, techStacks?: string[]) => {
    set({ isLoading: true, error: null, searchQuery: query });
    
    if (techStacks) {
      set({ selectedTechStacks: techStacks });
    }
    
    try {
      const blogs = await blogService.search(query, techStacks);
      set({ blogs, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to search blogs',
        isLoading: false
      });
    }
  },

  // 통계 데이터 조회
  fetchStats: async () => {
    try {
      const stats = await blogService.getStats();
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
  clearCurrentBlog: () => set({ currentBlog: null })
}));
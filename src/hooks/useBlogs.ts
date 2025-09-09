import { useCallback, useEffect } from 'react';
import { useBlogStore } from '@/stores';
import { CreateBlogPostData, UpdateBlogPostData } from '@/services';

export const useBlogs = () => {
  const {
    blogs,
    currentBlog,
    isLoading,
    error,
    searchQuery,
    selectedTechStacks,
    stats,
    fetchBlogs,
    fetchBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    searchBlogs,
    fetchStats,
    setSearchQuery,
    setSelectedTechStacks,
    clearError,
    clearCurrentBlog
  } = useBlogStore();

  // 블로그 목록 조회
  const loadBlogs = useCallback(async () => {
    try {
      await fetchBlogs();
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchBlogs]);

  // 특정 블로그 조회
  const loadBlogById = useCallback(async (id: string) => {
    try {
      await fetchBlogById(id);
      return true;
    } catch (error) {
      return false;
    }
  }, [fetchBlogById]);

  // 블로그 생성
  const handleCreateBlog = useCallback(async (data: CreateBlogPostData) => {
    try {
      const newBlog = await createBlog(data);
      return newBlog;
    } catch (error) {
      throw error;
    }
  }, [createBlog]);

  // 블로그 수정
  const handleUpdateBlog = useCallback(async (id: string, data: UpdateBlogPostData) => {
    try {
      const updatedBlog = await updateBlog(id, data);
      return updatedBlog;
    } catch (error) {
      throw error;
    }
  }, [updateBlog]);

  // 블로그 삭제
  const handleDeleteBlog = useCallback(async (id: string) => {
    try {
      await deleteBlog(id);
      return true;
    } catch (error) {
      return false;
    }
  }, [deleteBlog]);

  // 블로그 검색
  const handleSearchBlogs = useCallback(async (query: string, techStacks?: string[]) => {
    try {
      await searchBlogs(query, techStacks);
      return true;
    } catch (error) {
      return false;
    }
  }, [searchBlogs]);

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
    blogs,
    currentBlog,
    isLoading,
    error,
    searchQuery,
    selectedTechStacks,
    stats,
    
    // 액션
    loadBlogs,
    loadBlogById,
    createBlog: handleCreateBlog,
    updateBlog: handleUpdateBlog,
    deleteBlog: handleDeleteBlog,
    searchBlogs: handleSearchBlogs,
    loadStats,
    
    // UI 상태 관리
    setSearchQuery,
    setSelectedTechStacks,
    clearError,
    clearCurrentBlog
  };
};

// 블로그 목록을 자동으로 로드하는 훅
export const useBlogsWithAutoLoad = () => {
  const blogHooks = useBlogs();
  
  useEffect(() => {
    blogHooks.loadBlogs();
  }, []);
  
  return blogHooks;
};
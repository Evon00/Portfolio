'use client';

import { useState, useEffect } from 'react';
import { BlogPost } from '@/types';
import AdminLayout from '@/components/admin/AdminLayout';
import { blogService } from '@/services/blogService';
import Link from 'next/link';

const POSTS_PER_PAGE = 10;

export default function BlogManagePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]); // 필터링을 위해 전체 데이터 보관
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API를 통해 게시글 로드
  const loadPosts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      
      // API 정렬 매핑
      let apiSortBy = 'createdAt';
      let apiSortDir = 'desc';
      
      switch (sortBy) {
        case 'newest':
          apiSortBy = 'createdAt';
          apiSortDir = 'desc';
          break;
        case 'oldest':
          apiSortBy = 'createdAt';
          apiSortDir = 'asc';
          break;
        case 'views':
          apiSortBy = 'view';
          apiSortDir = 'desc';
          break;
      }

      const response = await blogService.getBlogPosts(
        page - 1, // API는 0부터 시작
        POSTS_PER_PAGE,
        apiSortBy,
        apiSortDir,
        selectedTechStack || undefined
      );

      setPosts(response.posts);
      setAllPosts(response.posts); // 필터링을 위해 보관
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      setError(err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 정렬/필터 변경 시 리로드
  useEffect(() => {
    loadPosts(1);
    setCurrentPage(1);
  }, [sortBy, selectedTechStack]);

  // 페이지 변경 시 리로드
  useEffect(() => {
    if (currentPage > 1) {
      loadPosts(currentPage);
    }
  }, [currentPage]);

  // 기술 스택 목록 추출 (로드된 데이터로부터)
  const allTechStacks = Array.from(
    new Set(allPosts.flatMap(post => post.techStack))
  ).sort();

  // 서버 측에서 이미 정렬되어 오므로 검색만 클라이언트에서 처리
  const currentPosts = searchTerm
    ? posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : posts;

  // 페이지 변경 시 스크롤 맨 위로
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터 변경 시 첫 페이지로 리셋
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // 게시글 삭제
  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await blogService.deleteBlogPost(id);
        // 삭제 성공 시 리로드
        loadPosts();
      } catch (err) {
        console.error('게시글 삭제 실패:', err);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <AdminLayout title="블로그 관리">
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="linear-title-2">블로그 게시글 관리</h1>
          <Link
            href="/admin/dashboard/blog/new"
            className="linear-button-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 게시글 작성
          </Link>
        </div>

        {/* 필터 및 검색 */}
        <div className="linear-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 검색 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                <svg className="h-5 w-5" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="제목이나 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                }}
                className="linear-input w-full"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* 기술 스택 필터 */}
            <select
              value={selectedTechStack}
              onChange={(e) => {
                setSelectedTechStack(e.target.value);
                handleFilterChange();
              }}
              className="linear-input"
            >
              <option value="">모든 기술 스택</option>
              {allTechStacks.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'views')}
              className="linear-input"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="views">조회수순</option>
            </select>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="linear-card p-12 text-center">
            <div className="animate-spin w-8 h-8 mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="linear-text-regular">게시글을 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="linear-card p-12 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="linear-text-regular text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => loadPosts()} 
              className="linear-button-primary"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 게시글 목록 */}
        {!loading && !error && (
          <div className="space-y-4">
            {currentPosts.length > 0 ? (
            currentPosts.map((post) => (
              <div key={post.id} className="linear-card">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="linear-title-5 mb-2">
                        {post.title}
                      </h3>
                      <p className="linear-text-regular mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {post.summary}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/admin/dashboard/blog/edit/${post.slug}`}
                        className="p-2 rounded-lg transition-colors hover:scale-110"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 rounded-lg transition-colors hover:scale-110"
                        style={{ backgroundColor: '#2a1b1b', color: '#ff6b6b' }}
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 메타 정보 */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className="linear-tag">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="linear-tag">
                      조회수 {post.viewCount.toLocaleString()}
                    </span>
                    <span className="linear-tag">
                      {post.readTime}분 읽기
                    </span>
                  </div>

                  {/* 기술 스택 */}
                  <div className="flex flex-wrap gap-2">
                    {post.techStack.map((tech) => (
                      <span key={tech} className="linear-tag text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="linear-card p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">📝</div>
              <p className="linear-text-large" style={{ color: 'var(--color-text-secondary)' }}>
                {searchTerm ? '검색 조건에 맞는 게시글이 없습니다.' : '등록된 게시글이 없습니다.'}
              </p>
            </div>
          )}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="linear-card flex items-center space-x-2 p-4">
              {/* 이전 페이지 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="linear-button-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>

              {/* 페이지 번호 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'linear-button-primary'
                      : 'linear-button-secondary'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* 다음 페이지 */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="linear-button-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
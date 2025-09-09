'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { blogService, type BlogPost } from '@/services/blogService';

const POSTS_PER_PAGE = 10;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  // 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // API에서 게시글 로드
        const response = await blogService.getBlogPosts(currentPage - 1, POSTS_PER_PAGE);
        setPosts(response.posts);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('블로그 게시글 로드 실패:', err);
        setError(err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage]);

  // 모든 기술 스택 추출 (실제 데이터 기반)
  const allTechStacks = useMemo(() => {
    const techStacks = posts.flatMap(post => post.techStack);
    return Array.from(new Set(techStacks)).sort();
  }, [posts]);

  // 필터링된 게시글 (클라이언트 사이드 필터링)
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTechStack = !selectedTechStack || post.techStack.includes(selectedTechStack);
      return matchesSearch && matchesTechStack;
    });
  }, [posts, searchTerm, selectedTechStack]);

  // 페이지 변경 시 스크롤 맨 위로
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터 변경 시 첫 페이지로 리셋
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="linear-text-regular">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="linear-text-regular text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="linear-button-primary"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="text-center mb-16 linear-fade-in">
          <h1 className="linear-title-1 mb-6 linear-gradient-accent">
            블로그
          </h1>
          <p className="linear-text-large max-w-2xl mx-auto">
            개발하면서 배운 내용과 경험을 공유합니다
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="linear-card p-8 mb-10 linear-slide-up">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-text-tertiary)' }}>
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
            </div>

            {/* 기술 스택 필터 */}
            <div className="lg:w-56">
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
            </div>

            {/* 정렬 */}
            <div className="lg:w-40">
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
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block"
              >
                <article className="linear-card group cursor-pointer h-full">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="linear-title-4 group-hover:text-blue-400 transition-colors leading-tight block mb-3">
                        {post.title}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
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
                  </div>

                  <p className="linear-text-regular mb-6 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="linear-tag text-xs hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedTechStack(tech);
                          handleFilterChange();
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="linear-text-small group-hover:text-blue-400 transition-colors">
                      자세히 읽기
                    </span>
                    <svg className="w-4 h-4 group-hover:text-blue-400 transition-colors group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="linear-card p-12 text-center">
                <div className="text-6xl mb-4 opacity-50">🔍</div>
                <p className="linear-text-large" style={{ color: 'var(--color-text-secondary)' }}>
                  검색 결과가 없습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-16">
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
    </div>
  );
}
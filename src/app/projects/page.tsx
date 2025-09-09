'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';
import ImageSlider from '@/components/projects/ImageSlider';

const PROJECTS_PER_PAGE = 6;

export default function ProjectsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTechStack, setSelectedTechStack] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  // 데이터 로드
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // API에서 프로젝트 로드
        const response = await projectService.getProjects(currentPage - 1, PROJECTS_PER_PAGE);
        setProjects(response.projects);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('프로젝트 로드 실패:', err);
        setError(err instanceof Error ? err.message : '프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [currentPage]);

  // 모든 기술 스택 추출 (실제 데이터 기반)
  const allTechStacks = useMemo(() => {
    const techStacks = projects.flatMap(project => project.techStack);
    return Array.from(new Set(techStacks)).sort();
  }, [projects]);

  // 필터링된 프로젝트 (클라이언트 사이드 필터링)
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesTechStack = !selectedTechStack || project.techStack.includes(selectedTechStack);
      return matchesTechStack;
    });
  }, [projects, selectedTechStack]);

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
          <p className="linear-text-regular">프로젝트를 불러오는 중...</p>
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
        <div className="text-center mb-16">
          <h1 className="linear-title-1 mb-6">
            프로젝트
          </h1>
          <p className="linear-text-large max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            지금까지 진행한 다양한 프로젝트들을 소개합니다
          </p>
        </div>

        {/* 필터 및 정렬 */}
        <div className="linear-card p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 기술 스택 필터 */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <svg className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <select
                  value={selectedTechStack}
                  onChange={(e) => {
                    setSelectedTechStack(e.target.value);
                    handleFilterChange();
                  }}
                  className="linear-input w-full"
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="">모든 기술 스택</option>
                  {allTechStacks.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 정렬 */}
            <div className="lg:w-40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="linear-input"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 프로젝트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="block group linear-card overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              {/* 프로젝트 이미지 슬라이더 */}
              <div 
                className="h-52 overflow-hidden relative" 
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
              >
                <div className="absolute inset-0 opacity-20" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                <ImageSlider 
                  images={project.images} 
                  className="h-full"
                />
              </div>

              {/* 프로젝트 정보 */}
              <div className="p-8">
                <h3 className="linear-text-large mb-3 group-hover:opacity-75 transition-opacity">
                  {project.title}
                </h3>
                <p className="linear-text-regular mb-6 line-clamp-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {project.summary}
                </p>

                {/* 기술 스택 태그 */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techStack.slice(0, 3).map((tech) => (
                    <span key={tech} className="linear-tag text-xs">
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="linear-tag text-xs">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>

                {/* 날짜 정보 */}
                <div className="mb-4">
                  <div className="linear-tag">
                    <span className="text-sm font-medium">
                      {new Date(project.startDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                      {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}` : ' - 진행 중'}
                    </span>
                  </div>
                </div>

                {/* 프로젝트 링크 버튼들 */}
                <div className="flex justify-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border-secondary)' }}>
                  {project.githubUrl && (
                    <button
                      type="button"
                      title="GitHub 저장소"
                      className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105" 
                      style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span className="text-sm font-medium">GitHub</span>
                    </button>
                  )}
                  {project.demoUrl && (
                    <button
                      type="button"
                      title="데모 사이트"
                      className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105" 
                      style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.open(project.demoUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-sm font-medium">데모</span>
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 결과가 없을 때 */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="linear-card p-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="linear-text-large" style={{ color: 'var(--color-text-secondary)' }}>해당 조건에 맞는 프로젝트가 없습니다.</p>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-16">
            <nav className="flex items-center space-x-3 linear-card p-4">
              {/* 이전 페이지 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="linear-button-secondary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>

              {/* 페이지 번호 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
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
                className="linear-button-secondary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
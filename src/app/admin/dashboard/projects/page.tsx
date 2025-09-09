'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { projectService } from '@/services/projectService';

const PROJECTS_PER_PAGE = 6;

export default function ProjectManagePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // 프로젝트 데이터 로드
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectService.getProjects(currentPage - 1, PROJECTS_PER_PAGE);
      setProjects(response.projects);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentPage]);

  // 기술 스택 목록 추출
  const allTechStacks = Array.from(
    new Set(projects.flatMap(project => project.techStack))
  ).sort();

  // 필터링 및 정렬 (클라이언트 사이드에서 추가 필터링)
  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTechStack = !selectedTechStack || project.techStack.includes(selectedTechStack);
      return matchesSearch && matchesTechStack;
    })
    .sort((a, b) => {
      const aDate = new Date(a.startDate).getTime();
      const bDate = new Date(b.startDate).getTime();
      return sortBy === 'newest' ? bDate - aDate : aDate - bDate;
    });

  const currentProjects = filteredAndSortedProjects;

  // 페이지 변경 시 스크롤 맨 위로
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터 변경 시 첫 페이지로 리셋
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await projectService.deleteProject(id);
        // 삭제 후 현재 페이지 다시 로드
        await loadProjects();
        alert('프로젝트가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('프로젝트 삭제 실패:', error);
        alert('프로젝트 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <AdminLayout title="프로젝트 관리">
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="linear-title-2">프로젝트 관리</h1>
          <Link
            href="/admin/dashboard/projects/new"
            className="linear-button-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 프로젝트 추가
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
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="linear-input"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 linear-text-regular">프로젝트를 불러오는 중...</span>
          </div>
        ) : (
          <>
            {/* 프로젝트 목록 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <div key={project.id} className="linear-card">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="linear-title-5 mb-2">
                            {project.title}
                          </h3>
                          <p className="linear-text-regular mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {project.summary}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link
                            href={`/admin/dashboard/projects/edit/${project.slug}`}
                            className="p-2 rounded-lg transition-colors hover:scale-110"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
                            title="수정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id)}
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

                      {/* 프로젝트 기간 */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className="linear-tag">
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
                        <span className="linear-tag">
                          이미지 {project.images?.length || 0}개
                        </span>
                      </div>

                      {/* 기술 스택 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.slice(0, 4).map((tech) => (
                          <span key={tech} className="linear-tag text-xs">
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="linear-tag text-xs">
                            +{project.techStack.length - 4}
                          </span>
                        )}
                      </div>

                      {/* 링크 */}
                      <div className="flex gap-3">
                        {project.githubUrl && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="linear-text-mini">GitHub</span>
                          </div>
                        )}
                        {project.demoUrl && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="linear-text-mini">데모</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="linear-card p-12 text-center">
                    <div className="text-6xl mb-4 opacity-50">🚀</div>
                    <p className="linear-text-large" style={{ color: 'var(--color-text-secondary)' }}>
                      {searchTerm || selectedTechStack ? '검색 조건에 맞는 프로젝트가 없습니다.' : '등록된 프로젝트가 없습니다.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
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
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const startPage = Math.max(1, currentPage - 5);
                const page = startPage + i;
                if (page > totalPages) return null;
                return (
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
                );
              })}

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
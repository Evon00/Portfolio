'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';
import ImageSlider from '@/components/projects/ImageSlider';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // params가 Promise이므로 resolve
        const resolvedParams = await params;
        
        // API에서 프로젝트 조회
        const foundProject = await projectService.getBySlug(resolvedParams.slug);
        
        if (!foundProject) {
          notFound();
          return;
        }

        setProject(foundProject);

        // 관련 프로젝트 조회
        try {
          const allProjects = await projectService.getAll();
          const related = allProjects
            .filter(p => p.id !== foundProject.id && p.techStack.some(tech => foundProject.techStack.includes(tech)))
            .slice(0, 3);
          setRelatedProjects(related);
        } catch (relatedErr) {
          console.warn('관련 프로젝트 로드 실패:', relatedErr);
        }

      } catch (err) {
        console.error('프로젝트 로드 실패:', err);
        setError(err instanceof Error ? err.message : '프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [params]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>프로젝트를 불러오는 중...</p>
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

  // 프로젝트가 없는 경우
  if (!project) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 네비게이션 */}
        <nav className="mb-8">
          <Link
            href="/projects"
            className="group linear-button-secondary flex items-center gap-2 w-fit"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            프로젝트 목록으로 돌아가기
          </Link>
        </nav>

        {/* 프로젝트 헤더 */}
        <header className="linear-card p-8 mb-8">
          <h1 className="linear-title-1 mb-6">
            {project.title}
          </h1>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-6 linear-text-small">
              <span className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {new Date(project.startDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })} {project.endDate && `~ ${new Date(project.endDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}`}
              </span>
              <span className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {project.endDate ? '완료됨' : '진행 중'}
              </span>
            </div>

            {/* 링크 버튼들 */}
            <div className="flex gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linear-button-secondary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linear-button-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  라이브 데모
                </a>
              )}
            </div>
          </div>

          {/* 기술 스택 태그 */}
          <div className="flex flex-wrap gap-3 mb-6">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="linear-tag"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* 요약 */}
          <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h2 className="linear-text-medium mb-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                <span className="text-white text-xs">📝</span>
              </div>
              프로젝트 개요
            </h2>
            <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>{project.summary}</p>
          </div>
        </header>

        {/* 이미지 슬라이더 */}
        <section className="linear-card p-8 mb-8">
          <h2 className="linear-title-3 mb-6">프로젝트 스크린샷</h2>
          {project.images && project.images.length > 0 ? (
            <ImageSlider images={project.images} />
          ) : (
            <div className="aspect-video rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-50">🖼️</div>
                <p className="linear-text-regular opacity-60">프로젝트 이미지가 준비 중입니다.</p>
              </div>
            </div>
          )}
        </section>

        {/* 프로젝트 상세 설명 */}
        <article className="linear-card p-8 mb-12">
          <h2 className="linear-title-3 mb-6">상세 설명</h2>
          {project.description ? (
            <MarkdownRenderer 
              content={project.description}
              className="leading-relaxed"
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 opacity-50">📝</div>
              <p className="linear-text-regular opacity-60">상세 설명이 준비 중입니다.</p>
            </div>
          )}
        </article>

        {/* 관련 프로젝트 */}
        {relatedProjects.length > 0 && (
          <section>
            <h2 className="linear-title-2 mb-8 text-center">
              관련 프로젝트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.id}
                  href={`/projects/${relatedProject.slug}`}
                  className="block group linear-card overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300"
                >
                  {/* 프로젝트 이미지 슬라이더 */}
                  <div 
                    className="h-40 overflow-hidden relative" 
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }}
                  >
                    <div className="absolute inset-0 opacity-20" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                    {relatedProject.images && relatedProject.images.length > 0 ? (
                      <ImageSlider 
                        images={relatedProject.images} 
                        className="h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-center">
                        <div>
                          <div className="text-3xl mb-2 opacity-60">🚀</div>
                          <p className="linear-text-small opacity-60">프로젝트</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 프로젝트 정보 */}
                  <div className="p-6">
                    <h3 className="linear-text-large mb-3 group-hover:opacity-75 transition-opacity">
                      {relatedProject.title}
                    </h3>
                    <p className="linear-text-regular mb-4 line-clamp-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {relatedProject.summary}
                    </p>

                    {/* 기술 스택 태그 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {relatedProject.techStack.slice(0, 3).map((tech) => (
                        <span key={tech} className="linear-tag text-xs">
                          {tech}
                        </span>
                      ))}
                      {relatedProject.techStack.length > 3 && (
                        <span className="linear-tag text-xs">
                          +{relatedProject.techStack.length - 3}
                        </span>
                      )}
                    </div>

                    {/* 날짜 정보 */}
                    <div className="mb-4">
                      <div className="linear-tag">
                        <span className="text-sm font-medium">
                          {new Date(relatedProject.startDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                          {relatedProject.endDate ? ` - ${new Date(relatedProject.endDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}` : ' - 진행 중'}
                        </span>
                      </div>
                    </div>

                    {/* 프로젝트 링크 버튼들 */}
                    <div className="flex justify-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border-secondary)' }}>
                      {relatedProject.githubUrl && (
                        <button
                          type="button"
                          title="GitHub 저장소"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-all duration-300 hover:scale-105" 
                          style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            window.open(relatedProject.githubUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                          </svg>
                          <span className="font-medium">GitHub</span>
                        </button>
                      )}
                      {relatedProject.demoUrl && (
                        <button
                          type="button"
                          title="데모 사이트"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-all duration-300 hover:scale-105" 
                          style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            window.open(relatedProject.demoUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="font-medium">데모</span>
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
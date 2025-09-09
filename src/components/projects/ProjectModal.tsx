'use client';

import { useEffect } from 'react';
import { Project } from '@/types';
import ImageSlider from './ImageSlider';
import MarkdownRenderer from '../common/MarkdownRenderer';

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="linear-modal-backdrop fixed inset-0 transition-all duration-300"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative linear-card max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-3 rounded-full transition-all duration-300 hover:scale-110" 
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
            aria-label="모달 닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 프로젝트 이미지 슬라이더 */}
          <div className="relative h-64 md:h-80 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-accent-primary)', opacity: 0.1 }}></div>
            <ImageSlider 
              images={project.images} 
              className="h-full"
            />
          </div>

          {/* 프로젝트 정보 */}
          <div className="p-10">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-8">
              <div className="flex-1">
                <h2 className="linear-title-2 linear-gradient-accent mb-6">
                  {project.title}
                </h2>
                <p className="linear-text-large mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {project.summary}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linear-button-secondary flex items-center justify-center gap-3 px-6 py-3 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linear-button-primary flex items-center justify-center gap-3 px-6 py-3 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    데모 보기
                  </a>
                )}
              </div>
            </div>

            {/* 프로젝트 기간 */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)', opacity: 0.1 }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="linear-tag font-semibold">
                {project.startDate}
                {project.endDate ? ` - ${project.endDate}` : ' - 진행 중'}
              </span>
            </div>

            {/* 기술 스택 */}
            <div className="mb-10">
              <h3 className="linear-text-large linear-gradient-accent mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                  <span className="text-white text-xs">⚡</span>
                </div>
                사용 기술
              </h3>
              <div className="flex flex-wrap gap-3">
                {project.techStack.map((tech) => (
                  <span key={tech} className="linear-tag hover:scale-105 transition-all duration-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* 상세 설명 */}
            <div className="p-8 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}>
              <h3 className="linear-text-large linear-gradient-accent mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                  <span className="text-white text-xs">📋</span>
                </div>
                프로젝트 상세 내용
              </h3>
              <MarkdownRenderer 
                content={project.description}
                className="leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
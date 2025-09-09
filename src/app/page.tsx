'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useHomeData } from '@/hooks/useHomeData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { HeroSection } from '@/components/sections/HeroSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { TechStackGrid } from '@/components/ui/TechStackGrid';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { BlogCard } from '@/components/ui/BlogCard';
import { 
  LAYOUT_CONSTANTS, 
  RESPONSIVE_CONSTANTS, 
  THEME_CONSTANTS,
  IMAGE_CONSTANTS,
  A11Y_CONSTANTS
} from '@/constants/ui';

/**
 * 홈페이지 컴포넌트
 * - 메인 섹션들을 조합하여 홈페이지 구성
 * - 커스텀 훅을 통한 상태 관리
 * - 접근성과 성능 최적화 적용
 */
export default function Home() {
  const { 
    userInfo, 
    adminSkills, 
    featuredProjects, 
    latestBlogPosts, 
    loading, 
    error, 
    refreshKey, 
    retry 
  } = useHomeData();

  // 메모이제이션으로 성능 최적화
  const sectionStyling = useMemo(() => ({
    backgroundColor: THEME_CONSTANTS.PRIMARY_BG
  }), []);

  const handleRetry = useCallback(() => {
    retry();
  }, [retry]);



  // 로딩 상태 - 접근성 개선
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={sectionStyling}
        role="status" 
        aria-live="polite"
      >
        <LoadingSpinner 
          size="lg" 
          message={A11Y_CONSTANTS.LOADING_LABEL}
          className="" 
        />
      </div>
    );
  }

  // 에러 상태 - 개선된 에러 처리
  if (error || !userInfo) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={sectionStyling}
      >
        <ErrorDisplay 
          error={error || '사용자 정보를 불러올 수 없습니다.'}
          onRetry={handleRetry}
          showRetryButton={true}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={sectionStyling}>
      <div className={`container mx-auto ${LAYOUT_CONSTANTS.CONTAINER_PADDING} ${LAYOUT_CONSTANTS.HERO_SPACING}`}>
        {/* Hero Section - 리팩토링된 컴포넌트 사용 */}
        <HeroSection userInfo={userInfo} />

        {/* Contact Info - 리팩토링된 컴포넌트 사용 */}
        <ContactSection userInfo={userInfo} />

        {/* Tech Stack Section - 리팩토링된 컴포넌트 사용 */}
        <section className={`${LAYOUT_CONSTANTS.SECTION_SPACING} linear-slide-up`}>
          <div className="max-w-6xl mx-auto">
            <h2 className="linear-title-2 text-center mb-16 linear-gradient-accent">
              기술 스택
            </h2>
            <TechStackGrid skills={adminSkills} />
          </div>
        </section>

        {/* Featured Projects Section - 리팩토링된 컴포넌트 사용 */}
        <section className={LAYOUT_CONSTANTS.SECTION_SPACING}>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-16">
              <h2 className="linear-title-2 linear-gradient-accent">
                주요 프로젝트
              </h2>
              <Link 
                href="/projects" 
                className="linear-text-regular font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
                style={{ color: THEME_CONSTANTS.ACCENT_PRIMARY }}
                aria-label="모든 프로젝트 페이지로 이동"
              >
                모든 프로젝트 보기
                <svg className={IMAGE_CONSTANTS.SMALL_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className={`grid ${RESPONSIVE_CONSTANTS.PROJECT_GRID} gap-10`}>
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        {/* Latest Blog Posts Section - 리팩토링된 컴포넌트 사용 */}
        <section>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-16">
              <h2 className="linear-title-2 linear-gradient-accent">
                최신 블로그 포스트
              </h2>
              <Link 
                href="/blog" 
                className="linear-text-regular font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
                style={{ color: THEME_CONSTANTS.ACCENT_PRIMARY }}
                aria-label="모든 블로그 포스트 페이지로 이동"
              >
                모든 포스트 보기
                <svg className={IMAGE_CONSTANTS.SMALL_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className={`grid ${RESPONSIVE_CONSTANTS.BLOG_GRID} gap-6`} key={`blog-posts-${refreshKey}`}>
              {latestBlogPosts.map((post, index) => (
                <BlogCard 
                  key={`blog-card-${post.id}-${refreshKey}`}
                  post={post} 
                  index={index} 
                  refreshKey={refreshKey} 
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

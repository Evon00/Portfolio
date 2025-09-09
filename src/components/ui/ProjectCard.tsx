import { memo, useCallback } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import ImageSlider from '@/components/projects/ImageSlider';
import { 
  IMAGE_CONSTANTS, 
  THEME_CONSTANTS, 
  TEXT_CONSTANTS, 
  DATE_CONSTANTS,
  A11Y_CONSTANTS,
  INTERACTION_CONSTANTS 
} from '@/constants/ui';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

interface ProjectImageProps {
  project: Project;
}

interface ProjectLinksProps {
  project: Project;
}

const ProjectImage: React.FC<ProjectImageProps> = memo(({ project }) => {
  const handleSliderInteraction = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div 
      className={`${IMAGE_CONSTANTS.PROJECT_IMAGE_HEIGHT} overflow-hidden relative`}
      style={{ backgroundColor: THEME_CONSTANTS.SECONDARY_BG }}
      onClick={handleSliderInteraction}
    >
      <div 
        className="absolute inset-0 opacity-20 z-10 pointer-events-none" 
        style={{ backgroundColor: THEME_CONSTANTS.ACCENT_PRIMARY }}
      />
      
      {project.images && project.images.length > 0 ? (
        <div 
          className="relative z-20" 
          onClick={handleSliderInteraction}
          onMouseDown={handleSliderInteraction}
          onTouchStart={handleSliderInteraction}
        >
          <ImageSlider 
            images={project.images}
            className="h-full"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-center z-20">
          <div>
            <div className="text-3xl mb-2 opacity-60">🚀</div>
            <p className="linear-text-small opacity-60">프로젝트</p>
          </div>
        </div>
      )}
    </div>
  );
});

ProjectImage.displayName = 'ProjectImage';

const ProjectLinks: React.FC<ProjectLinksProps> = memo(({ project }) => {
  const handleLinkClick = useCallback((e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(url, INTERACTION_CONSTANTS.WINDOW_TARGET, INTERACTION_CONSTANTS.WINDOW_FEATURES);
  }, []);

  return (
    <div 
      className="flex justify-center gap-3 pt-4 border-t" 
      style={{ borderColor: THEME_CONSTANTS.BORDER_SECONDARY }}
    >
      {project.githubUrl && (
        <button
          type="button"
          title={A11Y_CONSTANTS.GITHUB_BUTTON_TITLE}
          className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105" 
          style={{ 
            backgroundColor: THEME_CONSTANTS.SECONDARY_BG, 
            color: THEME_CONSTANTS.SECONDARY_TEXT 
          }}
          onClick={(e) => handleLinkClick(e, project.githubUrl!)}
          aria-label={`${project.title} GitHub 저장소`}
        >
          <svg className={IMAGE_CONSTANTS.SMALL_ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="text-sm font-medium">GitHub</span>
        </button>
      )}
      {project.demoUrl && (
        <button
          type="button"
          title={A11Y_CONSTANTS.DEMO_BUTTON_TITLE}
          className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105" 
          style={{ 
            backgroundColor: THEME_CONSTANTS.ACCENT_PRIMARY, 
            color: 'white' 
          }}
          onClick={(e) => handleLinkClick(e, project.demoUrl!)}
          aria-label={`${project.title} 데모 사이트`}
        >
          <svg className={IMAGE_CONSTANTS.SMALL_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="text-sm font-medium">데모</span>
        </button>
      )}
    </div>
  );
});

ProjectLinks.displayName = 'ProjectLinks';

export const ProjectCard: React.FC<ProjectCardProps> = memo(({ project, className = '' }) => {
  const formatDateRange = useCallback((startDate: string, endDate?: string) => {
    const start = new Date(startDate).toLocaleDateString(
      DATE_CONSTANTS.KOREAN_DATE_FORMAT, 
      DATE_CONSTANTS.DATE_OPTIONS
    );
    const end = endDate 
      ? new Date(endDate).toLocaleDateString(DATE_CONSTANTS.KOREAN_DATE_FORMAT, DATE_CONSTANTS.DATE_OPTIONS)
      : DATE_CONSTANTS.IN_PROGRESS_TEXT;
    return `${start} - ${end}`;
  }, []);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`block group ${INTERACTION_CONSTANTS.CARD_BASE} overflow-hidden ${INTERACTION_CONSTANTS.CARD_HOVER} ${className}`}
      aria-label={`${project.title} 프로젝트 상세 보기`}
    >
      <ProjectImage project={project} />

      <div className="p-8">
        <h3 className="linear-text-large mb-3 group-hover:opacity-75 transition-opacity">
          {project.title}
        </h3>
        <p 
          className={`linear-text-regular mb-6 ${TEXT_CONSTANTS.SUMMARY_LINE_CLAMP} leading-relaxed`}
          style={{ color: THEME_CONSTANTS.SECONDARY_TEXT }}
        >
          {project.summary}
        </p>

        {/* 기술 스택 태그 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.slice(0, TEXT_CONSTANTS.MAX_TECH_TAGS_DISPLAY).map((tech) => (
            <span key={tech} className={`${INTERACTION_CONSTANTS.TAG_BASE} text-xs`}>
              {tech}
            </span>
          ))}
          {project.techStack.length > TEXT_CONSTANTS.MAX_TECH_TAGS_DISPLAY && (
            <span className={`${INTERACTION_CONSTANTS.TAG_BASE} text-xs`}>
              +{project.techStack.length - TEXT_CONSTANTS.MAX_TECH_TAGS_DISPLAY}
            </span>
          )}
        </div>

        {/* 날짜 정보 */}
        <div className="mb-4">
          <div className={INTERACTION_CONSTANTS.TAG_BASE}>
            <span className="text-sm font-medium">
              {formatDateRange(project.startDate, project.endDate)}
            </span>
          </div>
        </div>

        <ProjectLinks project={project} />
      </div>
    </Link>
  );
});

ProjectCard.displayName = 'ProjectCard';
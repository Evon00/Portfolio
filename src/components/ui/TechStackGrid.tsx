import { memo, useCallback } from 'react';
import { getTechIcon } from '@/lib/techIcons';
import { type SkillResponse } from '@/services/skillService';
import { 
  RESPONSIVE_CONSTANTS, 
  INTERACTION_CONSTANTS, 
  ANIMATION_CONSTANTS,
  THEME_CONSTANTS,
  IMAGE_CONSTANTS,
  FALLBACK_CONSTANTS 
} from '@/constants/ui';

interface TechStackGridProps {
  skills: SkillResponse[];
  className?: string;
}

interface TechStackItemProps {
  skill: SkillResponse;
}

const TechStackItem: React.FC<TechStackItemProps> = memo(({ skill }) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Failed to load image for ${skill.skillName}:`, skill.uploadUrl);
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const fallbackDiv = target.nextElementSibling as HTMLElement;
    if (fallbackDiv) {
      fallbackDiv.style.display = 'block';
    }
  }, [skill.skillName, skill.uploadUrl]);

  // 이미지 URL 정규화
  const normalizedImageUrl = skill.uploadUrl && !skill.uploadUrl.startsWith('http') 
    ? `https://${skill.uploadUrl}` 
    : skill.uploadUrl;

  return (
    <div
      className={`${INTERACTION_CONSTANTS.CARD_BASE} group ${INTERACTION_CONSTANTS.CARD_HOVER} ${ANIMATION_CONSTANTS.SCALE_HOVER} ${ANIMATION_CONSTANTS.HOVER_TRANSITION}`}
    >
      <div className="flex flex-col items-center gap-3 p-4">
        <div className={`${IMAGE_CONSTANTS.TECH_ICON_SIZE} flex items-center justify-center`}>
          {normalizedImageUrl && (
            <img
              src={normalizedImageUrl}
              alt={skill.skillName}
              className={`${IMAGE_CONSTANTS.TECH_ICON_SIZE} object-contain skill-icon`}
              onError={handleImageError}
              loading="lazy"
            />
          )}
          <div 
            style={{ 
              color: THEME_CONSTANTS.ACCENT_PRIMARY,
              display: normalizedImageUrl ? 'none' : 'block'
            }}
            aria-label={`${skill.skillName} 아이콘`}
          >
            {getTechIcon(skill.skillName)}
          </div>
        </div>
        <span 
          className="linear-text-small font-medium text-center group-hover:text-blue-400 transition-colors"
          title={skill.skillName}
        >
          {skill.skillName}
        </span>
      </div>
    </div>
  );
});

TechStackItem.displayName = 'TechStackItem';

export const TechStackGrid: React.FC<TechStackGridProps> = memo(({ 
  skills, 
  className = '' 
}) => {
  if (skills.length === 0) {
    return (
      <div className="text-center py-12" role="status" aria-live="polite">
        <div className="text-4xl mb-4 opacity-50">🔧</div>
        <p className="linear-text-regular opacity-60">
          {FALLBACK_CONSTANTS.NO_TECH_STACK}
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`grid ${RESPONSIVE_CONSTANTS.TECH_STACK_GRID} gap-4 ${className}`}
      role="list"
      aria-label="기술 스택 목록"
    >
      {skills.map((skill) => (
        <div key={skill.id} role="listitem">
          <TechStackItem skill={skill} />
        </div>
      ))}
    </div>
  );
});

TechStackGrid.displayName = 'TechStackGrid';
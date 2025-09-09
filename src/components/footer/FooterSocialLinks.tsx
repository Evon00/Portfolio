import { memo } from 'react';
import { UserInfo } from '@/services/memberService';
import { 
  THEME_CONSTANTS, 
  ANIMATION_CONSTANTS, 
  IMAGE_CONSTANTS,
  INTERACTION_CONSTANTS 
} from '@/constants/ui';

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  ariaLabel?: string;
}

interface FooterSocialLinksProps {
  userInfo: UserInfo | null;
  title?: string;
  className?: string;
}

const SocialLink: React.FC<SocialLinkProps> = memo(({ 
  href, 
  icon, 
  label, 
  ariaLabel 
}) => {
  return (
    <a 
      href={href}
      target={href.startsWith('mailto:') ? undefined : INTERACTION_CONSTANTS.WINDOW_TARGET}
      rel={href.startsWith('mailto:') ? undefined : INTERACTION_CONSTANTS.WINDOW_FEATURES}
      className={`flex items-center linear-text-small ${ANIMATION_CONSTANTS.OPACITY_HOVER} ${ANIMATION_CONSTANTS.FADE_TRANSITION} group`}
      style={{ color: THEME_CONSTANTS.SECONDARY_TEXT }}
      aria-label={ariaLabel || `${label}로 연결`}
    >
      <div 
        className={`p-2 rounded-lg mr-3 group-hover:opacity-80 ${ANIMATION_CONSTANTS.FADE_TRANSITION}`}
        style={{ backgroundColor: THEME_CONSTANTS.TERTIARY_BG }}
      >
        {icon}
      </div>
      {label}
    </a>
  );
});

SocialLink.displayName = 'SocialLink';

export const FooterSocialLinks: React.FC<FooterSocialLinksProps> = memo(({ 
  userInfo, 
  title = '연락처', 
  className = '' 
}) => {
  const githubIcon = (
    <svg className={IMAGE_CONSTANTS.SMALL_ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );

  const emailIcon = (
    <svg className={IMAGE_CONSTANTS.SMALL_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  // 표시할 소셜 링크가 없으면 렌더링하지 않음
  if (!userInfo?.githubUrl && !userInfo?.email) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 
        className="linear-text-regular font-medium" 
        style={{ color: THEME_CONSTANTS.PRIMARY_TEXT }}
      >
        {title}
      </h3>
      <div className="space-y-3" role="list" aria-label="소셜 링크 목록">
        {userInfo?.githubUrl && (
          <div role="listitem">
            <SocialLink
              href={userInfo.githubUrl}
              icon={githubIcon}
              label="GitHub"
              ariaLabel="GitHub 프로필 방문"
            />
          </div>
        )}
        {userInfo?.email && (
          <div role="listitem">
            <SocialLink
              href={`mailto:${userInfo.email}`}
              icon={emailIcon}
              label="Email"
              ariaLabel="이메일로 문의"
            />
          </div>
        )}
      </div>
    </div>
  );
});

FooterSocialLinks.displayName = 'FooterSocialLinks';
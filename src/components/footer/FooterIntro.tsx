import { memo } from 'react';
import { UserInfo } from '@/services/memberService';
import { THEME_CONSTANTS, FALLBACK_CONSTANTS } from '@/constants/ui';

interface FooterIntroProps {
  userInfo: UserInfo | null;
  isLoading: boolean;
  className?: string;
}

export const FooterIntro: React.FC<FooterIntroProps> = memo(({ 
  userInfo, 
  isLoading, 
  className = '' 
}) => {
  const displayName = isLoading 
    ? FALLBACK_CONSTANTS.LOADING_TEXT 
    : (userInfo?.name || FALLBACK_CONSTANTS.NO_NAME);

  const displayIntro = isLoading 
    ? FALLBACK_CONSTANTS.LOADING_INTRO 
    : (userInfo?.introduction || FALLBACK_CONSTANTS.NO_INTRO);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 
        className="linear-title-5" 
        style={{ color: THEME_CONSTANTS.PRIMARY_TEXT }}
      >
        {displayName}
      </h3>
      <p 
        className="linear-text-regular max-w-xs" 
        style={{ color: THEME_CONSTANTS.SECONDARY_TEXT }}
      >
        {displayIntro}
      </p>
    </div>
  );
});

FooterIntro.displayName = 'FooterIntro';
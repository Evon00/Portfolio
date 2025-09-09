import { memo, useMemo } from 'react';
import { UserInfo } from '@/services/memberService';
import { THEME_CONSTANTS, FALLBACK_CONSTANTS } from '@/constants/ui';

interface FooterCopyrightProps {
  userInfo: UserInfo | null;
  isLoading: boolean;
  currentYear?: number;
  className?: string;
}

export const FooterCopyright: React.FC<FooterCopyrightProps> = memo(({ 
  userInfo, 
  isLoading,
  currentYear,
  className = '' 
}) => {
  const year = useMemo(() => currentYear || new Date().getFullYear(), [currentYear]);
  
  const displayName = isLoading 
    ? FALLBACK_CONSTANTS.LOADING_TEXT 
    : (userInfo?.name || FALLBACK_CONSTANTS.DEFAULT_DEVELOPER);

  return (
    <div 
      className={`border-t mt-12 pt-8 text-center ${className}`}
      style={{ borderColor: THEME_CONSTANTS.BORDER_PRIMARY }}
    >
      <p 
        className="linear-text-small" 
        style={{ color: THEME_CONSTANTS.TERTIARY_TEXT }}
      >
        © {year} {displayName}. All rights reserved.
      </p>
    </div>
  );
});

FooterCopyright.displayName = 'FooterCopyright';
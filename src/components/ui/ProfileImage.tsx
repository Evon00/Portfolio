import { memo, useState, useCallback } from 'react';
import { IMAGE_CONSTANTS, THEME_CONSTANTS, A11Y_CONSTANTS } from '@/constants/ui';

interface ProfileImageProps {
  src?: string;
  alt: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: IMAGE_CONSTANTS.PROFILE_IMAGE_SIZE,
} as const;

const ONLINE_INDICATOR_SIZES = {
  sm: 'w-4 h-4 -bottom-1 -right-1',
  md: 'w-5 h-5 -bottom-1 -right-1',
  lg: 'w-6 h-6 -bottom-2 -right-2',
  xl: 'w-8 h-8 -bottom-2 -right-2',
} as const;

export const ProfileImage: React.FC<ProfileImageProps> = memo(({
  src,
  alt,
  name,
  size = 'xl',
  showOnlineStatus = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    console.error('Profile image failed to load:', src);
    setImageError(true);
  }, [src]);

  const sizeClass = SIZE_CLASSES[size];
  const onlineIndicatorSize = ONLINE_INDICATOR_SIZES[size];

  // 이미지 URL 정규화
  const normalizedSrc = src && !src.startsWith('http') ? `https://${src}` : src;

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {!imageError && normalizedSrc ? (
        <img
          src={normalizedSrc}
          alt={alt}
          className={`${sizeClass} rounded-full object-cover border shadow-2xl`}
          style={{ borderColor: THEME_CONSTANTS.BORDER_SECONDARY }}
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div 
          className={`${sizeClass} rounded-full flex items-center justify-center border shadow-2xl`}
          style={{ 
            background: `linear-gradient(135deg, ${THEME_CONSTANTS.TERTIARY_BG}, ${THEME_CONSTANTS.QUATERNARY_BG})`,
            borderColor: THEME_CONSTANTS.BORDER_SECONDARY
          }}
          role="img"
          aria-label={`${name}${A11Y_CONSTANTS.PROFILE_IMAGE_ALT_SUFFIX}`}
        >
          <span 
            className={`font-semibold ${size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'}`}
            style={{ color: THEME_CONSTANTS.PRIMARY_TEXT }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      {showOnlineStatus && (
        <div 
          className={`absolute ${onlineIndicatorSize} rounded-full border-4 flex items-center justify-center shadow-lg`}
          style={{ 
            backgroundColor: THEME_CONSTANTS.ACCENT_SUCCESS,
            borderColor: THEME_CONSTANTS.PRIMARY_BG
          }}
          aria-label={A11Y_CONSTANTS.ONLINE_STATUS_LABEL}
          role="status"
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
});

ProfileImage.displayName = 'ProfileImage';
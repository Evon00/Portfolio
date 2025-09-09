import { memo } from 'react';
import Link from 'next/link';
import { THEME_CONSTANTS, ANIMATION_CONSTANTS } from '@/constants/ui';

interface NavigationItem {
  href: string;
  label: string;
}

interface FooterNavigationProps {
  title?: string;
  className?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' }
] as const;

export const FooterNavigation: React.FC<FooterNavigationProps> = memo(({ 
  title = '바로가기', 
  className = '' 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <h3 
        className="linear-text-regular font-medium" 
        style={{ color: THEME_CONSTANTS.PRIMARY_TEXT }}
      >
        {title}
      </h3>
      <nav role="navigation" aria-label="푸터 네비게이션">
        <div className="space-y-3">
          {NAVIGATION_ITEMS.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`block linear-text-small ${ANIMATION_CONSTANTS.OPACITY_HOVER} ${ANIMATION_CONSTANTS.FADE_TRANSITION}`}
              style={{ color: THEME_CONSTANTS.SECONDARY_TEXT }}
              aria-label={`${item.label} 페이지로 이동`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
});

FooterNavigation.displayName = 'FooterNavigation';
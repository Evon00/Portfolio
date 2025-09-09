'use client';

import { useMemo } from 'react';
import { useFooterData } from '@/hooks/useFooterData';
import { FooterIntro } from '@/components/footer/FooterIntro';
import { FooterNavigation } from '@/components/footer/FooterNavigation';
import { FooterSocialLinks } from '@/components/footer/FooterSocialLinks';
import { FooterCopyright } from '@/components/footer/FooterCopyright';
import { 
  LAYOUT_CONSTANTS, 
  RESPONSIVE_CONSTANTS, 
  THEME_CONSTANTS 
} from '@/constants/ui';

/**
 * Footer 컴포넌트
 * - 사용자 정보, 네비게이션, 소셜 링크, 저작권 정보를 표시
 * - 커스텀 훅을 통한 상태 관리
 * - 작은 컴포넌트들로 분리하여 유지보수성 향상
 * - 접근성과 성능 최적화 적용
 */
export default function Footer() {
  const { userInfo, isLoading, error } = useFooterData();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
  // Footer 스타일 메모이제이션
  const footerStyling = useMemo(() => ({
    backgroundColor: THEME_CONSTANTS.SECONDARY_BG,
    borderColor: THEME_CONSTANTS.BORDER_PRIMARY
  }), []);

  return (
    <footer 
      className="border-t mt-32"
      style={footerStyling}
      role="contentinfo"
      aria-label="웹사이트 푸터"
    >
      <div className={`${LAYOUT_CONSTANTS.MAX_WIDTH} ${LAYOUT_CONSTANTS.CONTAINER_PADDING} py-16`}>
        <div className={`grid ${RESPONSIVE_CONSTANTS.FOOTER_GRID} gap-12`}>
          {/* 소개 섹션 - 리팩토링된 컴포넌트 사용 */}
          <FooterIntro 
            userInfo={userInfo} 
            isLoading={isLoading} 
          />

          {/* 네비게이션 섹션 - 리팩토링된 컴포넌트 사용 */}
          <FooterNavigation />

          {/* 소셜 링크 섹션 - 리팩토링된 컴포넌트 사용 */}
          <FooterSocialLinks userInfo={userInfo} />
        </div>

        {/* 저작권 정보 - 리팩토링된 컴포넌트 사용 */}
        <FooterCopyright 
          userInfo={userInfo} 
          isLoading={isLoading} 
          currentYear={currentYear}
        />
      </div>
    </footer>
  );
}
import { memo, useCallback } from 'react';
import Link from 'next/link';
import { UserInfo } from '@/services/memberService';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { LAYOUT_CONSTANTS, INTERACTION_CONSTANTS, IMAGE_CONSTANTS } from '@/constants/ui';

interface HeroSectionProps {
  userInfo: UserInfo;
  className?: string;
}

interface HeroButtonsProps {
  className?: string;
}

const HeroButtons: React.FC<HeroButtonsProps> = memo(({ className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${className}`}>
      <Link 
        href="/projects" 
        className={INTERACTION_CONSTANTS.BUTTON_PRIMARY}
        aria-label="프로젝트 페이지로 이동"
      >
        프로젝트 보기
        <svg className={IMAGE_CONSTANTS.SMALL_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      
      <Link 
        href="/blog" 
        className={INTERACTION_CONSTANTS.BUTTON_SECONDARY}
        aria-label="블로그 페이지로 이동"
      >
        블로그 읽기
        <svg className={IMAGE_CONSTANTS.SMALL_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </Link>
    </div>
  );
});

HeroButtons.displayName = 'HeroButtons';

export const HeroSection: React.FC<HeroSectionProps> = memo(({ userInfo, className = '' }) => {
  const profileImageAlt = `${userInfo.name} 프로필 이미지`;

  return (
    <section className={`text-center ${LAYOUT_CONSTANTS.SECTION_SPACING} linear-fade-in ${className}`}>
      <ProfileImage
        src={userInfo.profileImageUrl}
        alt={profileImageAlt}
        name={userInfo.name}
        size="xl"
        showOnlineStatus={true}
        className="mx-auto mb-12"
      />
      
      <h1 className="linear-title-1 mb-8 leading-tight">
        <span className="linear-gradient-text">
          안녕하세요,
        </span>
        <br />
        <span className="linear-gradient-accent">
          {userInfo.name}입니다
        </span>
      </h1>
      
      <p className="linear-text-large mb-16 max-w-3xl mx-auto">
        {userInfo.introduction}
      </p>
      
      <HeroButtons />
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
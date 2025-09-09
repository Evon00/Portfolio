// UI 관련 상수들

// 애니메이션 및 트랜지션 상수
export const ANIMATION_CONSTANTS = {
  LOADING_SPINNER_SIZE: 'w-8 h-8',
  HOVER_TRANSITION: 'transition-all duration-200',
  SCALE_HOVER: 'hover:scale-105',
  OPACITY_HOVER: 'hover:opacity-80',
  FADE_TRANSITION: 'transition-opacity',
} as const;

// 레이아웃 상수
export const LAYOUT_CONSTANTS = {
  CONTAINER_PADDING: 'px-4 sm:px-6 lg:px-8',
  MAX_WIDTH: 'max-w-7xl mx-auto',
  SECTION_SPACING: 'mb-32',
  HERO_SPACING: 'py-16 lg:py-24',
  CARD_PADDING: 'p-8',
  GRID_COLS_MOBILE: 'grid-cols-1',
  GRID_COLS_TABLET: 'md:grid-cols-2',
  GRID_COLS_DESKTOP: 'lg:grid-cols-3',
} as const;

// 이미지 크기 상수
export const IMAGE_CONSTANTS = {
  PROFILE_IMAGE_SIZE: 'w-40 h-40',
  TECH_ICON_SIZE: 'w-8 h-8',
  PROJECT_IMAGE_HEIGHT: 'h-52',
  BLOG_IMAGE_HEIGHT: '208px',
  SMALL_ICON_SIZE: 'w-4 h-4',
  MEDIUM_ICON_SIZE: 'w-5 h-5',
} as const;

// 텍스트 제한 상수
export const TEXT_CONSTANTS = {
  SUMMARY_LINE_CLAMP: 'line-clamp-3',
  TITLE_LINE_CLAMP: 'line-clamp-2',
  MAX_TECH_TAGS_DISPLAY: 3,
  EMAIL_COPY_SUCCESS_MESSAGE: '이메일 주소가 클립보드에 복사되었습니다',
} as const;

// 색상 및 테마 상수
export const THEME_CONSTANTS = {
  PRIMARY_BG: 'var(--color-bg-primary)',
  SECONDARY_BG: 'var(--color-bg-secondary)',
  TERTIARY_BG: 'var(--color-bg-tertiary)',
  QUATERNARY_BG: 'var(--color-bg-quaternary)',
  PRIMARY_TEXT: 'var(--color-text-primary)',
  SECONDARY_TEXT: 'var(--color-text-secondary)',
  TERTIARY_TEXT: 'var(--color-text-tertiary)',
  ACCENT_PRIMARY: 'var(--color-accent-primary)',
  ACCENT_SUCCESS: 'var(--color-accent-success)',
  BORDER_PRIMARY: 'var(--color-border-primary)',
  BORDER_SECONDARY: 'var(--color-border-secondary)',
} as const;

// 버튼 및 상호작용 상수
export const INTERACTION_CONSTANTS = {
  BUTTON_PRIMARY: 'linear-button-primary',
  BUTTON_SECONDARY: 'linear-button-secondary',
  CARD_BASE: 'linear-card',
  CARD_HOVER: 'cursor-pointer group',
  TAG_BASE: 'linear-tag',
  WINDOW_TARGET: '_blank',
  WINDOW_FEATURES: 'noopener,noreferrer',
} as const;

// 접근성 상수
export const A11Y_CONSTANTS = {
  LOADING_LABEL: '데이터를 불러오는 중...',
  ERROR_LABEL: '오류가 발생했습니다',
  RETRY_LABEL: '다시 시도',
  EMAIL_BUTTON_TITLE: '이메일 문의',
  GITHUB_BUTTON_TITLE: 'GitHub 저장소',
  DEMO_BUTTON_TITLE: '데모 사이트',
  PROFILE_IMAGE_ALT_SUFFIX: ' 프로필',
  ONLINE_STATUS_LABEL: '온라인 상태',
} as const;

// 날짜 형식 상수
export const DATE_CONSTANTS = {
  KOREAN_DATE_FORMAT: 'ko-KR',
  DATE_OPTIONS: {
    year: 'numeric' as const,
    month: '2-digit' as const,
    day: '2-digit' as const,
  },
  IN_PROGRESS_TEXT: '진행 중',
  READ_TIME_SUFFIX: '분 읽기',
} as const;

// 그리드 및 반응형 상수
export const RESPONSIVE_CONSTANTS = {
  TECH_STACK_GRID: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  PROJECT_GRID: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  BLOG_GRID: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  FOOTER_GRID: 'grid-cols-1 md:grid-cols-3',
  BUTTON_FLEX: 'flex-col sm:flex-row',
  CONTACT_FLEX: 'flex-col sm:flex-row',
} as const;

// 폴백 텍스트 상수
export const FALLBACK_CONSTANTS = {
  NO_NAME: '이름 정보 없음',
  NO_INTRO: '소개 정보가 없습니다',
  NO_TECH_STACK: '기술 스택 정보가 없습니다',
  NO_PROJECTS: '프로젝트 정보가 없습니다',
  NO_BLOG_POSTS: '블로그 포스트가 없습니다',
  LOADING_TEXT: '로딩 중...',
  LOADING_INTRO: '소개 정보를 불러오는 중입니다...',
  DEFAULT_DEVELOPER: '개발자',
} as const;
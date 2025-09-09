# 포트폴리오 웹사이트 - 프로젝트 문서

## 개요

이 프로젝트는 개발자 포트폴리오를 위한 현대적이고 관리하기 쉬운 웹사이트입니다. 사용자 친화적인 인터페이스와 강력한 관리자 기능을 제공하며, 블로그 포스트, 프로젝트, 기술 스택을 체계적으로 관리할 수 있습니다.

## 주요 기능

### 🎯 프론트엔드 기능
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험
- **다크 테마**: Linear 디자인 시스템 기반의 세련된 UI
- **블로그**: 기술 포스트 작성 및 조회
- **프로젝트 포트폴리오**: 프로젝트 상세 정보 및 이미지 갤러리
- **기술 스택 관리**: 중앙화된 기술 스택 시스템
- **프로필 관리**: 개인 정보 및 주요 프로젝트 관리

### 🔐 관리자 기능
- **JWT 인증**: 보안 기반의 관리자 접근
- **CRUD 작업**: 블로그, 프로젝트, 기술 스택 전체 관리
- **이미지 업로드**: 드래그 앤 드롭 기반의 파일 업로드
- **실시간 미리보기**: 작성 중인 콘텐츠 실시간 확인
- **통계 대시보드**: 콘텐츠 현황 및 분석

## 기술 스택

### 🔧 핵심 기술

#### Frontend Framework
- **Next.js 14**: App Router를 활용한 최신 React 프레임워크
- **TypeScript**: 타입 안정성과 개발 생산성 향상
- **React 18**: 최신 React 기능 활용

#### Styling & UI
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Linear Design System**: 일관된 디자인 시스템
- **CSS Custom Properties**: 동적 테마 관리
- **Inter Font**: 현대적이고 가독성 높은 폰트

#### State Management
- **Zustand**: 경량화된 상태 관리 라이브러리
- **Persist Middleware**: 상태 영속성 관리
- **Custom Hooks**: 재사용 가능한 상태 로직

#### Data Layer
- **Service Layer Pattern**: API 호출 추상화
- **Mock Data Simulation**: 실제 API 대기 시간 시뮬레이션
- **TypeScript Interfaces**: 강력한 타입 정의

#### Development Tools
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **TypeScript Compiler**: 타입 체크

### 📁 프로젝트 구조

```
portfolio-website/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # 공개 페이지
│   │   │   ├── blog/          # 블로그 페이지
│   │   │   ├── projects/      # 프로젝트 페이지
│   │   │   └── about/         # 소개 페이지
│   │   ├── admin/             # 관리자 페이지
│   │   │   ├── login/         # 로그인
│   │   │   ├── dashboard/     # 대시보드
│   │   │   ├── blogs/         # 블로그 관리
│   │   │   ├── projects/      # 프로젝트 관리
│   │   │   ├── techstack/     # 기술 스택 관리
│   │   │   └── profile/       # 프로필 관리
│   │   ├── globals.css        # 전역 스타일
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── loading.tsx        # 로딩 컴포넌트
│   │   └── page.tsx           # 홈페이지
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── forms/            # 폼 관련 컴포넌트
│   │   │   ├── FormField.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   └── Select.tsx
│   │   ├── common/           # 공통 컴포넌트
│   │   │   ├── DataTable.tsx
│   │   │   ├── FormWrapper.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── blog/             # 블로그 컴포넌트
│   │   ├── project/          # 프로젝트 컴포넌트
│   │   ├── admin/            # 관리자 컴포넌트
│   │   └── ErrorBoundary.tsx # 에러 경계 컴포넌트
│   ├── services/             # API 서비스 레이어
│   │   ├── apiService.ts     # 기본 API 서비스
│   │   ├── authService.ts    # 인증 서비스
│   │   ├── blogService.ts    # 블로그 서비스
│   │   ├── projectService.ts # 프로젝트 서비스
│   │   ├── techStackService.ts # 기술 스택 서비스
│   │   ├── userService.ts    # 사용자 서비스
│   │   └── index.ts          # 서비스 내보내기
│   ├── stores/               # Zustand 상태 관리
│   │   ├── authStore.ts      # 인증 상태
│   │   ├── blogStore.ts      # 블로그 상태
│   │   ├── projectStore.ts   # 프로젝트 상태
│   │   ├── techStackStore.ts # 기술 스택 상태
│   │   ├── userStore.ts      # 사용자 상태
│   │   └── index.ts          # 스토어 내보내기
│   ├── hooks/                # 커스텀 훅
│   │   ├── useAuth.ts        # 인증 훅
│   │   ├── useBlogs.ts       # 블로그 훅
│   │   ├── useProjects.ts    # 프로젝트 훅
│   │   ├── useTechStack.ts   # 기술 스택 훅
│   │   ├── useUser.ts        # 사용자 훅
│   │   ├── useAsync.ts       # 비동기 처리 훅
│   │   ├── useErrorHandler.ts # 에러 처리 훅
│   │   ├── useForm.ts        # 폼 처리 훅
│   │   └── index.ts          # 훅 내보내기
│   ├── utils/                # 유틸리티 함수
│   │   ├── validation.ts     # 폼 검증
│   │   ├── errorHandler.ts   # 에러 처리
│   │   ├── loadingStates.ts  # 로딩 상태
│   │   └── mockData.ts       # 목 데이터
│   ├── types/                # TypeScript 타입 정의
│   │   ├── index.ts          # 기본 타입
│   │   ├── blog.ts           # 블로그 타입
│   │   ├── project.ts        # 프로젝트 타입
│   │   ├── techStack.ts      # 기술 스택 타입
│   │   └── user.ts           # 사용자 타입
│   └── lib/                  # 라이브러리 설정
│       └── utils.ts          # 유틸리티 함수
├── public/                   # 정적 파일
│   ├── images/              # 이미지 파일
│   └── icons/               # 아이콘 파일
├── tailwind.config.js       # Tailwind 설정
├── tsconfig.json           # TypeScript 설정
├── next.config.js          # Next.js 설정
├── package.json            # 프로젝트 의존성
└── README.md               # 프로젝트 설명
```

## 아키텍처 패턴

### 🏗️ 서비스 레이어 패턴
```typescript
// 기본 API 서비스
export abstract class BaseApiService {
  protected async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // 공통 에러 처리, 인증, 로깅 등
  }
}

// 구체적인 서비스 구현
export class BlogService extends BaseApiService {
  async getAll(): Promise<BlogPost[]> {
    // 목 데이터 시뮬레이션 (실제 API 준비)
  }
}
```

### 🔄 상태 관리 패턴
```typescript
// Zustand를 활용한 타입 안전한 상태 관리
export const useBlogStore = create<BlogState>((set, get) => ({
  blogs: [],
  isLoading: false,
  error: null,
  
  fetchBlogs: async () => {
    set({ isLoading: true, error: null });
    
    
    try {
      const blogs = await blogService.getAll();
      set({ blogs, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));
```

### 🎣 커스텀 훅 패턴
```typescript
// 비즈니스 로직과 UI 로직 분리
export const useBlogs = () => {
  const store = useBlogStore();
  
  const loadBlogs = useCallback(async () => {
    try {
      await store.fetchBlogs();
      return true;
    } catch (error) {
      return false;
    }
  }, [store.fetchBlogs]);

  return {
    blogs: store.blogs,
    isLoading: store.isLoading,
    error: store.error,
    loadBlogs
  };
};
```

### 🧩 컴포넌트 구성 패턴
```typescript
// 재사용 가능한 컴포넌트
export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  error,
  onRowClick
}: DataTableProps<T>) => {
  // 제네릭을 활용한 타입 안전성
  // 공통 로딩, 에러, 빈 상태 처리
};
```

## 주요 구현 특징

### 🔄 목 데이터 시뮬레이션
실제 API 연동을 위한 준비로, 모든 서비스가 실제 네트워크 지연을 시뮬레이션합니다:

```typescript
export class BlogService extends BaseApiService {
  async getAll(): Promise<BlogPost[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockBlogPosts]), 100);
    });
  }
}
```

### 🎯 중앙화된 기술 스택 관리
프로젝트와 블로그에서 사용하는 기술 스택을 중앙에서 관리:

```typescript
// 클라이언트 사이드 아이콘 매핑 (서버에서 아이콘 URL 지원 준비)
const iconMap: Record<string, string> = {
  'React': '/icons/react.svg',
  'Next.js': '/icons/nextjs.svg',
  'TypeScript': '/icons/typescript.svg'
};
```

### 🔐 인증 시스템
JWT 기반의 안전한 인증 시스템:

```typescript
export class AuthService extends BaseApiService {
  async login(credentials: LoginCredentials): Promise<AdminAuth> {
    // JWT 토큰 발급 및 자동 갱신 로직
  }
  
  shouldRefreshToken(): boolean {
    // 토큰 만료 시간 확인 및 갱신 필요성 판단
  }
}
```

### 📝 폼 처리 표준화
타입 안전한 폼 처리 시스템:

```typescript
// 검증 스키마 정의
const blogValidationSchema: ValidationSchema = {
  title: {
    rules: [minLength(1), maxLength(200)],
    required: true
  },
  content: {
    rules: [minLength(10)],
    required: true
  }
};

// 폼 훅 사용
const form = useForm({
  initialValues: { title: '', content: '' },
  validationSchema: blogValidationSchema,
  onSubmit: handleSubmit
});
```

### 🎨 UI/UX 디자인 시스템
Linear의 디자인 원칙을 따른 일관된 UI:

```css
/* CSS Custom Properties를 활용한 테마 시스템 */
:root {
  --color-background: #fafafa;
  --color-foreground: #171717;
  --color-muted: #737373;
  --color-accent: #2563eb;
}
```

## 성능 최적화

### ⚡ 번들 최적화
- **동적 임포트**: 페이지별 코드 분할
- **이미지 최적화**: Next.js Image 컴포넌트 활용
- **폰트 최적화**: next/font를 통한 최적화된 폰트 로딩

### 🔄 상태 관리 최적화
- **선택적 구독**: 필요한 상태만 구독
- **메모이제이션**: useCallback, useMemo 적극 활용
- **상태 정규화**: 중복 데이터 최소화

### 📱 사용자 경험 최적화
- **로딩 상태**: 모든 비동기 작업에 대한 명확한 피드백
- **에러 처리**: 사용자 친화적인 에러 메시지
- **오프라인 지원**: 기본적인 오프라인 기능

## 보안 고려사항

### 🔐 인증 및 권한
- **JWT 토큰**: 상태가 없는 인증 시스템
- **자동 토큰 갱신**: 사용자 경험 향상
- **권한 기반 라우팅**: 관리자 페이지 보호

### 🛡️ 데이터 보안
- **입력 검증**: 클라이언트 및 서버 사이드 검증
- **XSS 방지**: React의 기본 XSS 보호 활용
- **CSRF 보호**: 토큰 기반 요청 보호

## 향후 확장 계획

### 🚀 기능 확장
- **댓글 시스템**: 블로그 포스트 댓글 기능
- **검색 최적화**: 전문 검색 엔진 연동
- **소셜 공유**: 소셜 미디어 통합
- **분석 도구**: 방문자 통계 및 분석

### 🔧 기술적 개선
- **서버 사이드 렌더링**: SEO 최적화
- **프로그레시브 웹 앱**: PWA 기능 추가
- **마이크로 프론트엔드**: 대규모 확장을 위한 아키텍처
- **GraphQL**: 효율적인 데이터 페칭

### 📊 모니터링 및 분석
- **에러 추적**: Sentry 등 에러 모니터링 도구
- **성능 모니터링**: Core Web Vitals 추적
- **사용자 분석**: Google Analytics 연동

## 개발 가이드라인

### 📝 코딩 표준
- **TypeScript**: 모든 코드에 타입 정의
- **ESLint**: 코드 품질 유지
- **Prettier**: 일관된 코드 포맷팅
- **네이밍 컨벤션**: camelCase, PascalCase 일관성

### 🧪 테스팅 전략
- **단위 테스트**: 유틸리티 함수 및 훅
- **통합 테스트**: 컴포넌트 상호작용
- **E2E 테스트**: 핵심 사용자 흐름

### 🔄 CI/CD 파이프라인
- **자동 빌드**: 코드 변경 시 자동 빌드
- **자동 테스트**: PR 생성 시 테스트 실행
- **자동 배포**: 메인 브랜치 머지 시 배포

## 결론

이 포트폴리오 웹사이트는 현대적인 웹 개발 모범 사례를 따라 구축된 확장 가능하고 유지보수가 용이한 애플리케이션입니다. 강력한 타입 시스템, 효율적인 상태 관리, 재사용 가능한 컴포넌트 아키텍처를 통해 개발 생산성과 사용자 경험을 모두 최적화했습니다.

미래의 확장성을 고려한 설계와 실제 API 연동을 위한 준비를 통해, 개인 포트폴리오부터 대규모 웹 애플리케이션까지 성장할 수 있는 탄탄한 기반을 마련했습니다.
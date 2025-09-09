/**
 * @fileoverview Portfolio website TypeScript type definitions
 * @description Comprehensive type definitions for the portfolio website with enhanced type safety
 */

// =============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// =============================================================================

/** Branded type for unique identifiers */
declare const __brand: unique symbol;
type Brand<K, T> = K & { readonly [__brand]: T };

/** Strongly typed ID types */
export type BlogPostId = Brand<string, 'BlogPostId'>;
export type ProjectId = Brand<string, 'ProjectId'>;
export type TechStackId = Brand<string, 'TechStackId'>;
export type UserId = Brand<string, 'UserId'>;

/** URL types for better validation */
export type ImageUrl = Brand<string, 'ImageUrl'>;
export type GitHubUrl = Brand<string, 'GitHubUrl'>;
export type DemoUrl = Brand<string, 'DemoUrl'>;
export type EmailAddress = Brand<string, 'EmailAddress'>;

/** Slug type for URL-safe strings */
export type Slug = Brand<string, 'Slug'>;

/** ISO date string type */
export type ISODateString = Brand<string, 'ISODateString'>;

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Makes specified properties optional */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Makes specified properties required */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/** Deep partial type */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Pick only the keys that are present in both types */
export type CommonKeys<T, U> = keyof T & keyof U;

/** Extract values from an object type */
export type ValueOf<T> = T[keyof T];

// =============================================================================
// COMMON BASE TYPES
// =============================================================================

/** Base entity with common fields */
interface BaseEntity {
  /** Unique identifier */
  readonly id: string;
  /** ISO date string of creation */
  readonly createdAt: ISODateString;
  /** ISO date string of last update */
  readonly updatedAt: ISODateString;
}

/** Base content entity with common content fields */
interface BaseContent extends BaseEntity {
  /** Content title */
  title: string;
  /** Brief description or summary */
  summary: string;
  /** URL-safe identifier */
  slug: Slug;
}

// =============================================================================
// CONSTANT TYPES
// =============================================================================

/** Technology categories */
export const TECH_CATEGORIES = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
  DEVOPS: 'DevOps',
  MOBILE: 'Mobile',
  DESIGN: 'Design',
  OTHER: 'Other'
} as const;

export type TechCategory = ValueOf<typeof TECH_CATEGORIES>;

/** Project status types */
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled'
} as const;

export type ProjectStatus = ValueOf<typeof PROJECT_STATUS>;

/** Content visibility types */
export const VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  DRAFT: 'draft'
} as const;

export type Visibility = ValueOf<typeof VISIBILITY>;

// =============================================================================
// CORE DOMAIN TYPES
// =============================================================================

/**
 * Technology stack item with enhanced metadata
 */
export interface TechStack extends BaseEntity {
  /** Technology name */
  name: string;
  /** Icon image URL */
  iconUrl?: ImageUrl;
  /** Technology category */
  category: TechCategory;
  /** Display order for sorting */
  order?: number;
  /** Whether this tech is currently featured */
  isFeatured?: boolean;
  /** Optional color theme for UI */
  color?: string;
  /** Technology description */
  description?: string;
}

/**
 * Enhanced blog post type with better type safety
 */
export interface BlogPost extends BaseContent {
  /** Unique blog post identifier */
  readonly id: BlogPostId;
  /** Full blog content (markdown/HTML) */
  content: string;
  /** Associated technology stack IDs */
  techStack: TechStackId[];
  /** Post view count */
  readonly viewCount: number;
  /** Estimated reading time in minutes */
  readonly readTime: number;
  /** Associated images */
  images?: ImageUrl[];
  /** Post visibility status */
  visibility: Visibility;
  /** SEO meta description */
  metaDescription?: string;
  /** Post tags for categorization */
  tags?: string[];
  /** Author information */
  author?: {
    name: string;
    avatar?: ImageUrl;
  };
  /** Whether comments are enabled */
  commentsEnabled?: boolean;
}

/**
 * Enhanced project type with comprehensive project data
 */
export interface Project extends BaseContent {
  /** Unique project identifier */
  readonly id: ProjectId;
  /** Detailed project description */
  description: string;
  /** Project images/screenshots */
  images: ImageUrl[];
  /** Associated technology stack IDs */
  techStack: TechStackId[];
  /** Project start date */
  startDate: ISODateString;
  /** Project end date (optional for ongoing projects) */
  endDate?: ISODateString;
  /** GitHub repository URL */
  githubUrl?: GitHubUrl;
  /** Live demo URL */
  demoUrl?: DemoUrl;
  /** Current project status */
  status: ProjectStatus;
  /** Project visibility */
  visibility: Visibility;
  /** Project priority for display ordering */
  priority?: number;
  /** Whether this is a featured project */
  isFeatured: boolean;
  /** Project team members */
  teamMembers?: Array<{
    name: string;
    role: string;
    avatar?: ImageUrl;
  }>;
  /** Key achievements or highlights */
  highlights?: string[];
  /** Challenges faced and solutions */
  challenges?: Array<{
    challenge: string;
    solution: string;
  }>;
}

/**
 * Enhanced user profile information
 */
export interface UserInfo extends BaseEntity {
  /** User's full name */
  name: string;
  /** Professional introduction/bio */
  introduction: string;
  /** GitHub profile URL */
  githubUrl: GitHubUrl;
  /** Contact email address */
  email: EmailAddress;
  /** Profile avatar image */
  profileImageUrl?: ImageUrl;
  /** User's technology stack IDs */
  techStack: TechStackId[];
  /** Featured project IDs for showcase */
  featuredProjects: ProjectId[];
  /** Professional title/role */
  title?: string;
  /** Years of experience */
  yearsOfExperience?: number;
  /** Location information */
  location?: string;
  /** Social media links */
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  /** Resume/CV file URL */
  resumeUrl?: string;
  /** Professional skills and expertise */
  skills?: Array<{
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
}

/**
 * Enhanced admin authentication type
 */
export interface AdminAuth {
  /** JWT authentication token */
  readonly token: string;
  /** Token expiration timestamp */
  readonly expiresAt: ISODateString;
  /** Refresh token for token renewal */
  readonly refreshToken?: string;
  /** User role/permissions */
  readonly role: 'admin' | 'editor' | 'viewer';
  /** User ID associated with the token */
  readonly userId: UserId;
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Standardized API response wrapper
 */
export interface ApiResponse<T = any> {
  /** Whether the request was successful */
  readonly success: boolean;
  /** Response data */
  readonly data: T;
  /** Optional message */
  readonly message?: string;
  /** Error details (when success is false) */
  readonly error?: ApiError;
  /** Response metadata */
  readonly meta?: {
    timestamp: ISODateString;
    requestId: string;
    version: string;
  };
}

/**
 * Enhanced pagination data with metadata
 */
export interface PaginationData<T> {
  /** Array of items for current page */
  readonly items: readonly T[];
  /** Current page number (1-based) */
  readonly currentPage: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Total number of items across all pages */
  readonly totalItems: number;
  /** Number of items per page */
  readonly itemsPerPage: number;
  /** Whether there is a next page */
  readonly hasNextPage: boolean;
  /** Whether there is a previous page */
  readonly hasPreviousPage: boolean;
}

/**
 * API error structure
 */
export interface ApiError {
  /** Error code */
  readonly code: string;
  /** Human-readable error message */
  readonly message: string;
  /** Detailed error information */
  readonly details?: unknown;
  /** Field-specific validation errors */
  readonly fieldErrors?: Record<string, string[]>;
  /** Stack trace (development only) */
  readonly stack?: string;
}

// =============================================================================
// FORM TYPES
// =============================================================================

/** Base form data type */
type BaseFormData = Record<string, any>;

/** Blog post form data */
export interface BlogPostFormData extends BaseFormData {
  title: string;
  summary: string;
  content: string;
  techStack: string[];
  images?: File[];
  visibility: Visibility;
  tags?: string[];
  metaDescription?: string;
}

/** Project form data */
export interface ProjectFormData extends BaseFormData {
  title: string;
  summary: string;
  description: string;
  techStack: string[];
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  demoUrl?: string;
  status: ProjectStatus;
  visibility: Visibility;
  images?: File[];
  isFeatured?: boolean;
}

/** User profile form data */
export interface UserProfileFormData extends BaseFormData {
  name: string;
  introduction: string;
  email: string;
  title?: string;
  location?: string;
  githubUrl?: string;
  profileImage?: File;
  techStack: string[];
  featuredProjects: string[];
}

/** Contact form data */
export interface ContactFormData extends BaseFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string; // Anti-spam field
}

// =============================================================================
// UI COMPONENT PROP TYPES
// =============================================================================

/** Common component props */
export interface BaseComponentProps {
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Component test ID */
  'data-testid'?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

/** Loading state props */
export interface LoadingProps extends BaseComponentProps {
  /** Whether component is in loading state */
  loading?: boolean;
  /** Loading text or element */
  loadingText?: React.ReactNode;
}

/** Error state props */
export interface ErrorProps extends BaseComponentProps {
  /** Error object or message */
  error?: Error | string | null;
  /** Error retry handler */
  onRetry?: () => void;
}

/** Pagination component props */
export interface PaginationProps extends BaseComponentProps {
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Items per page */
  itemsPerPage?: number;
  /** Show page size selector */
  showPageSize?: boolean;
}

/** Modal component props */
export interface ModalProps extends BaseComponentProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// =============================================================================
// CUSTOM HOOK TYPES
// =============================================================================

/** API hook return type */
export interface UseApiReturn<T> {
  /** Response data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: ApiError | null;
  /** Refetch function */
  refetch: () => Promise<void>;
  /** Reset state function */
  reset: () => void;
}

/** Form hook return type */
export interface UseFormReturn<T extends BaseFormData> {
  /** Form values */
  values: T;
  /** Form errors */
  errors: Partial<Record<keyof T, string>>;
  /** Touched fields */
  touched: Partial<Record<keyof T, boolean>>;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Set field value */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Set field error */
  setError: <K extends keyof T>(field: K, error: string) => void;
  /** Handle input change */
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Handle form submit */
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (event: React.FormEvent) => void;
  /** Reset form */
  reset: () => void;
  /** Validate form */
  validate: () => boolean;
}

/** Local storage hook return type */
export interface UseLocalStorageReturn<T> {
  /** Stored value */
  value: T | null;
  /** Set value function */
  setValue: (value: T) => void;
  /** Remove value function */
  removeValue: () => void;
}

// =============================================================================
// SEARCH AND FILTER TYPES
// =============================================================================

/** Search parameters */
export interface SearchParams {
  /** Search query */
  query?: string;
  /** Result limit */
  limit?: number;
  /** Result offset */
  offset?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Filters */
  filters?: Record<string, any>;
}

/** Blog post filters */
export interface BlogPostFilters {
  /** Filter by technology */
  techStack?: string[];
  /** Filter by tags */
  tags?: string[];
  /** Filter by date range */
  dateRange?: {
    start: ISODateString;
    end: ISODateString;
  };
  /** Filter by visibility */
  visibility?: Visibility;
}

/** Project filters */
export interface ProjectFilters {
  /** Filter by technology */
  techStack?: string[];
  /** Filter by status */
  status?: ProjectStatus[];
  /** Filter by featured */
  isFeatured?: boolean;
  /** Filter by date range */
  dateRange?: {
    start: ISODateString;
    end: ISODateString;
  };
  /** Filter by visibility */
  visibility?: Visibility;
}

// =============================================================================
// CLIENT-SIDE ONLY TYPES (separate from API response types)
// =============================================================================

/** Client-side blog post (with computed properties) */
export interface ClientBlogPost extends BlogPost {
  /** Computed reading progress */
  readingProgress?: number;
  /** Whether user has bookmarked this post */
  isBookmarked?: boolean;
  /** Related posts */
  relatedPosts?: BlogPost[];
}

/** Client-side project (with computed properties) */
export interface ClientProject extends Project {
  /** Whether user has liked this project */
  isLiked?: boolean;
  /** Like count */
  likeCount?: number;
  /** Related projects */
  relatedProjects?: Project[];
}

// =============================================================================
// THEME AND UI TYPES
// =============================================================================

/** Theme configuration */
export interface ThemeConfig {
  /** Color mode */
  mode: 'light' | 'dark' | 'system';
  /** Primary color */
  primaryColor: string;
  /** Font family */
  fontFamily: string;
  /** Animation preferences */
  reduceMotion: boolean;
}

/** Breakpoint definitions */
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// =============================================================================
// VALIDATION SCHEMAS (for runtime validation)
// =============================================================================

/** Validation error */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/** Validation result */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

/** Type guard for checking if value is a valid email */
export const isValidEmail = (value: string): value is EmailAddress => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/** Type guard for checking if value is a valid URL */
export const isValidUrl = (value: string): value is string => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/** Type guard for API response */
export const isApiResponse = <T>(value: any): value is ApiResponse<T> => {
  return value && typeof value === 'object' && typeof value.success === 'boolean';
};

/** Type guard for API error */
export const isApiError = (value: any): value is ApiError => {
  return value && typeof value === 'object' && typeof value.code === 'string';
};

// =============================================================================
// LEGACY TYPE COMPATIBILITY (for gradual migration)
// =============================================================================

/** @deprecated Use BlogPost instead */
export type LegacyBlogPost = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt: string;
  updatedAt?: string;
};

/** @deprecated Use Project instead */
export type LegacyProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};
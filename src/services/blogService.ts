import { BlogPost } from '@/types';
import { BaseApiService, ApiError, AuthenticationError } from './apiService';

// 상수 정의
export const BLOG_CONSTANTS = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 12,
  LEGACY_SIZE: 100,
  DEFAULT_SORT_BY: 'createdAt',
  DEFAULT_SORT_DIR: 'desc',
  READ_TIME_SUFFIX: '분',
  URL_PROTOCOLS: {
    HTTP: 'http://',
    HTTPS: 'https://'
  },
  CLOUDFRONT_INDICATORS: {
    PREFIX: 'cloudfront/',
    DOMAIN: '.cloudfront.net'
  }
} as const;

// API 타입 정의
export interface PostImageResponse {
  id: number;
  uploadUrl: string;
}

export interface PostResponse {
  id: number;
  title: string;
  summary: string;
  readTime: string;
  createdAt: string;
  view: number;
  slug: string;
  skills: SkillResponse[];
  images: PostImageResponse[];
}

export interface PostDetailResponse {
  id: number;
  title: string;
  summary: string;
  content: string;
  readTime: string;
  createdAt: string;
  view: number;
  slug: string;
  skills: SkillResponse[];
  images: PostImageResponse[];
}

export interface SkillResponse {
  id: number;
  skillName: string;
  category: string;
  uploadUrl: string;
  createdAt: string;
}

export interface PostPageResponse {
  posts: PostResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PostAddRequest {
  title: string;
  summary: string;
  content: string;
  readTime: string;
  slug: string;
  skills: number[];
  images: number[];
}

export interface PostUpdateRequest {
  title?: string;
  summary?: string;
  content?: string;
  readTime?: string;
  skills?: number[];
  images?: number[];
}

export interface PostSlugSearchResponse {
  slugs: string[];
}

export interface SkillSearchResponse {
  skills: {
    id: number;
    skillName: string;
    category: string;
    uploadUrl: string;
    createdAt: string;
  }[];
}

export type CreateBlogPostData = {
  title: string;
  summary: string;
  content: string;
  readTime: number;
  slug: string;
  techStack: string[];
  images?: number[];
};

export type UpdateBlogPostData = Partial<Omit<CreateBlogPostData, 'slug'>>;

export type BlogPostsWithPagination = {
  posts: BlogPost[];
  totalPages: number;
  totalElements: number;
};

export class BlogService extends BaseApiService {
  constructor() {
    super();
  }

  // 쿼리 파라미터 생성 헬퍼
  private buildQueryParams(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    skillName?: string
  ): string {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    
    if (skillName) {
      params.append('skillName', skillName);
    }

    return params.toString();
  }

  // 게시글 목록 조회 (페이징)
  async getAllPosts(
    page: number = BLOG_CONSTANTS.DEFAULT_PAGE,
    size: number = BLOG_CONSTANTS.DEFAULT_SIZE,
    sortBy: string = BLOG_CONSTANTS.DEFAULT_SORT_BY,
    sortDir: string = BLOG_CONSTANTS.DEFAULT_SORT_DIR,
    skillName?: string
  ): Promise<PostPageResponse> {
    try {
      const queryString = this.buildQueryParams(page, size, sortBy, sortDir, skillName);
      return await this.get<PostPageResponse>(`/api/post?${queryString}`);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `게시글 목록을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 페이지네이션과 함께 변환된 BlogPost 배열 반환
  async getBlogPosts(
    page: number = BLOG_CONSTANTS.DEFAULT_PAGE,
    size: number = BLOG_CONSTANTS.DEFAULT_SIZE,
    sortBy: string = BLOG_CONSTANTS.DEFAULT_SORT_BY,
    sortDir: string = BLOG_CONSTANTS.DEFAULT_SORT_DIR,
    skillName?: string
  ): Promise<BlogPostsWithPagination> {
    try {
      const response = await this.getAllPosts(page, size, sortBy, sortDir, skillName);
      const convertedPosts = this.convertPostResponsesToBlogPosts(response.posts);
      
      return {
        posts: convertedPosts,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      };
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `블로그 게시글을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 레거시 메서드 (기존 코드 호환성을 위해 유지)
  async getAll(): Promise<BlogPost[]> {
    try {
      const response = await this.getAllPosts(
        BLOG_CONSTANTS.DEFAULT_PAGE, 
        BLOG_CONSTANTS.LEGACY_SIZE
      );
      return this.convertPostResponsesToBlogPosts(response.posts);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `모든 게시글을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 게시글 상세 조회 (슬러그 기반)
  async getBySlug(slug: string): Promise<BlogPost | null> {
    if (!slug?.trim()) {
      throw new ApiError(400, 400, '슬러그가 유효하지 않습니다.');
    }

    try {
      const response = await this.get<PostDetailResponse>(`/api/post/slug/${encodeURIComponent(slug)}`);
      return this.convertPostDetailToBlogPost(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `게시글을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // ID로 조회 (레거시)
  async getById(id: string): Promise<BlogPost | null> {
    if (!id?.trim()) {
      throw new ApiError(400, 400, 'ID가 유효하지 않습니다.');
    }

    try {
      // ID를 이용한 직접 조회는 API에서 지원하지 않으므로 
      // 모든 게시글을 가져와서 클라이언트에서 필터링
      const posts = await this.getAll();
      return posts.find(p => p.id === id) || null;
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `게시글을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기술 스택 이름을 ID로 변환하는 헬퍼 메서드 (중복 제거)
  private async convertTechStackNamesToIds(techStackNames: string[]): Promise<number[]> {
    const skillIds: number[] = [];
    
    for (const skillName of techStackNames) {
      if (!skillName?.trim()) {
        continue;
      }
      
      try {
        const skillSearchResults = await this.get<SkillSearchResponse>(
          `/api/skill/search?keyword=${encodeURIComponent(skillName)}`
        );
        
        const matchedSkill = skillSearchResults.skills?.find(skill => 
          skill.skillName.toLowerCase() === skillName.toLowerCase()
        );
        
        if (matchedSkill) {
          skillIds.push(matchedSkill.id);
        }
      } catch (error) {
        throw new ApiError(0, 0, `기술 스택 '${skillName}' ID 조회에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    }
    
    return skillIds;
  }

  // 읽기 시간 포맷팅 헬퍼 메서드
  private formatReadTime(readTime: number): string {
    return `${readTime}${BLOG_CONSTANTS.READ_TIME_SUFFIX}`;
  }

  // 게시글 생성
  async createBlogPost(data: CreateBlogPostData): Promise<BlogPost> {
    if (!data.title?.trim() || !data.summary?.trim() || !data.content?.trim() || !data.slug?.trim()) {
      throw new ApiError(400, 400, '필수 필드가 누락되었습니다.');
    }

    try {
      // 기술 스택 이름을 ID로 변환
      const skillIds = data.techStack && data.techStack.length > 0 
        ? await this.convertTechStackNamesToIds(data.techStack)
        : [];

      const requestData: PostAddRequest = {
        title: data.title,
        summary: data.summary,
        content: data.content,
        readTime: this.formatReadTime(data.readTime),
        slug: data.slug,
        skills: skillIds,
        images: data.images || []
      };

      const response = await this.post<PostResponse>('/api/post', requestData, true);
      return this.convertPostResponseToBlogPost(response);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `게시글 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 게시글 수정
  async updateBlogPost(id: string, data: UpdateBlogPostData): Promise<BlogPost> {
    if (!id?.trim()) {
      throw new ApiError(400, 400, 'ID가 유효하지 않습니다.');
    }

    try {
      const requestData: PostUpdateRequest = {};
      
      if (data.title !== undefined) requestData.title = data.title;
      if (data.summary !== undefined) requestData.summary = data.summary;
      if (data.content !== undefined) requestData.content = data.content;
      if (data.readTime !== undefined) requestData.readTime = this.formatReadTime(data.readTime);
      if (data.images !== undefined) requestData.images = data.images;
      
      // 기술 스택 이름을 ID로 변환 (빈 배열 포함)
      if (data.techStack !== undefined) {
        const skillIds = data.techStack.length > 0 
          ? await this.convertTechStackNamesToIds(data.techStack)
          : [];
        
        requestData.skills = skillIds;
      }

      const response = await this.patch<PostResponse>(`/api/post/${encodeURIComponent(id)}`, requestData, true);
      return this.convertPostResponseToBlogPost(response);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `게시글 수정에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 레거시 메서드들 (기존 코드 호환성 유지)
  async create(data: CreateBlogPostData): Promise<BlogPost> {
    return this.createBlogPost(data);
  }

  async update(id: string, data: UpdateBlogPostData): Promise<BlogPost> {
    return this.updateBlogPost(id, data);
  }

  // 게시글 삭제
  async deleteBlogPost(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new ApiError(400, 400, 'ID가 유효하지 않습니다.');
    }

    try {
      await this.delete(`/api/post/${encodeURIComponent(id)}`, true);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `게시글 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기본 슬러그 생성 헬퍼 메서드
  private createBaseSlug(title: string): string {
    if (!title?.trim()) {
      throw new ApiError(400, 400, '제목이 유효하지 않습니다.');
    }

    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') // 시작과 끝의 하이픈 제거
      .trim();
  }

  // 슬러그 중복 검사
  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    if (!slug?.trim()) {
      throw new ApiError(400, 400, '슬러그가 유효하지 않습니다.');
    }

    try {
      const response = await this.get<PostSlugSearchResponse>(
        `/api/post/slug/search?keyword=${encodeURIComponent(slug)}`
      );
      
      // 정확히 일치하는 슬러그가 있는지 확인
      const exactMatch = response.slugs.some(existingSlug => existingSlug === slug);
      
      return exactMatch;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 0, `슬러그 중복 검사에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 슬러그 제안
  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.createBaseSlug(title);
    
    if (!baseSlug) {
      throw new ApiError(400, 400, '유효한 슬러그를 생성할 수 없습니다.');
    }

    try {
      // 기본 슬러그로 검색하여 유사한 슬러그들을 미리 가져옴
      const response = await this.get<PostSlugSearchResponse>(
        `/api/post/slug/search?keyword=${encodeURIComponent(baseSlug)}`
      );
      const existingSlugs = new Set(response.slugs);
      
      let uniqueSlug = baseSlug;
      let counter = 1;
      
      // 정확히 일치하는 슬러그가 있으면 숫자를 붙여서 제안
      while (existingSlugs.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      return uniqueSlug;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 0, `슬러그 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 슬러그 검색
  async searchSlugs(keyword: string): Promise<string[]> {
    if (!keyword?.trim()) {
      throw new ApiError(400, 400, '검색 키워드가 유효하지 않습니다.');
    }

    try {
      const response = await this.get<PostSlugSearchResponse>(
        `/api/post/slug/search?keyword=${encodeURIComponent(keyword)}`
      );
      return response.slugs;
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `슬러그 검색에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 레거시 메서드 (기존 코드 호환성 유지)
  async suggestSlug(title: string): Promise<string> {
    return this.generateUniqueSlug(title);
  }

  // URL 정규화 함수 (CloudFront URL에 https:// 추가)
  private normalizeImageUrl(url: string): string {
    if (!url?.trim()) {
      return '';
    }
    
    // 이미 완전한 URL인 경우
    if (url.startsWith(BLOG_CONSTANTS.URL_PROTOCOLS.HTTP) || 
        url.startsWith(BLOG_CONSTANTS.URL_PROTOCOLS.HTTPS)) {
      return url;
    }
    
    // CloudFront URL인 경우 https:// 추가
    if (url.startsWith(BLOG_CONSTANTS.CLOUDFRONT_INDICATORS.PREFIX) || 
        url.includes(BLOG_CONSTANTS.CLOUDFRONT_INDICATORS.DOMAIN)) {
      return `${BLOG_CONSTANTS.URL_PROTOCOLS.HTTPS}${url}`;
    }
    
    // 상대 경로인 경우 https:// 추가
    return `${BLOG_CONSTANTS.URL_PROTOCOLS.HTTPS}${url}`;
  }

  // 읽기 시간 파싱 헬퍼 메서드
  private parseReadTime(readTime: string): number {
    const numericValue = parseInt(readTime.replace(BLOG_CONSTANTS.READ_TIME_SUFFIX, ''), 10);
    return isNaN(numericValue) ? 0 : numericValue;
  }

  // 기술 스택 변환 헬퍼 메서드
  private convertSkillsToTechStack(skills: SkillResponse[]): string[] {
    return (skills || []).map(skill => skill.skillName);
  }

  // 이미지 URL 변환 헬퍼 메서드
  private convertImagesToUrls(images: PostImageResponse[]): string[] {
    return (images || []).map(img => this.normalizeImageUrl(img.uploadUrl));
  }

  // PostResponse를 BlogPost로 변환
  private convertPostResponseToBlogPost(post: PostResponse): BlogPost {
    return {
      id: post.id.toString(),
      title: post.title || '',
      summary: post.summary || '',
      content: '', // 목록에서는 content가 없음
      techStack: this.convertSkillsToTechStack(post.skills),
      readTime: this.parseReadTime(post.readTime),
      slug: post.slug || '',
      viewCount: post.view || 0,
      createdAt: post.createdAt || '',
      images: this.convertImagesToUrls(post.images)
    };
  }

  // PostDetailResponse를 BlogPost로 변환
  private convertPostDetailToBlogPost(post: PostDetailResponse): BlogPost {
    return {
      id: post.id.toString(),
      title: post.title || '',
      summary: post.summary || '',
      content: post.content || '',
      techStack: this.convertSkillsToTechStack(post.skills),
      readTime: this.parseReadTime(post.readTime),
      slug: post.slug || '',
      viewCount: post.view || 0,
      createdAt: post.createdAt || '',
      images: this.convertImagesToUrls(post.images)
    };
  }

  // PostResponse 배열을 BlogPost 배열로 변환
  private convertPostResponsesToBlogPosts(posts: PostResponse[]): BlogPost[] {
    if (!posts || !Array.isArray(posts)) {
      return [];
    }
    return posts.map(post => this.convertPostResponseToBlogPost(post));
  }
}

// 싱글톤 인스턴스 생성
export const blogService = new BlogService();
import { Project } from '@/types';
import { BaseApiService, ApiError, AuthenticationError } from './apiService';

// 상수 정의
export const PROJECT_CONSTANTS = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 12,
  LEGACY_SIZE: 100,
  URL_PROTOCOLS: {
    HTTP: 'http://',
    HTTPS: 'https://'
  },
  ISO_TIME_SUFFIX: 'T00:00:00.000Z',
  DEFAULT_SEARCH_PARAMS: {
    SORT_BY: 'startDate',
    SORT_DIR: 'desc'
  }
} as const;

// API 타입 정의
export interface ProjectResponse {
  id: number;
  title: string;
  summary: string;
  description: string;
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  demoUrl?: string;
  slug: string;
  skills: ProjectSkillResponse[];
  images: ProjectImageResponse[];
}

export interface ProjectDetailResponse {
  id: number;
  title: string;
  summary: string;
  description: string;
  content?: string;
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  demoUrl?: string;
  slug: string;
  skills: ProjectSkillResponse[];
  images: ProjectImageResponse[];
}

export interface ProjectSkillResponse {
  id: number;
  skillName: string;
  category: string;
  uploadUrl: string;
  createdAt: string;
}

export interface ProjectImageResponse {
  id: number;
  uploadUrl: string;
  altText?: string;
  displayOrder: number;
}

export interface ProjectPageResponse {
  projects: ProjectResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ProjectAddRequest {
  title: string;
  summary: string;
  content: string;
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  demoUrl?: string;
  slug: string;
  skillIds: number[];
  displayOrder: number[];
}

export interface ProjectUpdateRequest {
  title?: string;
  summary?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  githubUrl?: string;
  demoUrl?: string;
  skillIds?: number[];
  displayOrder?: number[];
}

export type CreateProjectData = Omit<Project, 'id'> & {
  slug: string;
  imageFiles?: File[];
};
export type UpdateProjectData = Partial<Omit<CreateProjectData, 'slug'>>;

export class ProjectService extends BaseApiService {
  constructor() {
    super();
  }

  // 쿼리 파라미터 생성 헬퍼
  private buildQueryParams(page: number, size: number): string {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    return params.toString();
  }

  // 검색 쿼리 파라미터 생성 헬퍼
  private buildSearchQueryParams(page: number, size: number, sortBy: string, sortDir: string, skillName?: string): string {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });
    
    if (skillName) {
      params.append('skillName', skillName);
    }
    
    return params.toString();
  }

  // 모든 프로젝트 조회 (페이징)
  async getAllProjects(
    page: number = PROJECT_CONSTANTS.DEFAULT_PAGE,
    size: number = PROJECT_CONSTANTS.DEFAULT_SIZE
  ): Promise<ProjectPageResponse> {
    try {
      const queryString = this.buildQueryParams(page, size);
      return await this.get<ProjectPageResponse>(`/api/project?${queryString}`);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트 목록을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 변환된 Project 배열 반환
  async getProjects(
    page: number = PROJECT_CONSTANTS.DEFAULT_PAGE,
    size: number = PROJECT_CONSTANTS.DEFAULT_SIZE
  ): Promise<{ projects: Project[], totalPages: number, totalElements: number }> {
    try {
      const response = await this.getAllProjects(page, size);
      const convertedProjects = this.convertProjectResponsesToProjects(response.projects);
      
      return {
        projects: convertedProjects,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      };
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트를 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 주요 프로젝트 조회
  async getFeaturedProjects(): Promise<Project[]> {
    try {
      const response = await this.get<{ projects: ProjectResponse[] }>('/api/project/featured');
      return this.convertProjectResponsesToProjects(response.projects);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `주요 프로젝트를 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 주요 프로젝트 업데이트
  async updateFeaturedProjects(projectIds: number[]): Promise<void> {
    if (!Array.isArray(projectIds)) {
      throw new ApiError(400, 400, '프로젝트 ID 배열이 유효하지 않습니다.');
    }

    try {
      const requestData = { projects: projectIds };
      await this.patch<void>('/api/project/featured', requestData, true);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `주요 프로젝트 업데이트에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 레거시 메서드 (기존 코드 호환성)
  async getAll(): Promise<Project[]> {
    try {
      const response = await this.getAllProjects(
        PROJECT_CONSTANTS.DEFAULT_PAGE,
        PROJECT_CONSTANTS.LEGACY_SIZE
      );
      return this.convertProjectResponsesToProjects(response.projects);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `모든 프로젝트를 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 슬러그로 프로젝트 조회
  async getBySlug(slug: string): Promise<Project | null> {
    if (!slug?.trim()) {
      throw new ApiError(400, 400, '슬러그가 유효하지 않습니다.');
    }

    try {
      const response = await this.get<ProjectDetailResponse>(`/api/project/slug/${encodeURIComponent(slug)}`);
      return this.convertProjectDetailResponseToProject(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트를 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // ID로 조회 (레거시)
  async getById(id: string): Promise<Project | null> {
    if (!id?.trim()) {
      throw new ApiError(400, 400, 'ID가 유효하지 않습니다.');
    }

    try {
      // ID를 이용한 직접 조회는 API에서 지원하지 않으므로 
      // 모든 프로젝트를 가져와서 클라이언트에서 필터링
      const projects = await this.getAll();
      return projects.find(p => p.id === id) || null;
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트를 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
        const skillSearchResults = await this.get<any>(
          `/api/skill/search?keyword=${encodeURIComponent(skillName)}`
        );
        
        const matchedSkill = skillSearchResults.skills?.find((skill: any) => 
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

  // 날짜를 ISO 형식으로 변환하는 헬퍼 메서드
  private formatDateToISO(dateString: string): string {
    return dateString + PROJECT_CONSTANTS.ISO_TIME_SUFFIX;
  }

  // FormData 준비 헬퍼 메서드
  private createProjectFormData(data: any, imageFiles?: File[]): FormData {
    const formData = new FormData();
    
    // data part를 application/json Content-Type으로 설정
    const dataBlob = new Blob([JSON.stringify(data)], {
      type: 'application/json'
    });
    formData.append('data', dataBlob);

    // 이미지 파일들 추가
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('files', file);
      });
    }
    
    return formData;
  }

  async create(data: CreateProjectData): Promise<Project> {
    if (!data.title?.trim() || !data.summary?.trim() || !data.slug?.trim()) {
      throw new ApiError(400, 400, '필수 필드가 누락되었습니다.');
    }

    try {
      // 기술 스택 이름을 ID로 변환
      const skillIds = data.techStack && data.techStack.length > 0 
        ? await this.convertTechStackNamesToIds(data.techStack)
        : [];

      // 프로젝트 데이터 (JSON 형태)
      const projectData = {
        title: data.title,
        summary: data.summary,
        content: data.description,
        startDate: this.formatDateToISO(data.startDate),
        endDate: data.endDate ? this.formatDateToISO(data.endDate) : undefined,
        githubUrl: data.githubUrl || undefined,
        demoUrl: data.demoUrl || undefined,
        slug: data.slug,
        skillIds: skillIds,
        displayOrder: data.imageFiles ? Array.from({ length: data.imageFiles.length }, (_, i) => i) : []
      };

      const formData = this.createProjectFormData(projectData, data.imageFiles);

      const result = await this.uploadFile<ProjectResponse>('/api/project', formData, true);
      return this.convertProjectResponseToProject(result);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    if (!id?.trim()) {
      throw new ApiError(400, 400, 'ID가 유효하지 않습니다.');
    }

    try {
      // 기술 스택 이름을 ID로 변환
      let skillIds: number[] = [];
      if (data.techStack !== undefined) {
        if (data.techStack.length > 0) {
          skillIds = await this.convertTechStackNamesToIds(data.techStack);
        }
        // 빈 배열도 포함하여 skillIds 설정
      }

      // 프로젝트 업데이트 데이터 준비
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.summary !== undefined) updateData.summary = data.summary;
      if (data.description !== undefined) updateData.content = data.description;
      if (data.startDate !== undefined) updateData.startDate = this.formatDateToISO(data.startDate);
      if (data.endDate !== undefined) updateData.endDate = this.formatDateToISO(data.endDate);
      if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
      if (data.demoUrl !== undefined) updateData.demoUrl = data.demoUrl;
      // 기술 스택이 전달된 경우 (빈 배열 포함) skillIds 설정
      if (data.techStack !== undefined) {
        updateData.skillIds = skillIds; // 빈 배열도 포함하여 전송
      }
      if (data.imageFiles !== undefined) {
        updateData.displayOrder = Array.from({ length: data.imageFiles.length }, (_, i) => i);
      }

      const formData = this.createProjectFormData(updateData, data.imageFiles);

      const result = await this.uploadFile<ProjectResponse>(`/api/project/${encodeURIComponent(id)}`, formData, true, 'PATCH');
      return this.convertProjectResponseToProject(result);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트 수정에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async deleteProject(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new ApiError(400, 400, 'ID가 유효하지 않습니다.');
    }

    try {
      await this.delete(`/api/project/${encodeURIComponent(id)}`, true);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 검색 및 필터링 (백엔드 API 사용)
  async search(query: string, techStack?: string[]): Promise<Project[]> {
    try {
      const response = await this.getAllProjects(
        PROJECT_CONSTANTS.DEFAULT_PAGE,
        PROJECT_CONSTANTS.LEGACY_SIZE
      );
      let filtered = this.convertProjectResponsesToProjects(response.projects);
      
      // 클라이언트 사이드에서 제목/요약 검색 필터링
      if (query?.trim()) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(project => 
          project.title.toLowerCase().includes(lowerQuery) ||
          project.summary.toLowerCase().includes(lowerQuery)
        );
      }
      
      // 기술 스택 필터링 (첫 번째 기술 스택으로 필터링)
      if (techStack && techStack.length > 0 && techStack[0]?.trim()) {
        const targetSkill = techStack[0].toLowerCase();
        filtered = filtered.filter(project =>
          project.techStack.some(skill => skill.toLowerCase().includes(targetSkill))
        );
      }
      
      return filtered;
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트 검색에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 진행중인 프로젝트 조회
  async getOngoing(): Promise<Project[]> {
    try {
      const response = await this.getAllProjects(
        PROJECT_CONSTANTS.DEFAULT_PAGE,
        PROJECT_CONSTANTS.LEGACY_SIZE
      );
      const projects = this.convertProjectResponsesToProjects(response.projects);
      return projects.filter(project => !project.endDate || project.endDate.trim() === '');
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `진행중인 프로젝트 조회에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 완료된 프로젝트 조회
  async getCompleted(): Promise<Project[]> {
    try {
      const response = await this.getAllProjects(
        PROJECT_CONSTANTS.DEFAULT_PAGE,
        PROJECT_CONSTANTS.LEGACY_SIZE
      );
      const projects = this.convertProjectResponsesToProjects(response.projects);
      return projects.filter(project => project.endDate && project.endDate.trim() !== '');
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `완료된 프로젝트 조회에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // Slug 중복 확인
  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    if (!slug?.trim()) {
      throw new ApiError(400, 400, '슬러그가 유효하지 않습니다.');
    }

    try {
      const response = await this.get<any>(`/api/project/search?keyword=${encodeURIComponent(slug)}`);
      const exactMatch = response.slugs?.some((existingSlug: string) => existingSlug === slug);
      return exactMatch || false;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 0, `슬러그 중복 검사에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
      .replace(/^-+|-+$/g, '') // 시작과 끝의 하이펜 제거
      .trim();
  }

  // Slug 제안
  async suggestSlug(title: string): Promise<string> {
    const baseSlug = this.createBaseSlug(title);
    
    if (!baseSlug) {
      throw new ApiError(400, 400, '유효한 슬러그를 생성할 수 없습니다.');
    }
    
    try {
      const response = await this.get<any>(`/api/project/search?keyword=${encodeURIComponent(baseSlug)}`);
      const existingSlugs = new Set(response.slugs || []);
      
      let suggestionSlug = baseSlug;
      let counter = 1;
      
      while (existingSlugs.has(suggestionSlug)) {
        suggestionSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      return suggestionSlug;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 0, `슬러그 제안에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 통계 데이터
  async getStats(): Promise<{
    totalProjects: number;
    ongoingProjects: number;
    completedProjects: number;
    topTechStacks: Array<{ tech: string; count: number }>;
  }> {
    try {
      const response = await this.getAllProjects(
        PROJECT_CONSTANTS.DEFAULT_PAGE,
        1000 // 모든 프로젝트 가져오기
      );
      const projects = this.convertProjectResponsesToProjects(response.projects);
      
      const totalProjects = projects.length;
      const ongoingProjects = projects.filter(p => !p.endDate || p.endDate.trim() === '').length;
      const completedProjects = projects.filter(p => p.endDate && p.endDate.trim() !== '').length;
      
      // 기술 스택 통계 생성
      const techStackStats = projects
        .flatMap(project => project.techStack.filter(tech => tech?.trim()))
        .reduce((acc, tech) => {
          acc[tech] = (acc[tech] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      
      const topTechStacks = Object.entries(techStackStats)
        .map(([tech, count]) => ({ tech, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalProjects,
        ongoingProjects,
        completedProjects,
        topTechStacks
      };
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로젝트 통계 조회에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // URL 정규화 헬퍼 메서드
  private normalizeImageUrl(url: string): string {
    if (!url?.trim()) {
      return '';
    }
    
    // 이미 완전한 URL인 경우
    if (url.startsWith(PROJECT_CONSTANTS.URL_PROTOCOLS.HTTP) || 
        url.startsWith(PROJECT_CONSTANTS.URL_PROTOCOLS.HTTPS)) {
      return url;
    }
    
    // 상대 경로인 경우 https:// 추가
    return `${PROJECT_CONSTANTS.URL_PROTOCOLS.HTTPS}${url}`;
  }

  // 이미지 URL 변환 헬퍼 메서드
  private convertImagesToUrls(images: ProjectImageResponse[]): string[] {
    return (images || [])
      .map(img => img.uploadUrl)
      .filter((url): url is string => url != null && typeof url === 'string' && url.trim() !== '')
      .map(url => this.normalizeImageUrl(url));
  }

  // 기술 스택 변환 헬퍼 메서드
  private convertSkillsToTechStack(skills: ProjectSkillResponse[]): string[] {
    return (skills || [])
      .map(skill => skill.skillName)
      .filter((name): name is string => name != null && typeof name === 'string' && name.trim() !== '');
  }

  // ProjectResponse를 Project로 변환
  private convertProjectResponseToProject(project: ProjectResponse): Project {
    return {
      id: project.id ? project.id.toString() : '',
      title: project.title || '',
      summary: project.summary || '',
      description: project.description || '',
      images: this.convertImagesToUrls(project.images),
      techStack: this.convertSkillsToTechStack(project.skills),
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      slug: project.slug || ''
    };
  }

  // ProjectDetailResponse를 Project로 변환 (content 포함)
  private convertProjectDetailResponseToProject(project: ProjectDetailResponse): Project {
    return {
      id: project.id ? project.id.toString() : '',
      title: project.title || '',
      summary: project.summary || '',
      description: project.content || project.description || '', // content가 있으면 content 사용, 없으면 description 사용
      images: this.convertImagesToUrls(project.images),
      techStack: this.convertSkillsToTechStack(project.skills),
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      slug: project.slug || ''
    };
  }

  // ProjectResponse 배열을 Project 배열로 변환
  private convertProjectResponsesToProjects(projects: ProjectResponse[]): Project[] {
    if (!projects || !Array.isArray(projects)) {
      return [];
    }
    return projects.map(project => this.convertProjectResponseToProject(project));
  }
}

// 싱글톤 인스턴스 생성
export const projectService = new ProjectService();
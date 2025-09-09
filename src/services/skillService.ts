import { BaseApiService, ApiError, AuthenticationError } from './apiService';

// 상수 정의
export const SKILL_CONSTANTS = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 12,
  LEGACY_SIZE: 100,
  SUPPORTED_IMAGE_TYPES: {
    PNG: 'image/png',
    JPG: 'image/jpeg',
    JPEG: 'image/jpeg',
    GIF: 'image/gif',
    SVG: 'image/svg+xml',
    WEBP: 'image/webp'
  },
  DEFAULT_MIME_TYPE: 'image/png',
  FILE_EXTENSIONS: {
    PNG: 'png',
    JPG: 'jpg',
    JPEG: 'jpeg',
    GIF: 'gif',
    SVG: 'svg',
    WEBP: 'webp'
  }
} as const;

// API 타입 정의
export interface SkillResponse {
  id: number;
  skillName: string;
  category: string;
  uploadUrl: string;
  createdAt: string;
}

export interface SkillPageResponse {
  skills: SkillResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface SkillAddRequest {
  skillName: string;
  category: string;
}

export interface SkillUpdateRequest {
  skillName?: string;
  category?: string;
}

export interface SkillCategoryResponse {
  categories: string[];
}

export interface SkillListResponse {
  skills: SkillResponse[];
}

export class SkillService extends BaseApiService {
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

  // 모든 기술 스택 조회 (페이징)
  async getAllSkills(
    page: number = SKILL_CONSTANTS.DEFAULT_PAGE,
    size: number = SKILL_CONSTANTS.DEFAULT_SIZE
  ): Promise<SkillPageResponse> {
    try {
      const queryString = this.buildQueryParams(page, size);
      return await this.get<SkillPageResponse>(`/api/skill?${queryString}`);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `기술 스택 목록을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 관리자 기술 스택 조회
  async getAdminSkills(): Promise<SkillListResponse> {
    try {
      return await this.get<SkillListResponse>('/api/skill/admin');
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `관리자 기술 스택을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기술 스택 카테고리 목록 조회
  async getCategories(): Promise<SkillCategoryResponse> {
    try {
      return await this.get<SkillCategoryResponse>('/api/skill/category');
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `카테고리 목록을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 카테고리별 기술 스택 조회
  async getSkillsByCategory(
    category: string,
    page: number = SKILL_CONSTANTS.DEFAULT_PAGE,
    size: number = SKILL_CONSTANTS.DEFAULT_SIZE
  ): Promise<SkillPageResponse> {
    if (!category?.trim()) {
      throw new ApiError(400, 400, '카테고리가 유효하지 않습니다.');
    }

    try {
      const queryString = this.buildQueryParams(page, size);
      return await this.get<SkillPageResponse>(`/api/skill/category/${encodeURIComponent(category)}?${queryString}`);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `카테고리별 기술 스택을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기술 스택 검색
  async searchSkills(keyword: string): Promise<SkillListResponse> {
    if (!keyword?.trim()) {
      throw new ApiError(400, 400, '검색 키워드가 유효하지 않습니다.');
    }

    try {
      return await this.get<SkillListResponse>(`/api/skill/search?keyword=${encodeURIComponent(keyword)}`);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `기술 스택 검색에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // MIME 타입 추론 헬퍼 메서드
  private inferMimeTypeFromExtension(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const typeMap: Record<string, string> = {
      [SKILL_CONSTANTS.FILE_EXTENSIONS.PNG]: SKILL_CONSTANTS.SUPPORTED_IMAGE_TYPES.PNG,
      [SKILL_CONSTANTS.FILE_EXTENSIONS.JPG]: SKILL_CONSTANTS.SUPPORTED_IMAGE_TYPES.JPG,
      [SKILL_CONSTANTS.FILE_EXTENSIONS.JPEG]: SKILL_CONSTANTS.SUPPORTED_IMAGE_TYPES.JPEG,
      [SKILL_CONSTANTS.FILE_EXTENSIONS.GIF]: SKILL_CONSTANTS.SUPPORTED_IMAGE_TYPES.GIF,
      [SKILL_CONSTANTS.FILE_EXTENSIONS.SVG]: SKILL_CONSTANTS.SUPPORTED_IMAGE_TYPES.SVG,
      [SKILL_CONSTANTS.FILE_EXTENSIONS.WEBP]: SKILL_CONSTANTS.SUPPORTED_IMAGE_TYPES.WEBP
    };
    
    return typeMap[ext || ''] || SKILL_CONSTANTS.DEFAULT_MIME_TYPE;
  }

  // 파일 전처리 헬퍼 메서드
  private processFile(file: File): File {
    if (!file) {
      throw new ApiError(400, 400, '파일이 유효하지 않습니다.');
    }

    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      mimeType = this.inferMimeTypeFromExtension(file.name);
    }
    
    return new File([file], file.name, { type: mimeType });
  }

  // FormData 준비 헬퍼 메서드
  private createSkillFormData(data: SkillAddRequest | SkillUpdateRequest, file?: File): FormData {
    const formData = new FormData();
    
    // JSON 데이터 추가
    const dataBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('data', dataBlob);
    
    // 파일 추가 (있는 경우)
    if (file) {
      const processedFile = this.processFile(file);
      formData.append('file', processedFile);
    }
    
    return formData;
  }

  // 기술 스택 추가
  async addSkill(data: SkillAddRequest, file: File): Promise<SkillResponse> {
    if (!data.skillName?.trim() || !data.category?.trim()) {
      throw new ApiError(400, 400, '필수 필드가 누락되었습니다.');
    }

    try {
      const formData = this.createSkillFormData(data, file);
      return await this.uploadFile<SkillResponse>('/api/skill', formData, true);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `기술 스택 추가에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기술 스택 수정
  async updateSkill(id: number, data: SkillUpdateRequest, file?: File): Promise<SkillResponse> {
    if (!id || id <= 0) {
      throw new ApiError(400, 400, 'ID가 유효하지 않습니다.');
    }

    try {
      const formData = this.createSkillFormData(data, file);
      return await this.uploadFile<SkillResponse>(`/api/skill/${id}`, formData, true, 'PATCH');
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `기술 스택 수정에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기술 스택 삭제
  async deleteSkill(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new ApiError(400, 400, 'ID가 유효하지 않습니다.');
    }

    try {
      await this.delete(`/api/skill/${id}`, true);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `기술 스택 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 레거시 메서드 (기존 코드 호환성)
  async getAll(): Promise<SkillResponse[]> {
    try {
      const response = await this.getAllSkills(
        SKILL_CONSTANTS.DEFAULT_PAGE,
        SKILL_CONSTANTS.LEGACY_SIZE
      );
      return response.skills;
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `모든 기술 스택을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
}

// 싱글톤 인스턴스 생성
export const skillService = new SkillService();
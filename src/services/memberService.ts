import { UserInfo } from '@/types';
import { BaseApiService, ApiError, AuthenticationError } from './apiService';

// 상수 정의
export const MEMBER_CONSTANTS = {
  URL_PROTOCOLS: {
    HTTP: 'http://',
    HTTPS: 'https://'
  },
  DEFAULT_VALUES: {
    EMPTY_STRING: '',
    EMPTY_ARRAY: [] as string[],
    EMPTY_FEATURED_PROJECTS: [] as any[]
  }
} as const;

// API 타입 정의
export interface MemberProfileResponse {
  id: number;
  name: string;
  description: string;
  githubUrl: string;
  emailUrl: string;
  profileUrl: string;
  memberSkills: MemberSkillResponse[];
}

export interface MemberSkillResponse {
  id: number;
  skillName: string;
  category: string;
  uploadUrl: string;
  createdAt: string;
}

export interface MemberUpdateRequest {
  name?: string;
  description?: string;
  githubUrl?: string;
  emailUrl?: string;
  profileUrl?: string;
  s3Key?: string;
}

export interface MemberSkillUpdateRequest {
  skillIds: number[];
}

export interface MemberSkillAddRequest {
  skillIds: number[];
}

export interface MemberProfileUploadResponse {
  profileUrl: string;
  s3Key: string;
}

export class MemberService extends BaseApiService {
  constructor() {
    super();
  }

  // URL 정규화 헬퍼 메서드
  private normalizeImageUrl(url: string | null | undefined): string {
    if (!url?.trim()) {
      return MEMBER_CONSTANTS.DEFAULT_VALUES.EMPTY_STRING;
    }
    
    // 이미 완전한 URL인 경우
    if (url.startsWith(MEMBER_CONSTANTS.URL_PROTOCOLS.HTTP) || 
        url.startsWith(MEMBER_CONSTANTS.URL_PROTOCOLS.HTTPS)) {
      return url;
    }
    
    // 상대 경로인 경우 https:// 추가
    return `${MEMBER_CONSTANTS.URL_PROTOCOLS.HTTPS}${url}`;
  }

  // 프로필 조회
  async getProfile(): Promise<UserInfo> {
    try {
      const response = await this.get<MemberProfileResponse>('/api/member/profile');
      return this.convertMemberProfileToUserInfo(response);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로필을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 프로필 수정
  async updateProfile(data: MemberUpdateRequest): Promise<UserInfo> {
    if (!data || typeof data !== 'object') {
      throw new ApiError(400, 400, '업데이트 데이터가 유효하지 않습니다.');
    }

    try {
      const response = await this.patch<MemberProfileResponse>('/api/member/profile', data, true);
      return this.convertMemberProfileToUserInfo(response);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로필 수정에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 프로필 이미지 업로드
  async uploadProfileImage(file: File): Promise<MemberProfileUploadResponse> {
    if (!file) {
      throw new ApiError(400, 400, '파일이 유효하지 않습니다.');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      return await this.uploadFile<MemberProfileUploadResponse>('/api/member/upload', formData, true);
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로필 이미지 업로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기술 스택 수정 (PUT 요청)
  async updateSkills(skillIds: number[]): Promise<MemberSkillResponse[]> {
    if (!Array.isArray(skillIds)) {
      throw new ApiError(400, 400, '기술 스택 ID 배열이 유효하지 않습니다.');
    }

    try {
      const requestData: MemberSkillUpdateRequest = { skillIds };
      const response = await this.put<{ skills: MemberSkillResponse[] }>('/api/member/skill', requestData, true);
      return response.skills;
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `기술 스택 수정에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기술 스택 추가 (POST 요청)
  async addSkills(skillIds: number[]): Promise<MemberSkillResponse[]> {
    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      throw new ApiError(400, 400, '추가할 기술 스택 ID 배열이 유효하지 않습니다.');
    }

    try {
      const requestData: MemberSkillAddRequest = { skillIds };
      const response = await this.post<{ skills: MemberSkillResponse[] }>('/api/member/skill', requestData, true);
      return response.skills;
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApiError(0, 0, `기술 스택 추가에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 기술 스택 변환 헬퍼 메서드
  private convertMemberSkillsToTechStack(memberSkills: MemberSkillResponse[]): string[] {
    return (memberSkills || MEMBER_CONSTANTS.DEFAULT_VALUES.EMPTY_ARRAY)
      .map(skill => skill.skillName)
      .filter((name): name is string => name != null && typeof name === 'string' && name.trim() !== '');
  }

  // 기술 스택 아이콘 변환 헬퍼 메서드
  private convertMemberSkillsToTechStackWithIcons(memberSkills: MemberSkillResponse[]): Array<{name: string; iconUrl: string}> {
    return (memberSkills || MEMBER_CONSTANTS.DEFAULT_VALUES.EMPTY_ARRAY)
      .filter(skill => skill.skillName?.trim())
      .map(skill => ({
        name: skill.skillName,
        iconUrl: this.normalizeImageUrl(skill.uploadUrl)
      }));
  }

  // MemberProfileResponse를 UserInfo로 변환
  private convertMemberProfileToUserInfo(profile: MemberProfileResponse): UserInfo {
    if (!profile) {
      throw new ApiError(400, 400, '프로필 데이터가 유효하지 않습니다.');
    }

    const memberSkills = profile.memberSkills || [];
    
    return {
      name: profile.name || MEMBER_CONSTANTS.DEFAULT_VALUES.EMPTY_STRING,
      introduction: profile.description || MEMBER_CONSTANTS.DEFAULT_VALUES.EMPTY_STRING,
      githubUrl: profile.githubUrl || MEMBER_CONSTANTS.DEFAULT_VALUES.EMPTY_STRING,
      email: profile.emailUrl || MEMBER_CONSTANTS.DEFAULT_VALUES.EMPTY_STRING,
      profileImageUrl: this.normalizeImageUrl(profile.profileUrl),
      techStack: this.convertMemberSkillsToTechStack(memberSkills),
      featuredProjects: MEMBER_CONSTANTS.DEFAULT_VALUES.EMPTY_FEATURED_PROJECTS, // 프로필 API에서는 featured projects 정보가 없으므로 빈 배열
      techStackWithIcons: this.convertMemberSkillsToTechStackWithIcons(memberSkills)
    };
  }

  // 레거시 지원을 위한 메서드 (기존 코드와 호환성)
  convertToUserInfo(profile: MemberProfileResponse): UserInfo {
    try {
      return this.convertMemberProfileToUserInfo(profile);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 0, `프로필 변환에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
}

// 싱글톤 인스턴스 생성
export const memberService = new MemberService();
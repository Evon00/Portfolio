import { BaseApiService } from './apiService';

// 통계 API 응답 타입 정의 (API Schema 기반)
export interface SummaryStatsResponse {
  totalPosts: number;
  totalProjects: number;
  totalViews: number;
  avgViews: number;
}

export interface PostDataResponse {
  slug: string;
  title: string;
  view: number;
}

export interface PopularSkillResponse {
  skillName: string;
  count: number;
}

export interface PostStatsResponse {
  posts: PostDataResponse[];
}

export interface SkillStatResponse {
  skills: PopularSkillResponse[];
}

// 대시보드에서 사용할 통합 인터페이스
export interface DashboardStats {
  summary: SummaryStatsResponse;
  recentPosts: PostDataResponse[];
  popularPosts: PostDataResponse[];
  topTechStacks: PopularSkillResponse[];
}

export interface AdminStats {
  totalMembers: number;
  totalSkills: number;
  monthlyStats: Array<{
    month: string;
    posts: number;
    projects: number;
    views: number;
  }>;
}

export class StatisticsService extends BaseApiService {
  constructor() {
    super();
  }

  // 통계 요약 정보 조회
  async getStatsSummary(): Promise<SummaryStatsResponse> {
    try {
      return await this.get<SummaryStatsResponse>('/api/stats/summary', true);
    } catch (error) {
      console.error('통계 요약 조회 실패:', error);
      throw error;
    }
  }

  // 인기 게시글 조회
  async getPopularPosts(): Promise<PostDataResponse[]> {
    try {
      const response = await this.get<PostStatsResponse>('/api/stats/posts/popular', true);
      return response.posts;
    } catch (error) {
      console.error('인기 게시글 조회 실패:', error);
      throw error;
    }
  }

  // 최근 게시글 조회
  async getRecentPosts(): Promise<PostDataResponse[]> {
    try {
      const response = await this.get<PostStatsResponse>('/api/stats/posts/recent', true);
      return response.posts;
    } catch (error) {
      console.error('최근 게시글 조회 실패:', error);
      throw error;
    }
  }

  // 인기 기술 스택 조회
  async getPopularSkills(): Promise<PopularSkillResponse[]> {
    try {
      const response = await this.get<SkillStatResponse>('/api/stats/skills/popular', true);
      return response.skills;
    } catch (error) {
      console.error('인기 기술 스택 조회 실패:', error);
      throw error;
    }
  }

  // 대시보드 통계 조회 (모든 데이터를 한번에)
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // 각 API를 개별적으로 호출하여 어떤 API에서 오류가 발생하는지 확인
      let summary: SummaryStatsResponse;
      let recentPosts: PostDataResponse[] = [];
      let popularPosts: PostDataResponse[] = [];
      let topTechStacks: PopularSkillResponse[] = [];

      try {
        summary = await this.getStatsSummary();
      } catch (error) {
        console.error('Failed to load summary stats:', error);
        throw new Error(`요약 통계 로드 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      try {
        recentPosts = await this.getRecentPosts();
      } catch (error) {
        console.error('Failed to load recent posts:', error);
        // 비중요 데이터는 비운 배열로 처리
      }

      try {
        popularPosts = await this.getPopularPosts();
      } catch (error) {
        console.error('Failed to load popular posts:', error);
      }

      try {
        topTechStacks = await this.getPopularSkills();
      } catch (error) {
        console.error('Failed to load popular skills:', error);
      }

      return {
        summary,
        recentPosts,
        popularPosts,
        topTechStacks
      };
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      throw error;
    }
  }

  // 관리자 통계 조회 (추가 기능용)
  async getAdminStats(): Promise<AdminStats> {
    try {
      return await this.get<AdminStats>('/api/admin/stats');
    } catch (error) {
      console.error('관리자 통계 조회 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const statisticsService = new StatisticsService();
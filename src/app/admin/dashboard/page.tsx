'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { statisticsService, type DashboardStats } from '@/services/statisticsService';

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 대시보드 데이터 로드
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const stats = await statisticsService.getDashboardStats();
        setDashboardStats(stats);
      } catch (err) {
        console.error('대시보드 통계 로드 실패:', err);
        setError(err instanceof Error ? err.message : '통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  // 로딩 상태
  if (loading) {
    return (
      <AdminLayout title="대시보드">
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="linear-text-regular">통계 데이터를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <AdminLayout title="대시보드">
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="linear-text-regular text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="linear-button-primary"
            >
              다시 시도
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 통계 데이터가 없는 경우
  if (!dashboardStats) {
    return (
      <AdminLayout title="대시보드">
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-4xl mb-4 opacity-50">📊</div>
            <p className="linear-text-regular opacity-60">통계 데이터를 사용할 수 없습니다.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="대시보드">
      <div className="p-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="linear-card p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-accent-primary)', opacity: 0.1 }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>총 블로그 포스트</p>
                <p className="linear-title-3">{dashboardStats.summary.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="linear-card p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-accent-primary)', opacity: 0.1 }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>총 프로젝트</p>
                <p className="linear-title-3">{dashboardStats.summary.totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="linear-card p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-accent-primary)', opacity: 0.1 }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>총 조회수</p>
                <p className="linear-title-3">{dashboardStats.summary.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="linear-card p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-accent-primary)', opacity: 0.1 }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>평균 조회수</p>
                <p className="linear-title-3">{dashboardStats.summary.avgViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 게시글 */}
          <div className="linear-card">
            <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="linear-text-large">최근 게시글</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardStats.recentPosts.length > 0 ? dashboardStats.recentPosts.map((post, index) => (
                  <div key={`recent-${post.slug}-${index}`} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="linear-text-regular truncate">
                        {post.title}
                      </h3>
                      <p className="linear-text-small mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        슬러그: {post.slug}
                      </p>
                    </div>
                    <div className="ml-4 linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                      {post.view.toLocaleString()} 조회
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="linear-text-regular opacity-60">게시글이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 인기 게시글 */}
          <div className="linear-card">
            <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="linear-text-large">인기 게시글</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardStats.popularPosts.length > 0 ? dashboardStats.popularPosts.map((post, index) => (
                  <div key={`popular-${post.slug}-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}>
                        {index + 1}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="linear-text-regular truncate">
                          {post.title}
                        </h3>
                        <p className="linear-text-small mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                          슬러그: {post.slug}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                      {post.view.toLocaleString()} 조회
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="linear-text-regular opacity-60">게시글이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 기술 스택 통계 */}
          <div className="linear-card">
            <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="linear-text-large">인기 기술 스택</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardStats.topTechStacks.length > 0 ? dashboardStats.topTechStacks.map((tech) => (
                  <div key={tech.skillName} className="flex items-center justify-between">
                    <span className="linear-text-regular">{tech.skillName}</span>
                    <div className="flex items-center">
                      <div className="w-20 rounded-full h-2 mr-3" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            backgroundColor: 'var(--color-accent-primary)',
                            width: `${dashboardStats.topTechStacks[0] ? (tech.count / dashboardStats.topTechStacks[0].count) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>{tech.count}개</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="linear-text-regular opacity-60">기술 스택 데이터가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="linear-card">
            <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="linear-text-large">빠른 액션</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                  <svg className="w-8 h-8 mb-2" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="linear-text-small">새 포스트</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                  <svg className="w-8 h-8 mb-2" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="linear-text-small">새 프로젝트</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { UserInfo, Project, TechStackId, ProjectId } from '@/types';
import AdminLayout from '@/components/admin/AdminLayout';
import ProfileImageUpload from '@/components/common/ProfileImageUpload';
import TechStackSelector from '@/components/common/TechStackSelector';
import { memberService } from '@/services/memberService';
import { projectService } from '@/services/projectService';
import { skillService } from '@/services/skillService';

const PROJECTS_PER_PAGE = 6;

export default function ProfileManagePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  // 기본 정보 상태
  const [basicInfoLoading, setBasicInfoLoading] = useState(false);
  const [basicFormData, setBasicFormData] = useState({
    name: '',
    introduction: '',
    githubUrl: '',
    email: '',
    profileImageUrl: '',
    s3Key: ''
  });
  const [originalBasicFormData, setOriginalBasicFormData] = useState({
    name: '',
    introduction: '',
    githubUrl: '',
    email: '',
    profileImageUrl: '',
    s3Key: ''
  });
  
  // 기술 스택 상태
  const [techStackLoading, setTechStackLoading] = useState(false);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [originalTechStack, setOriginalTechStack] = useState<string[]>([]);
  
  // 주요 프로젝트 상태
  const [projectsUpdateLoading, setProjectsUpdateLoading] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<string[]>([]);
  const [originalFeaturedProjects, setOriginalFeaturedProjects] = useState<string[]>([]);

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await memberService.getProfile();
        setUserInfo(profile);
        const formData = {
          name: profile.name,
          introduction: profile.introduction,
          githubUrl: profile.githubUrl,
          email: profile.email,
          profileImageUrl: profile.profileImageUrl || '',
          s3Key: '' // 초기 로드 시 s3Key는 알 수 없으므로 빈 문자열
        };
        setBasicFormData(formData);
        setOriginalBasicFormData(formData);
        setTechStack(profile.techStack);
        setOriginalTechStack(profile.techStack);
      } catch (error) {
        console.error('프로필 로드 실패:', error);
        alert('프로필을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  // 프로젝트 데이터 로드
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const response = await projectService.getProjects(currentPage - 1, PROJECTS_PER_PAGE);
        setProjects(response.projects);
        setTotalPages(response.totalPages);
        
        // 주요 프로젝트 ID 추출 (isFeatured가 true인 프로젝트들)
        // 하지만 현재 페이지의 프로젝트만으로는 모든 주요 프로젝트를 알 수 없으므로
        // 별도로 주요 프로젝트 조회 필요
        if (currentPage === 1) { // 첫 페이지 로드 시에만 주요 프로젝트 조회
          const featuredProjectsData = await projectService.getFeaturedProjects();
          const featuredProjectIds = featuredProjectsData.map(p => p.id);
          setFeaturedProjects(featuredProjectIds);
          setOriginalFeaturedProjects(featuredProjectIds);
        }
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
        alert('프로젝트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [currentPage]);

  const handleBasicInputChange = (field: keyof typeof basicFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBasicFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleProfileImageChange = (imageUrl: string, s3Key?: string) => {
    const newFormData = {
      ...basicFormData,
      profileImageUrl: imageUrl,
      s3Key: s3Key || basicFormData.s3Key // 새 s3Key가 있으면 사용, 없으면 기존 값 유지
    };
    setBasicFormData(newFormData);
    
    // 이미지 업로드 후에는 원본 데이터를 업데이트하지 않음
    // 사용자가 명시적으로 "저장" 버튼을 눌러야 프로필에 반영됨
  };

  const handleProfileImageRemove = () => {
    setBasicFormData(prev => ({
      ...prev,
      profileImageUrl: '',
      s3Key: ''
    }));
    // 이미지 제거는 UI에서만의 변경이므로 원본 데이터는 유지
  };

  const handleTechStackChange = (newTechStack: string[]) => {
    setTechStack(newTechStack);
  };

  const toggleFeaturedProject = (projectId: string) => {
    setFeaturedProjects(prev => {
      if (prev.includes(projectId)) {
        // 선택 해제
        return prev.filter(id => id !== projectId);
      } else {
        // 선택 - 최대 3개까지만
        if (prev.length >= 3) {
          alert('주요 프로젝트는 최대 3개까지만 선택할 수 있습니다.');
          return prev;
        }
        return [...prev, projectId];
      }
    });
  };

  // 현재 페이지의 프로젝트들
  const currentProjects = projects;

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 프로젝트 선정 섹션으로 스크롤
    const element = document.getElementById('featured-projects-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 기본 정보 저장
  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!basicFormData.name.trim() || !basicFormData.introduction.trim() || !basicFormData.email.trim()) {
      alert('이름, 소개글, 이메일은 필수 입력 항목입니다.');
      return;
    }

    setBasicInfoLoading(true);

    try {
      // 변경된 필드만 포함하는 객체 생성
      const updateData: {
        name?: string;
        description?: string;
        githubUrl?: string;
        emailUrl?: string;
        profileUrl?: string;
        s3Key?: string;
      } = {};
      
      if (basicFormData.name !== originalBasicFormData.name) {
        updateData.name = basicFormData.name;
      }
      if (basicFormData.introduction !== originalBasicFormData.introduction) {
        updateData.description = basicFormData.introduction;
      }
      if (basicFormData.githubUrl !== originalBasicFormData.githubUrl) {
        updateData.githubUrl = basicFormData.githubUrl;
      }
      if (basicFormData.email !== originalBasicFormData.email) {
        updateData.emailUrl = basicFormData.email;
      }
      if (basicFormData.profileImageUrl !== originalBasicFormData.profileImageUrl) {
        updateData.profileUrl = basicFormData.profileImageUrl;
      }
      if (basicFormData.s3Key !== originalBasicFormData.s3Key && basicFormData.s3Key) {
        updateData.s3Key = basicFormData.s3Key;
      }
      
      // 변경된 필드가 없으면 알림
      if (Object.keys(updateData).length === 0) {
        alert('변경된 정보가 없습니다.');
        return;
      }
      
      const updatedUserInfo = await memberService.updateProfile(updateData);

      setUserInfo(updatedUserInfo);
      // 업데이트 성공 시 원본 데이터도 현재 데이터로 업데이트
      setOriginalBasicFormData({ ...basicFormData });
      alert('기본 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('기본 정보 수정 실패:', error);
      alert('기본 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setBasicInfoLoading(false);
    }
  };

  // 기술 스택 저장
  const handleTechStackSubmit = async () => {
    setTechStackLoading(true);

    try {
      // 기술 스택 이름을 ID로 변환
      const skillIds: number[] = [];
      
      for (const skillName of techStack) {
        try {
          const searchResult = await skillService.searchSkills(skillName);
          const matchedSkill = searchResult.skills.find(skill => 
            skill.skillName.toLowerCase() === skillName.toLowerCase()
          );
          if (matchedSkill) {
            skillIds.push(matchedSkill.id);
          }
        } catch (error) {
          console.warn(`기술 스택 '${skillName}' ID 조회 실패:`, error);
        }
      }

      // 기술 스택 업데이트
      await memberService.updateSkills(skillIds);
      
      // 원본 기술 스택 업데이트 (변경사항 추적용)
      setOriginalTechStack(techStack);
      
      // 사용자 정보 업데이트
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          techStack: techStack as TechStackId[]
        });
      }
      
      alert('기술 스택이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('기술 스택 수정 실패:', error);
      alert('기술 스택 수정 중 오류가 발생했습니다.');
    } finally {
      setTechStackLoading(false);
    }
  };

  // 주요 프로젝트 저장
  const handleFeaturedProjectsSubmit = async () => {
    // 변경사항이 없으면 알림
    const hasChanges = JSON.stringify(featuredProjects.sort()) !== JSON.stringify(originalFeaturedProjects.sort());
    if (!hasChanges) {
      alert('변경된 주요 프로젝트가 없습니다.');
      return;
    }

    setProjectsUpdateLoading(true);

    try {
      // 프로젝트 ID를 숫자 배열로 변환
      const projectIds = featuredProjects.map(id => parseInt(id, 10));
      
      await projectService.updateFeaturedProjects(projectIds);
      
      // 원본 상태 업데이트 (변경사항 추적용)
      setOriginalFeaturedProjects([...featuredProjects]);
      
      // 사용자 정보 업데이트
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          featuredProjects: featuredProjects as ProjectId[]
        });
      }
      
      alert('주요 프로젝트가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('주요 프로젝트 수정 실패:', error);
      alert('주요 프로젝트 수정 중 오류가 발생했습니다.');
    } finally {
      setProjectsUpdateLoading(false);
    }
  };

  // 로딩 중인 경우
  if (isLoadingProfile) {
    return (
      <AdminLayout title="프로필 관리">
        <div className="p-6">
          <div className="linear-card p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">👤</div>
            <p className="linear-text-large" style={{ color: 'var(--color-text-secondary)' }}>
              프로필 정보를 불러오는 중...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 프로필을 불러오지 못한 경우
  if (!userInfo) {
    return (
      <AdminLayout title="프로필 관리">
        <div className="p-6">
          <div className="linear-card p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">⚠️</div>
            <p className="linear-text-large" style={{ color: 'var(--color-text-secondary)' }}>
              프로필 정보를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="프로필 관리">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="linear-title-2 mb-2">프로필 관리</h1>
            <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>
              메인 페이지에 표시될 개인 정보를 관리합니다.
            </p>
          </div>

          <div className="space-y-6">
            {/* 기본 정보 */}
            <form onSubmit={handleBasicInfoSubmit} className="linear-card p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="linear-title-4">기본 정보</h2>
                <button
                  type="submit"
                  className="linear-button-primary"
                  disabled={basicInfoLoading}
                >
                  {basicInfoLoading ? '저장 중...' : '기본 정보 저장'}
                </button>
              </div>
              
              {/* 이름 */}
              <div>
                <label className="block linear-text-small font-medium mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  value={basicFormData.name}
                  onChange={handleBasicInputChange('name')}
                  className="linear-input w-full"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              {/* 소개글 */}
              <div>
                <label className="block linear-text-small font-medium mb-2">
                  소개글 *
                </label>
                <textarea
                  value={basicFormData.introduction}
                  onChange={handleBasicInputChange('introduction')}
                  className="linear-input w-full"
                  rows={4}
                  placeholder="자기소개를 입력하세요"
                  required
                />
              </div>

              {/* 연락처 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block linear-text-small font-medium mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={basicFormData.email}
                    onChange={handleBasicInputChange('email')}
                    className="linear-input w-full"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block linear-text-small font-medium mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={basicFormData.githubUrl}
                    onChange={handleBasicInputChange('githubUrl')}
                    className="linear-input w-full"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              {/* 프로필 이미지 */}
              <div>
                <label className="block linear-text-small font-medium mb-2">
                  프로필 이미지
                </label>
                <ProfileImageUpload
                  currentImage={basicFormData.profileImageUrl}
                  onImageChange={handleProfileImageChange}
                  onImageRemove={handleProfileImageRemove}
                />
              </div>
            </form>

            {/* 기술 스택 관리 */}
            <div className="linear-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="linear-title-4">기술 스택</h2>
                <button
                  type="button"
                  onClick={handleTechStackSubmit}
                  className="linear-button-primary"
                  disabled={techStackLoading}
                >
                  {techStackLoading ? '저장 중...' : '기술 스택 저장'}
                </button>
              </div>
              
              <TechStackSelector
                selectedTechStacks={techStack}
                onTechStackChange={handleTechStackChange}
                placeholder="기술 스택을 검색하여 추가하세요"
              />
            </div>

            {/* 주요 프로젝트 선정 */}
            <div id="featured-projects-section" className="linear-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="linear-title-4">주요 프로젝트 선정</h2>
                <button
                  type="button"
                  onClick={handleFeaturedProjectsSubmit}
                  className="linear-button-primary"
                  disabled={projectsUpdateLoading}
                >
                  {projectsUpdateLoading ? '저장 중...' : '주요 프로젝트 저장'}
                </button>
              </div>
              <p className="linear-text-small mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                메인 페이지에 표시할 주요 프로젝트를 선택하세요. (최대 3개)
              </p>
              
              {isLoadingProjects ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 linear-text-regular">프로젝트를 불러오는 중...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {currentProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                        style={{ 
                          backgroundColor: featuredProjects.includes(project.id) 
                            ? 'var(--color-bg-tertiary)' 
                            : 'var(--color-bg-secondary)',
                          borderColor: featuredProjects.includes(project.id)
                            ? 'var(--color-accent-primary)'
                            : 'var(--color-border-secondary)'
                        }}
                      >
                        <div className="flex-1">
                          <h3 className="linear-text-regular font-medium mb-1">
                            {project.title}
                          </h3>
                          <p className="linear-text-small line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>
                            {project.summary}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.techStack.slice(0, 3).map((tech) => (
                              <span key={tech} className="linear-tag text-xs">
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 3 && (
                              <span className="linear-tag text-xs">
                                +{project.techStack.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            type="button"
                            onClick={() => toggleFeaturedProject(project.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              featuredProjects.includes(project.id)
                                ? 'linear-button-primary'
                                : 'linear-button-secondary'
                            }`}
                          >
                            {featuredProjects.includes(project.id) ? '선택됨' : '선택'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <nav className="flex items-center space-x-2">
                        {/* 이전 페이지 */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          이전
                        </button>

                        {/* 페이지 번호 */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'linear-button-primary'
                                : ''
                            }`}
                            style={currentPage !== page ? { 
                              backgroundColor: 'var(--color-bg-secondary)',
                              color: 'var(--color-text-primary)'
                            } : {}}
                          >
                            {page}
                          </button>
                        ))}

                        {/* 다음 페이지 */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          다음
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}

              {featuredProjects.length > 0 && (
                <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                    선택된 주요 프로젝트: {featuredProjects.length}개 / 3개
                    {featuredProjects.length > 3 && (
                      <span style={{ color: 'var(--color-accent-warning)' }}>
                        {' '}(3개 초과 선택됨)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
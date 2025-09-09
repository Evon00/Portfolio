'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ProjectImageUpload from '@/components/common/ProjectImageUpload';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import TechStackSelector from '@/components/common/TechStackSelector';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
const formatDateToInput = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectSlug = params.slug as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [originalData, setOriginalData] = useState<any>(null); // 원본 데이터 추적
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    techStack: [] as string[],
    startDate: '',
    endDate: '',
    githubUrl: '',
    demoUrl: '',
    imageFiles: [] as File[]
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectSlug) {
        return;
      }
      
      try {
        setIsLoading(true);
        const foundProject = await projectService.getBySlug(projectSlug);
        if (foundProject) {
          setProject(foundProject);
          
          // 원본 데이터 저장 (변경 사항 추적용)
          const originalProjectData = {
            title: foundProject.title,
            summary: foundProject.summary,
            description: foundProject.description,
            techStack: foundProject.techStack,
            startDate: formatDateToInput(foundProject.startDate),
            endDate: formatDateToInput(foundProject.endDate || ''),
            githubUrl: foundProject.githubUrl || '',
            demoUrl: foundProject.demoUrl || ''
          };
          setOriginalData(originalProjectData);
          
          setFormData({
            ...originalProjectData,
            imageFiles: []
          });
        } else {
          alert('프로젝트를 찾을 수 없습니다.');
          router.push('/admin/dashboard/projects');
        }
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
        alert('프로젝트를 찾을 수 없습니다.');
        router.push('/admin/dashboard/projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectSlug, router]);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleTechStackChange = (techStack: string[]) => {
    setFormData(prev => ({
      ...prev,
      techStack
    }));
  };

  const handleImageFilesChange = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: files
    }));
  };

  // 배열이 같은지 비교하는 함수 (순서도 고려)
  const arraysEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    
    // 정렬된 배열로 비교 (순서 상관없이 동일한 요소인지 확인)
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    
    return sortedArr1.every((val, index) => val === sortedArr2[index]);
  };

  // 변경된 필드만 추출하는 함수
  const getChangedFields = () => {
    if (!originalData) return {};
    
    const changedFields: any = {};
    
    // 각 필드별로 변경 여부 확인
    if (formData.title !== originalData.title) {
      changedFields.title = formData.title;
    }
    if (formData.summary !== originalData.summary) {
      changedFields.summary = formData.summary;
    }
    if (formData.description !== originalData.description) {
      changedFields.description = formData.description;
    }
    // 기술 스택 변경사항 확인
    // - 기술스택이 추가된 경우: 기존 + 추가된 기술스택을 모두 전송
    // - 기술스택이 삭제된 경우: 남은 기술스택만 전송 (빈 배열 포함)
    // - 모든 기술스택이 삭제된 경우: 빈 배열 전송
    // - 순서가 바뀐 경우도 변경사항으로 처리
    if (!arraysEqual(formData.techStack, originalData.techStack)) {
      changedFields.techStack = formData.techStack; // 현재 선택된 모든 기술스택을 전송 (빈 배열 포함)
    }
    if (formData.startDate !== originalData.startDate) {
      changedFields.startDate = formData.startDate;
    }
    if (formData.endDate !== originalData.endDate) {
      changedFields.endDate = formData.endDate || undefined;
    }
    if (formData.githubUrl !== originalData.githubUrl) {
      changedFields.githubUrl = formData.githubUrl || undefined;
    }
    if (formData.demoUrl !== originalData.demoUrl) {
      changedFields.demoUrl = formData.demoUrl || undefined;
    }
    
    // 이미지 파일이 있으면 항상 포함
    if (formData.imageFiles.length > 0) {
      changedFields.imageFiles = formData.imageFiles;
    }
    
    return changedFields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.summary.trim() || !formData.description.trim() || !formData.startDate) {
      alert('제목, 요약, 상세 내용, 시작일은 필수 입력 항목입니다.');
      return;
    }

    if (!project || !originalData) {
      alert('프로젝트 정보가 없습니다.');
      return;
    }

    // 변경된 필드만 추출
    const changedFields = getChangedFields();
    
    // 변경사항이 없으면 알림
    if (Object.keys(changedFields).length === 0) {
      alert('변경된 내용이 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      await projectService.update(project.id, changedFields);

      alert('프로젝트가 성공적으로 수정되었습니다.');
      router.push('/admin/dashboard/projects');
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
      alert(error instanceof Error ? error.message : '프로젝트 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      return;
    }

    if (!project) {
      alert('프로젝트 정보가 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      await projectService.deleteProject(project.id);
      alert('프로젝트가 성공적으로 삭제되었습니다.');
      router.push('/admin/dashboard/projects');
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      alert(error instanceof Error ? error.message : '프로젝트 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !project) {
    return (
      <AdminLayout title="프로젝트 수정">
        <div className="p-6">
          <div className="linear-card p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">🚀</div>
            <p className="linear-text-large" style={{ color: 'var(--color-text-secondary)' }}>
              프로젝트를 불러오는 중...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="프로젝트 수정">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="linear-title-2">프로젝트 수정</h1>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: '#2a1b1b', color: '#ff6b6b' }}
                disabled={isLoading}
              >
                삭제
              </button>
              <button
                onClick={() => router.back()}
                className="linear-button-secondary"
                disabled={isLoading}
              >
                취소
              </button>
            </div>
          </div>

          {/* 프로젝트 정보 */}
          <div className="linear-card p-4 mb-6" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span>시작일: {project.startDate}</span>
              {project.endDate && <span>종료일: {project.endDate}</span>}
              <span>ID: {project.id}</span>
              <span>Slug: <code className="bg-gray-100 px-1 rounded">{project.slug}</code></span>
            </div>
            <div className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              ⚠️ Slug는 수정할 수 없습니다. URL 경로로 사용됩니다: /projects/{project.slug}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="linear-card p-6 space-y-6">
              {/* 제목 */}
              <div>
                <label className="block linear-text-small font-medium mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  className="linear-input w-full"
                  placeholder="프로젝트 제목을 입력하세요"
                  required
                />
              </div>

              {/* 요약 */}
              <div>
                <label className="block linear-text-small font-medium mb-2">
                  요약 *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={handleInputChange('summary')}
                  className="linear-input w-full"
                  rows={3}
                  placeholder="프로젝트 요약을 입력하세요"
                  required
                />
              </div>

              {/* 프로젝트 기간 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block linear-text-small font-medium mb-2">
                    시작일 *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange('startDate')}
                    className="linear-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block linear-text-small font-medium mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange('endDate')}
                    className="linear-input w-full"
                    placeholder="진행 중인 경우 비워두세요"
                  />
                </div>
              </div>

              {/* GitHub 및 데모 URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block linear-text-small font-medium mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={handleInputChange('githubUrl')}
                    className="linear-input w-full"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <label className="block linear-text-small font-medium mb-2">
                    데모 URL
                  </label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={handleInputChange('demoUrl')}
                    className="linear-input w-full"
                    placeholder="https://demo.example.com"
                  />
                </div>
              </div>

              {/* 기술 스택 */}
              <div>
                <label className="block linear-text-small font-medium mb-2">
                  기술 스택
                </label>
                <TechStackSelector
                  selectedTechStacks={formData.techStack}
                  onTechStackChange={handleTechStackChange}
                  placeholder="기술 스택을 검색하여 추가하세요"
                />
              </div>
            </div>

            {/* 프로젝트 이미지 */}
            <div className="linear-card p-6">
              <label className="block linear-text-small font-medium mb-4">
                프로젝트 이미지
              </label>
              <ProjectImageUpload
                files={formData.imageFiles}
                onFilesChange={handleImageFilesChange}
                maxImages={10}
                disabled={isLoading}
              />
              {project.images && project.images.length > 0 && (
                <div className="mt-4">
                  <p className="linear-text-small mb-2">현재 업로드된 이미지:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {project.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Project ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                          style={{ borderColor: 'var(--color-border-secondary)' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 상세 내용 */}
            <div className="linear-card">
              <div className="p-6 pb-0">
                <label className="block linear-text-small font-medium mb-2">
                  상세 내용 (마크다운) *
                </label>
              </div>
              <MarkdownEditor
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="마크다운 형식으로 프로젝트 상세 내용을 작성하세요..."
                rows={20}
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="linear-button-secondary"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="linear-button-primary"
                disabled={isLoading}
              >
                {isLoading ? '수정 중...' : '프로젝트 수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
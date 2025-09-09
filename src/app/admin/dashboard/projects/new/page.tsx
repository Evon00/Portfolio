'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ProjectImageUpload from '@/components/common/ProjectImageUpload';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import TechStackSelector from '@/components/common/TechStackSelector';
import { SlugInput } from '@/components/admin/SlugInput';
import { useProjects } from '@/hooks';
import { TechStackId, ISODateString, GitHubUrl, DemoUrl } from '@/types';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    techStack: [] as string[],
    startDate: '',
    endDate: '',
    githubUrl: '',
    demoUrl: '',
    imageFiles: [] as File[],
    slug: ''
  });
  const [isSlugValid, setIsSlugValid] = useState(false);
  const [slugError, setSlugError] = useState<string>('');

  const { createProject } = useProjects();

  const handleImageFilesChange = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: files
    }));
  };

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


  const handleSlugValidation = (isValid: boolean, error?: string) => {
    setIsSlugValid(isValid);
    setSlugError(error || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.summary.trim() || !formData.description.trim() || !formData.startDate || !formData.slug.trim()) {
      alert('제목, 요약, 상세 내용, 시작일, Slug는 필수 입력 항목입니다.');
      return;
    }

    if (!isSlugValid) {
      alert(`Slug 오류: ${slugError}`);
      return;
    }

    setIsLoading(true);

    try {
      const newProject = await projectService.create({
        title: formData.title,
        summary: formData.summary,
        description: formData.description,
        techStack: formData.techStack as TechStackId[],
        startDate: formData.startDate as ISODateString,
        endDate: formData.endDate ? formData.endDate as ISODateString : undefined,
        githubUrl: formData.githubUrl ? formData.githubUrl as GitHubUrl : undefined,
        demoUrl: formData.demoUrl ? formData.demoUrl as DemoUrl : undefined,
        imageFiles: formData.imageFiles,
        slug: formData.slug
      });

      alert('프로젝트가 성공적으로 추가되었습니다.');
      router.push('/admin/dashboard/projects');
    } catch (error) {
      console.error('프로젝트 추가 실패:', error);
      alert(error instanceof Error ? error.message : '프로젝트 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="새 프로젝트 추가">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="linear-title-2">새 프로젝트 추가</h1>
            <button
              onClick={() => router.back()}
              className="linear-button-secondary"
            >
              취소
            </button>
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

              {/* Slug */}
              <SlugInput
                value={formData.slug}
                onChange={(slug) => setFormData(prev => ({ ...prev, slug }))}
                onValidation={handleSlugValidation}
                checkSlugExists={projectService.checkSlugExists.bind(projectService)}
                suggestSlug={projectService.suggestSlug.bind(projectService)}
                title={formData.title}
                placeholder="my-awesome-project"
                urlPrefix="/projects/"
              />

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
                {isLoading ? '추가 중...' : '프로젝트 추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
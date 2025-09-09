'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import TechStackSelector from '@/components/common/TechStackSelector';
import { SlugInput } from '@/components/admin/SlugInput';
import ImageUploader from '@/components/admin/ImageUploader';
import { blogService } from '@/services/blogService';
import { BlogPost } from '@/types';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    techStack: [] as string[],
    readTime: 5,
    slug: '',
    images: [] as number[]
  });
  const [isSlugValid, setIsSlugValid] = useState(false);
  const [slugError, setSlugError] = useState<string>('');

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

  const handleImageUpload = (images: Array<{ id: string; name: string; url: string; size: number }>) => {
    const imageIds = images.map(img => parseInt(img.id));
    setFormData(prev => ({
      ...prev,
      images: imageIds
    }));
  };

  const handleSlugValidation = (isValid: boolean, error?: string) => {
    setIsSlugValid(isValid);
    setSlugError(error || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim() || !formData.slug.trim()) {
      alert('제목, 요약, 내용, Slug는 필수 입력 항목입니다.');
      return;
    }

    if (!isSlugValid) {
      alert(`Slug 오류: ${slugError}`);
      return;
    }

    setIsLoading(true);

    try {
      const newPost = await blogService.create({
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        techStack: formData.techStack,
        readTime: formData.readTime,
        slug: formData.slug,
        images: formData.images
      });

      alert('게시글이 성공적으로 작성되었습니다.');
      router.push('/admin/dashboard/blog');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert(error instanceof Error ? error.message : '게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="새 게시글 작성">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="linear-title-2">새 게시글 작성</h1>
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
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              {/* Slug */}
              <SlugInput
                value={formData.slug}
                onChange={(slug) => setFormData(prev => ({ ...prev, slug }))}
                onValidation={handleSlugValidation}
                checkSlugExists={blogService.checkSlugExists.bind(blogService)}
                suggestSlug={blogService.suggestSlug.bind(blogService)}
                title={formData.title}
                placeholder="my-awesome-blog-post"
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
                  placeholder="게시글 요약을 입력하세요"
                  required
                />
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

              {/* 읽는 시간 */}
              <div>
                <label className="block linear-text-small font-medium mb-2">
                  읽는 시간 (분)
                </label>
                <input
                  type="number"
                  value={formData.readTime}
                  onChange={handleInputChange('readTime')}
                  className="linear-input w-32"
                  min="1"
                  max="60"
                />
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div className="linear-card p-6">
              <label className="block linear-text-small font-medium mb-4">
                이미지 업로드
              </label>
              <ImageUploader 
                slug={formData.slug} 
                disabled={!isSlugValid || !formData.slug}
                onUpload={handleImageUpload}
              />
            </div>

            {/* 내용 */}
            <div className="linear-card">
              <div className="p-6 pb-0">
                <label className="block linear-text-small font-medium mb-2">
                  내용 (마크다운) *
                </label>
              </div>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="마크다운 형식으로 내용을 작성하세요..."
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
                {isLoading ? '작성 중...' : '게시글 작성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
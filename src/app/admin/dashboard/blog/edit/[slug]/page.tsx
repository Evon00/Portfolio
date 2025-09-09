'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import TechStackSelector from '@/components/common/TechStackSelector';
import ImageUploader from '@/components/admin/ImageUploader';
import { BlogPost } from '@/types';
import { blogService } from '@/services/blogService';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postSlug = params.slug as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [originalData, setOriginalData] = useState<any>(null); // 원본 데이터 추적
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    techStack: [] as string[],
    readTime: 5
  });

  // Direct service calls instead of hooks

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const foundPost = await blogService.getBySlug(postSlug);
        if (foundPost) {
          setPost(foundPost);
          
          // 원본 데이터 저장 (변경 사항 추적용)
          const originalPostData = {
            title: foundPost.title,
            summary: foundPost.summary,
            content: foundPost.content,
            techStack: foundPost.techStack,
            readTime: foundPost.readTime
          };
          setOriginalData(originalPostData);
          
          setFormData(originalPostData);
        } else {
          alert('게시글을 찾을 수 없습니다.');
          router.push('/admin/dashboard/blog');
        }
      } catch (error) {
        console.error('게시글 로드 실패:', error);
        alert('게시글을 찾을 수 없습니다.');
        router.push('/admin/dashboard/blog');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postSlug, router]);

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

  // 배열이 같은지 비교하는 함수 (순서 무관)
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
    if (formData.content !== originalData.content) {
      changedFields.content = formData.content;
    }
    // 기술 스택 변경사항 확인
    // - 기술스택이 추가된 경우: 기존 + 추가된 기술스택을 모두 전송
    // - 기술스택이 삭제된 경우: 남은 기술스택만 전송 (빈 배열 포함)
    // - 모든 기술스택이 삭제된 경우: 빈 배열 전송
    // - 순서가 바뀐 경우도 변경사항으로 처리
    if (!arraysEqual(formData.techStack, originalData.techStack)) {
      changedFields.techStack = formData.techStack; // 현재 선택된 모든 기술스택을 전송 (빈 배열 포함)
    }
    if (formData.readTime !== originalData.readTime) {
      changedFields.readTime = formData.readTime;
    }
    
    return changedFields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      alert('제목, 요약, 내용은 필수 입력 항목입니다.');
      return;
    }

    if (!post?.id || !originalData) {
      alert('게시글 정보를 찾을 수 없습니다.');
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
      await blogService.update(post.id, changedFields);

      alert('게시글이 성공적으로 수정되었습니다.');
      router.push('/admin/dashboard/blog');
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert(error instanceof Error ? error.message : '게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);

    try {
      if (!post?.id) {
        alert('게시글 정보를 찾을 수 없습니다.');
        return;
      }

      await blogService.deleteBlogPost(post.id);
      alert('게시글이 성공적으로 삭제되었습니다.');
      router.push('/admin/dashboard/blog');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert(error instanceof Error ? error.message : '게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!post) {
    return (
      <AdminLayout title="게시글 수정">
        <div className="p-6">
          <div className="linear-card p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">📝</div>
            <p className="linear-text-large" style={{ color: 'var(--color-text-secondary)' }}>
              게시글을 불러오는 중...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="게시글 수정">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="linear-title-2">게시글 수정</h1>
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

          {/* 게시글 정보 */}
          <div className="linear-card p-4 mb-6" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span>작성일: {new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
              <span>조회수: {(post.viewCount || 0).toLocaleString()}</span>
              <span>ID: {post.id}</span>
              <span>Slug: <code className="bg-gray-100 px-1 rounded">{post.slug}</code></span>
            </div>
            <div className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              ⚠️ Slug는 수정할 수 없습니다. URL 경로로 사용됩니다: /blog/{post.slug}
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
                  placeholder="게시글 제목을 입력하세요"
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
                slug={post?.slug || postSlug} 
                disabled={!post?.slug}
              />
              {post.images && post.images.length > 0 && (
                <div className="mt-4">
                  <p className="linear-text-small mb-2">현재 업로드된 이미지:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {post.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Blog Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                          style={{ borderColor: 'var(--color-border-secondary)' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                {isLoading ? '수정 중...' : '게시글 수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { TechStack } from '@/types';
import AdminLayout from '@/components/admin/AdminLayout';
import { getTechIcon } from '@/lib/techIcons';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { skillService, SkillResponse } from '@/services/skillService';

const ITEMS_PER_PAGE = 12;

export default function TechStackManagePage() {
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTechStack, setEditingTechStack] = useState<TechStack | null>(null);

  // 기술 스택 데이터를 API에서 로드
  useEffect(() => {
    loadTechStacks();
    loadCategories();
  }, [currentPage, selectedCategory, searchQuery]);

  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    
    // 이미 완전한 URL인 경우
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // CloudFront URL인 경우 https:// 추가
    if (url.startsWith('cloudfront/') || url.includes('.cloudfront.net')) {
      return `https://${url}`;
    }
    
    // 상대 경로인 경우 https:// 추가
    return `https://${url}`;
  };

  const convertToTechStack = (skill: SkillResponse): TechStack => ({
    id: skill.id.toString(),
    name: skill.skillName,
    category: skill.category,
    iconUrl: normalizeImageUrl(skill.uploadUrl),
    createdAt: skill.createdAt,
    updatedAt: skill.createdAt
  });

  const loadTechStacks = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (searchQuery) {
        // 검색어가 있을 때는 검색 API 사용
        const searchResult = await skillService.searchSkills(searchQuery);
        const convertedSkills = searchResult.skills.map(convertToTechStack);
        
        // 카테고리 필터링
        const filteredSkills = selectedCategory 
          ? convertedSkills.filter(skill => skill.category === selectedCategory)
          : convertedSkills;
        
        // 클라이언트 사이드 페이지네이션
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        
        setTechStacks(filteredSkills.slice(startIndex, endIndex));
        setTotalElements(filteredSkills.length);
        setTotalPages(Math.ceil(filteredSkills.length / ITEMS_PER_PAGE));
      } else if (selectedCategory) {
        // 카테고리 필터링
        response = await skillService.getSkillsByCategory(selectedCategory, currentPage - 1, ITEMS_PER_PAGE);
        setTechStacks(response.skills.map(convertToTechStack));
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } else {
        // 전체 조회
        response = await skillService.getAllSkills(currentPage - 1, ITEMS_PER_PAGE);
        setTechStacks(response.skills.map(convertToTechStack));
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('기술 스택 로드 실패:', error);
      alert('기술 스택을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await skillService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색 및 필터 변경시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // 기술 스택 삭제
  const handleDelete = async (id: string) => {
    const techStack = techStacks.find(tech => tech.id === id);
    if (!techStack) return;

    if (confirm(`"${techStack.name}" 기술 스택을 삭제하시겠습니까?`)) {
      try {
        await skillService.deleteSkill(parseInt(id));
        alert('기술 스택이 삭제되었습니다.');
        loadTechStacks(); // 목록 새로고침
      } catch (error) {
        console.error('기술 스택 삭제 실패:', error);
        alert('기술 스택 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 수정 모달 열기
  const handleEdit = (techStack: TechStack) => {
    setEditingTechStack(techStack);
    setIsEditModalOpen(true);
  };

  return (
    <AdminLayout title="기술 스택 관리">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="linear-title-2 mb-2">기술 스택 관리</h1>
                <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>
                  프로젝트와 블로그에서 사용할 기술 스택을 관리합니다.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="linear-button-primary"
              >
                새 기술 스택 추가
              </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <svg className="h-5 w-5" style={{ color: 'var(--color-text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="기술 스택 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="linear-input w-full"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="linear-input"
              >
                <option value="">모든 카테고리</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="linear-card p-4">
                <h3 className="linear-text-small font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  전체 기술 스택
                </h3>
                <p className="linear-title-3" style={{ color: 'var(--color-accent-primary)' }}>
                  {totalElements}
                </p>
              </div>
              <div className="linear-card p-4">
                <h3 className="linear-text-small font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  카테고리 수
                </h3>
                <p className="linear-title-3" style={{ color: 'var(--color-accent-primary)' }}>
                  {categories.length}
                </p>
              </div>
              <div className="linear-card p-4">
                <h3 className="linear-text-small font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  현재 페이지
                </h3>
                <p className="linear-title-3" style={{ color: 'var(--color-accent-primary)' }}>
                  {techStacks.length}
                </p>
              </div>
            </div>
          </div>

          {/* 기술 스택 그리드 */}
          <div className="linear-card p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>
                  기술 스택을 불러오는 중...
                </p>
              </div>
            ) : techStacks.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>
                  조건에 맞는 기술 스택이 없습니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {techStacks.map((techStack) => (
                  <div
                    key={techStack.id}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                    style={{ 
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border-secondary)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center" style={{ color: 'var(--color-accent-primary)' }}>
                          {techStack.iconUrl ? (
                            <img 
                              src={techStack.iconUrl} 
                              alt={techStack.name} 
                              className="w-8 h-8 object-contain skill-icon"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.remove(); // 아이콘 폴백 제거 방지
                              }}
                            />
                          ) : (
                            <div style={{ color: 'var(--color-accent-primary)' }}>
                              {getTechIcon(techStack.name)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="linear-text-regular font-medium">
                            {techStack.name}
                          </h3>
                          {techStack.category && (
                            <span className="linear-tag text-xs">
                              {techStack.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(techStack)}
                          className="p-1 rounded hover:bg-gray-700 transition-colors"
                          title="수정"
                        >
                          <svg className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(techStack.id)}
                          className="p-1 rounded hover:bg-red-600 transition-colors"
                          title="삭제"
                        >
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      생성일: {new Date(techStack.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
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

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
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

                  <button
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
          </div>
        </div>
      </div>

      {/* 생성 모달 */}
      {isCreateModalOpen && (
        <TechStackModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (data) => {
            try {
              if (!data.file) {
                alert('아이콘 파일을 선택해주세요.');
                return;
              }
              
              await skillService.addSkill({
                skillName: data.name,
                category: data.category || ''
              }, data.file);
              
              setIsCreateModalOpen(false);
              alert('기술 스택이 추가되었습니다.');
              loadTechStacks(); // 목록 새로고침
            } catch (error) {
              console.error('기술 스택 추가 실패:', error);
              alert('기술 스택 추가 중 오류가 발생했습니다.');
            }
          }}
          title="새 기술 스택 추가"
        />
      )}

      {/* 수정 모달 */}
      {isEditModalOpen && editingTechStack && (
        <TechStackModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTechStack(null);
          }}
          onSubmit={async (data) => {
            try {
              await skillService.updateSkill(parseInt(editingTechStack.id), {
                skillName: data.name,
                category: data.category || ''
              }, data.file);
              
              setIsEditModalOpen(false);
              setEditingTechStack(null);
              alert('기술 스택이 수정되었습니다.');
              loadTechStacks(); // 목록 새로고침
            } catch (error) {
              console.error('기술 스택 수정 실패:', error);
              alert('기술 스택 수정 중 오류가 발생했습니다.');
            }
          }}
          title="기술 스택 수정"
          initialData={editingTechStack}
        />
      )}
    </AdminLayout>
  );
}

// 모달 컴포넌트
interface TechStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; category?: string; iconUrl?: string; file?: File }) => void;
  title: string;
  initialData?: TechStack;
}

function TechStackModal({ isOpen, onClose, onSubmit, title, initialData }: TechStackModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    iconUrl: initialData?.iconUrl || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleImageUpload = async (file: File): Promise<string> => {
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, iconUrl: previewUrl }));
    return previewUrl;
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, iconUrl: '' }));
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('기술 스택 이름을 입력해주세요.');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      category: formData.category.trim() || undefined,
      iconUrl: formData.iconUrl.trim() || undefined,
      file: selectedFile || undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="linear-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="linear-title-4">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block linear-text-small font-medium mb-2">
                기술 스택 이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="linear-input w-full"
                placeholder="예: React"
                required
              />
            </div>

            <div>
              <label className="block linear-text-small font-medium mb-2">
                카테고리
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="linear-input w-full"
                placeholder="예: Frontend"
              />
            </div>

            <div>
              <label className="block linear-text-small font-medium mb-2">
                아이콘
              </label>
              
              <div className="flex items-start gap-4">
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  currentImageUrl={formData.iconUrl}
                  onImageRemove={handleImageRemove}
                  accept="image/*"
                  maxSize={2}
                />
                <div className="flex-1 text-sm text-gray-600">
                  <p className="mb-2">기술 스택 아이콘을 업로드하세요.</p>
                  <ul className="text-xs space-y-1">
                    <li>• 권장 크기: 64x64px 이상</li>
                    <li>• 지원 형식: PNG, JPG, SVG</li>
                    <li>• 최대 크기: 2MB</li>
                  </ul>
                </div>
              </div>

              {formData.iconUrl && (
                <div 
                  className="mt-3 p-3 rounded border"
                  style={{ 
                    backgroundColor: 'var(--color-bg-tertiary)', 
                    borderColor: 'var(--color-border-secondary)' 
                  }}
                >
                  <p className="linear-text-small mb-2" style={{ color: 'var(--color-text-secondary)' }}>미리보기:</p>
                  <div className="flex items-center gap-2">
                    <img 
                      src={formData.iconUrl} 
                      alt="Icon preview" 
                      className="w-8 h-8 object-contain skill-icon"
                    />
                    <span className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                      {formData.name || '기술 스택'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="linear-button-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                className="linear-button-primary"
              >
                {initialData ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
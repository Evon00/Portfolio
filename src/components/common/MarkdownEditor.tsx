'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadMultipleImages, handleDragAndDrop, UploadedImage } from '@/lib/imageUpload';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '마크다운 형식으로 내용을 작성하세요...',
  rows = 20,
  className = ''
}: MarkdownEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 텍스트 영역의 특정 위치에 텍스트 삽입
  const insertTextAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);

    // 커서 위치를 삽입된 텍스트 끝으로 이동
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [value, onChange]);

  // 이미지 업로드 처리
  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedImages = await uploadMultipleImages(files);
      
      // 마크다운 이미지 문법으로 변환하여 삽입
      const imageMarkdown = uploadedImages
        .map((image) => `![${image.name}](${image.url})`)
        .join('\n');
      
      insertTextAtCursor(imageMarkdown + '\n');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert(error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 드래그 앤 드롭 이벤트 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  // 파일 선택으로 이미지 업로드
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleImageUpload(files);
    }
    // input 값 초기화
    e.target.value = '';
  };

  // 마크다운 도구 버튼들
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;
    
    insertTextAtCursor(newText);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 탭 및 툴바 */}
      <div className="border-b" style={{ borderColor: 'var(--color-border-secondary)' }}>
        {/* 탭 헤더 */}
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 linear-text-small font-medium border-b-2 transition-colors ${
              activeTab === 'edit' 
                ? 'border-blue-500' 
                : 'border-transparent hover:border-gray-300'
            }`}
            style={{
              color: activeTab === 'edit' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'edit' ? 'var(--color-bg-secondary)' : 'transparent'
            }}
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 linear-text-small font-medium border-b-2 transition-colors ${
              activeTab === 'preview' 
                ? 'border-blue-500' 
                : 'border-transparent hover:border-gray-300'
            }`}
            style={{
              color: activeTab === 'preview' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'preview' ? 'var(--color-bg-secondary)' : 'transparent'
            }}
          >
            프리뷰
          </button>
        </div>
        
        {/* 툴바 (편집 모드에서만 표시) */}
        {activeTab === 'edit' && (
          <div className="flex items-center gap-2 p-3 border-t" style={{ borderColor: 'var(--color-border-secondary)' }}>
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="굵게"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="기울임"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 font-mono"
              title="인라인 코드"
            >
              {'</>'}
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('```\n', '\n```')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="코드 블록"
            >
              📄
            </button>
            <div className="w-px h-6" style={{ backgroundColor: 'var(--color-border-secondary)' }} />
            <button
              type="button"
              onClick={() => insertMarkdown('# ', '')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="제목 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('## ', '')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="제목 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('### ', '')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="제목 3"
            >
              H3
            </button>
            <div className="w-px h-6" style={{ backgroundColor: 'var(--color-border-secondary)' }} />
            <label className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" title="이미지 업로드">
              📷
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="relative">
        {activeTab === 'edit' ? (
          // 편집 모드
          <>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              placeholder={placeholder}
              rows={rows}
              className={`
                linear-input w-full font-mono text-sm resize-none
                ${isDragging ? 'ring-2 ring-blue-400' : ''}
                ${isUploading ? 'opacity-75' : ''}
              `}
              style={{
                borderColor: isDragging ? 'var(--color-accent-primary)' : undefined,
                backgroundColor: isDragging ? 'var(--color-bg-tertiary)' : undefined
              }}
            />

            {/* 드래그 오버레이 */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="p-6 rounded-lg border-2 border-dashed"
                  style={{ 
                    borderColor: 'var(--color-accent-primary)',
                    backgroundColor: 'var(--color-bg-primary)'
                  }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="linear-text-regular" style={{ color: 'var(--color-accent-primary)' }}>
                      이미지를 여기에 놓으세요
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 업로드 중 오버레이 */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
                <div 
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-primary)' }}
                >
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                      <svg fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                      이미지 업로드 중...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // 프리뷰 모드
          <div 
            className="p-6 min-h-96 overflow-auto"
            style={{ 
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-primary)',
              minHeight: `${rows * 1.5}rem`
            }}
          >
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="linear-text-regular" style={{ color: 'var(--color-text-tertiary)' }}>
                  내용을 입력하면 여기에 프리뷰가 표시됩니다
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 도움말 */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border-secondary)', backgroundColor: 'var(--color-bg-tertiary)' }}>
        <p className="linear-text-mini" style={{ color: 'var(--color-text-tertiary)' }}>
          {activeTab === 'edit' ? (
            <>
              💡 이미지를 드래그하여 에디터에 놓거나 📷 버튼을 클릭하여 업로드하세요. 
              마크다운 문법: **굵게**, *기울임*, `코드`, # 제목
            </>
          ) : (
            <>
              👁️ 작성한 마크다운 내용의 실시간 프리뷰입니다. 편집 탭에서 내용을 수정할 수 있습니다.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
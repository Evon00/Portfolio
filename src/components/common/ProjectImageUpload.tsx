'use client';

import { useState } from 'react';

interface ProjectImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ProjectImageUpload({ 
  files = [], 
  onFilesChange,
  maxImages = 10,
  disabled = false
}: ProjectImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    // input value 초기화
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    handleFiles(droppedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    if ((files || []).length + newFiles.length > maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 타입 체크
    const validFiles = newFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== newFiles.length) {
      alert('JPG, PNG, GIF, WebP 형식의 이미지만 업로드 가능합니다.');
    }

    if (validFiles.length > 0) {
      onFilesChange([...(files || []), ...validFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = (files || []).filter((_, index) => index !== indexToRemove);
    onFilesChange(updatedFiles);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= (files || []).length) return;
    
    const updatedFiles = [...(files || [])];
    const [movedFile] = updatedFiles.splice(fromIndex, 1);
    updatedFiles.splice(toIndex, 0, movedFile);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* 업로드 영역 */}
      {(files || []).length < maxImages && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 pointer-events-none' : ''}
          `}
          style={{
            borderColor: isDragOver ? 'var(--color-accent)' : 'var(--color-border-secondary)',
            backgroundColor: isDragOver ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="linear-text-regular font-medium" style={{ color: 'var(--color-text-primary)' }}>
                이미지를 드래그하거나 클릭하여 업로드
              </p>
              <p className="linear-text-small" style={{ color: 'var(--color-text-tertiary)' }}>
                JPG, PNG, GIF, WebP 형식 지원 (최대 {maxImages - (files || []).length}개 추가 가능)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 선택된 파일 목록 */}
      {(files || []).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="linear-text-regular font-medium">
              선택된 이미지 ({(files || []).length}/{maxImages})
            </h3>
            {(files || []).length > 1 && (
              <p className="linear-text-small" style={{ color: 'var(--color-text-tertiary)' }}>
                화살표 버튼으로 순서 변경 가능
              </p>
            )}
          </div>

          <div className="space-y-3">
            {(files || []).map((file, index) => (
              <div
                key={`file-${index}-${file.name}`}
                className="linear-card p-4"
              >
                <div className="flex items-center gap-4">
                  {/* 순서 번호 */}
                  <div 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}
                  >
                    {index + 1}
                  </div>

                  {/* 이미지 미리보기 */}
                  <div className="flex-shrink-0">
                    <div 
                      className="w-16 h-16 rounded-lg overflow-hidden border"
                      style={{ borderColor: 'var(--color-border-secondary)' }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* 파일 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="linear-text-small font-medium truncate">
                      {file.name}
                    </p>
                    <p className="linear-text-mini" style={{ color: 'var(--color-text-tertiary)' }}>
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* 컨트롤 버튼들 */}
                  <div className="flex items-center gap-2">
                    {/* 위로 이동 */}
                    <button
                      type="button"
                      onClick={() => moveFile(index, index - 1)}
                      disabled={index === 0}
                      className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                      style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                      title="위로 이동"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    {/* 아래로 이동 */}
                    <button
                      type="button"
                      onClick={() => moveFile(index, index + 1)}
                      disabled={index === (files || []).length - 1}
                      className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                      style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                      title="아래로 이동"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* 삭제 */}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 rounded-lg transition-colors hover:scale-110"
                      style={{ backgroundColor: '#2a1b1b', color: '#ff6b6b' }}
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 도움말 */}
      <div className="linear-card p-4" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
        <div className="flex items-start gap-3">
          <div className="text-lg">💡</div>
          <div className="space-y-1">
            <p className="linear-text-small font-medium">이미지 업로드 가이드</p>
            <ul className="linear-text-mini space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
              <li>• JPG, PNG, GIF, WebP 형식만 지원</li>
              <li>• 첫 번째 이미지가 대표 이미지로 사용됩니다</li>
              <li>• 최대 {maxImages}개까지 업로드 가능</li>
              <li>• 화살표 버튼으로 이미지 순서를 변경할 수 있습니다</li>
              <li>• 프로젝트 저장 시 서버에 업로드됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
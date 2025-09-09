'use client';

import { useState, useRef } from 'react';
import { uploadMultipleImages, handleDragAndDrop, formatFileSize, UploadedImage } from '@/lib/imageUpload';

interface ImageUploadProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  multiple?: boolean;
  className?: string;
  accept?: string;
  maxFiles?: number;
  slug?: string;
  disabled?: boolean;
}

export default function ImageUpload({ 
  onImagesUploaded, 
  multiple = false, 
  className = '',
  accept = 'image/*',
  maxFiles = 10,
  slug,
  disabled = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    // Slug 검증
    if (!slug || slug.trim() === '') {
      alert('이미지를 업로드하려면 먼저 Slug를 입력해주세요.');
      return;
    }

    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      alert('한 번에 하나의 파일만 업로드할 수 있습니다.');
      return;
    }

    if (fileArray.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    setIsUploading(true);

    try {
      // 업로드 진행률 초기화
      const progressInit: { [key: string]: number } = {};
      fileArray.forEach((file, index) => {
        progressInit[index] = 0;
      });
      setUploadProgress(progressInit);

      // 파일별로 업로드 진행률 시뮬레이션 (실제 API에서는 실제 진행률 사용)
      fileArray.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadProgress(prev => ({ ...prev, [index]: progress }));
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 100);
      });

      const uploadedImages = await uploadMultipleImages(fileArray);
      onImagesUploaded(uploadedImages);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert(error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
    setIsDragging(false);
    handleDragAndDrop(e, (files) => handleFileSelect(files));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <div
        onClick={!disabled && slug ? handleClick : undefined}
        onDragOver={!disabled && slug ? handleDragOver : undefined}
        onDragLeave={!disabled && slug ? handleDragLeave : undefined}
        onDrop={!disabled && slug ? handleDrop : undefined}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${(disabled || !slug) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:scale-[1.02]'
          }
          ${isDragging && !disabled && slug
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : ''}
        `}
        style={{
          borderColor: isDragging ? 'var(--color-accent-primary)' : 'var(--color-border-secondary)',
          backgroundColor: isDragging ? 'var(--color-bg-tertiary)' : 'transparent'
        }}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin w-8 h-8 mx-auto" style={{ color: 'var(--color-accent-primary)' }}>
              <svg fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
              업로드 중...
            </p>
            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([index, progress]) => (
                  <div key={index} className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: 'var(--color-accent-primary)',
                        width: `${progress}%`
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto" style={{ color: 'var(--color-text-tertiary)' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="linear-text-regular mb-2">
                {!slug 
                  ? 'Slug를 먼저 입력해주세요'
                  : multiple 
                    ? '이미지들을 드래그하여 놓거나 클릭하여 선택하세요' 
                    : '이미지를 드래그하여 놓거나 클릭하여 선택하세요'
                }
              </p>
              <p className="linear-text-small" style={{ color: 'var(--color-text-tertiary)' }}>
                {!slug 
                  ? '이미지 업로드를 위해서는 유효한 Slug가 필요합니다'
                  : `JPG, PNG, GIF, WebP (최대 10MB)${multiple ? ` • 최대 ${maxFiles}개 파일` : ''}`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
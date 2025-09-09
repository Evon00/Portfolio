'use client';

import React, { useState, useRef } from 'react';
import { memberService } from '@/services/memberService';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string, s3Key?: string) => void;
  onImageRemove: () => void;
}

export default function ProfileImageUpload({
  currentImage,
  onImageChange,
  onImageRemove
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsUploading(true);
    
    try {
      const response = await memberService.uploadProfileImage(file);
      onImageChange(response.profileUrl, response.s3Key);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CloudFront URL에 https:// 프로토콜 추가
  const formatImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="space-y-4">
      {/* 현재 이미지 미리보기 */}
      {currentImage && (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2" 
               style={{ borderColor: 'var(--color-border-secondary)' }}>
            <img 
              src={formatImageUrl(currentImage)} 
              alt="프로필 이미지"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1">
            <p className="linear-text-small font-medium mb-1">현재 프로필 이미지</p>
            <button
              type="button"
              onClick={handleRemove}
              className="linear-button-secondary text-sm"
            >
              이미지 제거
            </button>
          </div>
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50/10' 
            : 'border-gray-600 hover:border-gray-500'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="space-y-3">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                이미지 업로드 중...
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              <div>
                <p className="linear-text-regular font-medium mb-1">
                  프로필 이미지 업로드
                </p>
                <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                  이미지를 드래그하거나 클릭하여 업로드하세요
                </p>
                <p className="linear-text-mini mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  JPG, PNG, GIF, WebP (최대 10MB)
                </p>
              </div>

              <button
                type="button"
                onClick={handleButtonClick}
                className="linear-button-secondary"
              >
                파일 선택
              </button>
            </>
          )}
        </div>
      </div>

      {/* URL 직접 입력 옵션 */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-secondary)' }}>
        <p className="linear-text-small mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          또는 이미지 URL을 직접 입력하세요:
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="linear-input flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  onImageChange(target.value.trim());
                  target.value = '';
                }
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input.value.trim()) {
                onImageChange(input.value.trim());
                input.value = '';
              }
            }}
            className="linear-button-secondary"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
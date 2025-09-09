'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => Promise<string>;
  currentImageUrl?: string;
  onImageRemove?: () => void;
  accept?: string;
  maxSize?: number; // MB
  className?: string;
  disabled?: boolean;
}

export const ImageUpload = ({
  onImageUpload,
  currentImageUrl,
  onImageRemove,
  accept = 'image/*',
  maxSize = 2,
  className = '',
  disabled = false
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드 가능합니다.';
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `파일 크기는 ${maxSize}MB 이하여야 합니다.`;
    }
    
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onImageUpload(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setError(null);
    onImageRemove?.();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {currentImageUrl ? (
        // 이미지 미리보기
        <div className="relative">
          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300">
            <img
              src={currentImageUrl}
              alt="Uploaded preview"
              className="w-full h-full object-contain skill-icon"
            />
          </div>
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        // 업로드 영역
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-xs text-gray-500 mt-1">업로드중...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {currentImageUrl ? (
                <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
              )}
              <span className="text-xs text-gray-500 text-center">
                클릭 또는<br />드래그
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
      
      <p className="text-gray-500 text-xs mt-1">
        {maxSize}MB 이하, 이미지 파일만
      </p>
    </div>
  );
};
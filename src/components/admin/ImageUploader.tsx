'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Copy, Check } from 'lucide-react';

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
}

interface ImageUploaderProps {
  onUpload?: (images: UploadedImage[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
  slug?: string;
  disabled?: boolean;
}

export default function ImageUploader({
  onUpload,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  slug,
  disabled = false
}: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 실제 서버에 이미지 업로드
  const uploadToServer = async (files: File[]): Promise<UploadedImage[]> => {
    const token = localStorage.getItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'portfolio_auth_token');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('data', slug!);
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/post/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`이미지 업로드 실패: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      return {
        id: result.data.id.toString(),
        name: file.name,
        url: result.data.uploadUrl,
        size: file.size
      };
    });

    return Promise.all(uploadPromises);
  };

  const handleFileUpload = async (files: File[]) => {
    // Slug 검증
    if (!slug || slug.trim() === '') {
      alert('이미지를 업로드하려면 먼저 Slug를 입력해주세요.');
      return;
    }

    if (uploadedImages.length + files.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 타입 체크
    const invalidFiles = files.filter(file => !acceptedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert('지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 가능)');
      return;
    }

    setIsUploading(true);

    try {
      const newImages = await uploadToServer(files);
      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      onUpload?.(updatedImages);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert(error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      acceptedTypes.includes(file.type)
    );
    
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
    // input value 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    const updatedImages = uploadedImages.filter(img => img.id !== id);
    setUploadedImages(updatedImages);
    onUpload?.(updatedImages);
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      // CloudFront URL에 프로토콜 추가
      const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      await navigator.clipboard.writeText(`![이미지](${formattedUrl})`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* 업로드 영역 */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${(isUploading || disabled || !slug) ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          `}
          style={{
            borderColor: isDragOver ? 'var(--color-accent)' : 'var(--color-border-secondary)',
            backgroundColor: isDragOver ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)'
          }}
          onDragOver={!disabled && slug ? handleDragOver : undefined}
          onDragLeave={!disabled && slug ? handleDragLeave : undefined}
          onDrop={!disabled && slug ? handleDrop : undefined}
          onClick={!disabled && slug ? () => fileInputRef.current?.click() : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8" style={{ color: 'var(--color-text-tertiary)' }} />
            <div>
              <p className="linear-text-small font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {isUploading 
                  ? '업로드 중...' 
                  : !slug 
                    ? 'Slug를 먼저 입력해주세요' 
                    : '이미지를 드래그하거나 클릭하여 업로드'
                }
              </p>
              <p className="linear-text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {!slug 
                  ? '이미지 업로드를 위해서는 유효한 Slug가 필요합니다'
                  : `JPEG, PNG, GIF, WebP 형식 지원 (최대 ${maxFiles}개)`
                }
              </p>
            </div>
          </div>
        </div>

        {/* 업로드된 이미지 목록 */}
        {uploadedImages.length > 0 && (
          <div className="space-y-3">
            <h3 className="linear-text-small font-medium" style={{ color: 'var(--color-text-primary)' }}>
              업로드된 이미지 ({uploadedImages.length}/{maxFiles})
            </h3>
            
            <div className="space-y-2">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border-primary)'
                  }}
                >
                  <ImageIcon className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="linear-text-small font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {image.name}
                    </p>
                    <p className="linear-text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(image.url, image.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors linear-text-xs"
                      style={{ 
                        backgroundColor: copiedId === image.id ? 'var(--color-success-bg)' : 'var(--color-bg-tertiary)',
                        color: copiedId === image.id ? 'var(--color-success)' : 'var(--color-text-secondary)'
                      }}
                      title="마크다운 형식으로 복사"
                    >
                      {copiedId === image.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          복사
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="p-1 rounded-md hover:bg-red-100 transition-colors"
                      style={{ color: '#ef4444' }}
                      title="이미지 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 도움말 */}
        <div className="linear-text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          💡 팁: 복사 버튼을 클릭하면 마크다운 형식으로 클립보드에 복사됩니다. 본문에 붙여넣기하여 이미지를 삽입하세요.
        </div>
      </div>
    </div>
  );
}
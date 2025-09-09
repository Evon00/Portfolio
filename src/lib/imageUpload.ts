// 이미지 업로드 관련 유틸리티 함수들

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

// 허용되는 이미지 타입
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 파일 유효성 검사
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: '지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: '파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.'
    };
  }

  return { isValid: true };
};

// 파일을 Base64 URL로 변환 (임시 구현)
export const fileToUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 이미지 업로드 API 호출 (현재는 모의 구현)
export const uploadImage = async (file: File): Promise<UploadedImage> => {
  // 파일 유효성 검사
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // TODO: 실제 API 호출로 대체 예정
  // const formData = new FormData();
  // formData.append('image', file);
  // const response = await fetch('/api/upload/image', {
  //   method: 'POST',
  //   body: formData,
  // });
  // const result = await response.json();
  // return result;

  // 임시 구현: 파일을 Base64 URL로 변환
  const url = await fileToUrl(file);
  
  return {
    id: Date.now().toString(),
    name: file.name,
    url,
    size: file.size,
    type: file.type
  };
};

// 다중 이미지 업로드
export const uploadMultipleImages = async (files: FileList | File[]): Promise<UploadedImage[]> => {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map(uploadImage);
  
  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw error;
  }
};

// 드래그 앤 드롭 이벤트 처리
export const handleDragAndDrop = (
  e: React.DragEvent,
  onFilesSelected: (files: File[]) => void
) => {
  e.preventDefault();
  e.stopPropagation();

  if (e.type === 'drop') {
    const files = Array.from(e.dataTransfer.files).filter(file => 
      ALLOWED_IMAGE_TYPES.includes(file.type)
    );
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }
};

// 파일 크기를 읽기 쉬운 형태로 변환
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 이미지 프리뷰 생성
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
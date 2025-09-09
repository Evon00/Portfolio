'use client';

import { useState } from 'react';

interface ImageSliderProps {
  images: string[];
  title: string;
  className?: string;
}

export default function ImageSlider({ images, className = '' }: Omit<ImageSliderProps, 'title'>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    // 이미지가 없을 때 기본 플레이스홀더
    return (
      <div className={`relative rounded-lg ${className}`} style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2 opacity-50">🚀</div>
            <p className="linear-text-small" style={{ color: 'var(--color-text-tertiary)' }}>프로젝트 이미지</p>
          </div>
        </div>
      </div>
    );
  }

  const goToPrevious = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(index);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* 메인 이미지 */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="relative aspect-video rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                {image && typeof image === 'string' ? (
                  <>
                    <img
                      src={image}
                      alt={`프로젝트 이미지 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    {/* 이미지 로드 실패시 폴백 */}
                    <div className="absolute inset-0 items-center justify-center" style={{ display: 'none' }}>
                      <div className="text-center">
                        <div className="text-4xl mb-2 opacity-40">🖼️</div>
                        <p className="linear-text-small" style={{ color: 'var(--color-text-tertiary)' }}>이미지 로드 실패</p>
                      </div>
                    </div>
                  </>
                ) : (
                  // 이미지가 null이거나 undefined인 경우
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2 opacity-40">🖼️</div>
                      <p className="linear-text-small" style={{ color: 'var(--color-text-tertiary)' }}>이미지 {index + 1}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 이전/다음 버튼 */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => goToPrevious(e)}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 z-50"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-secondary)'
              }}
              aria-label="이전 이미지"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => goToNext(e)}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 z-50"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-secondary)'
              }}
              aria-label="다음 이미지"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 이미지 카운터 - 중앙 상단으로 이동 */}
        {images.length > 1 && (
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 linear-text-mini px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: 'var(--color-bg-primary)', 
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-secondary)'
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* 도트 인디케이터 */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 z-50"
              style={{
                backgroundColor: currentIndex === index 
                  ? 'var(--color-accent-primary)' 
                  : 'var(--color-border-secondary)'
              }}
              aria-label={`이미지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
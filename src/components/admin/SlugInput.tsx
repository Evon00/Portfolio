'use client';

import { useState, useCallback } from 'react';
import { Check, X, RefreshCw, Search } from 'lucide-react';

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, error?: string) => void;
  checkSlugExists: (slug: string) => Promise<boolean>;
  suggestSlug?: (title: string) => Promise<string>;
  title?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  urlPrefix?: string; // "/blog/" 또는 "/projects/"
}

export const SlugInput = ({
  value,
  onChange,
  onValidation,
  checkSlugExists,
  suggestSlug,
  title = '',
  disabled = false,
  placeholder = 'my-awesome-post',
  className = '',
  urlPrefix = '/blog/'
}: SlugInputProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');

  // Slug 유효성 검사
  const validateSlug = (slug: string): string | null => {
    if (!slug) {
      return 'Slug는 필수입니다.';
    }
    
    if (slug.length < 3) {
      return 'Slug는 최소 3자 이상이어야 합니다.';
    }
    
    if (slug.length > 100) {
      return 'Slug는 100자 이하여야 합니다.';
    }
    
    // URL에 안전한 문자만 허용 (영문, 숫자, 하이픈, 언더스코어)
    const slugPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!slugPattern.test(slug)) {
      return 'Slug는 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.';
    }
    
    // 하이픈으로 시작하거나 끝나면 안됨
    if (slug.startsWith('-') || slug.endsWith('-')) {
      return 'Slug는 하이픈(-)으로 시작하거나 끝날 수 없습니다.';
    }
    
    return null;
  };

  // 수동 중복 검사 함수
  const checkSlugValidation = async (slug?: string) => {
    const targetSlug = slug || value;
    
    if (!targetSlug) {
      setIsValid(null);
      setError('');
      onValidation?.(false, 'Slug는 필수입니다.');
      return;
    }

    const validationError = validateSlug(targetSlug);
    if (validationError) {
      setIsValid(false);
      setError(validationError);
      onValidation?.(false, validationError);
      return;
    }

    setIsChecking(true);
    try {
      const exists = await checkSlugExists(targetSlug);
      if (exists) {
        setIsValid(false);
        setError('이미 사용 중인 slug입니다.');
        onValidation?.(false, '이미 사용 중인 slug입니다.');
      } else {
        setIsValid(true);
        setError('');
        onValidation?.(true);
      }
    } catch (error) {
      setIsValid(false);
      setError('Slug 확인 중 오류가 발생했습니다.');
      onValidation?.(false, 'Slug 확인 중 오류가 발생했습니다.');
    } finally {
      setIsChecking(false);
    }
  };


  // 제목 기반 slug 제안
  const handleSuggestSlug = async () => {
    if (!suggestSlug || !title.trim()) return;
    
    try {
      const suggested = await suggestSlug(title);
      setSuggestion(suggested);
    } catch (error) {
      console.error('Failed to suggest slug:', error);
    }
  };

  // 제안된 slug 사용
  const useSuggestion = () => {
    if (suggestion) {
      onChange(suggestion);
      setSuggestion('');
    }
  };

  // Slug 포맷팅
  const formatSlug = (input: string): string => {
    return input
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSlug(e.target.value);
    onChange(formatted);
  };

  // 엔터 키 누르면 즉시 검증
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value) {
        checkSlugValidation(value);
      }
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <label className="block linear-text-small font-medium" style={{ color: 'var(--color-text-primary)' }}>
          URL Slug *
        </label>
        <button
          type="button"
          onClick={() => checkSlugValidation()}
          className="linear-text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
          style={{ 
            color: 'var(--color-accent)', 
            backgroundColor: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-secondary)'
          }}
          disabled={disabled || !value || isChecking}
        >
          <Search className="w-3 h-3" />
          중복 검사
        </button>
      </div>
      
      <div className="relative">
        <div className="flex">
          <span 
            className="inline-flex items-center px-3 rounded-l-lg border border-r-0 linear-text-small"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-tertiary)'
            }}
          >
            {urlPrefix}
          </span>
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={`
              flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border linear-text-small transition-all duration-200
              ${disabled ? 'cursor-not-allowed opacity-60' : ''}
            `}
            style={{
              backgroundColor: disabled ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
              borderColor: isValid === false ? '#ef4444' : isValid === true ? '#10b981' : 'var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              outline: 'none'
            }}
          />
        </div>
        
        {/* 상태 아이콘 */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isChecking && (
            <div 
              className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent"
              style={{ borderColor: 'var(--color-accent)' }}
            ></div>
          )}
          {!isChecking && isValid === true && (
            <Check className="h-4 w-4" style={{ color: '#10b981' }} />
          )}
          {!isChecking && isValid === false && (
            <X className="h-4 w-4" style={{ color: '#ef4444' }} />
          )}
        </div>
      </div>

      {/* 제안 */}
      {suggestion && (
        <div 
          className="mt-2 p-3 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-bg-tertiary)',
            borderColor: 'var(--color-border-secondary)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
              제안: <code 
                className="px-2 py-1 rounded text-xs font-mono"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)'
                }}
              >{suggestion}</code>
            </span>
            <button
              type="button"
              onClick={useSuggestion}
              className="linear-text-xs px-2 py-1 rounded-md font-medium transition-colors"
              style={{ 
                color: 'var(--color-accent)',
                backgroundColor: 'var(--color-bg-secondary)'
              }}
              disabled={disabled}
            >
              사용하기
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-2 linear-text-small" style={{ color: '#ef4444' }}>{error}</p>
      )}

      {/* 도움말 */}
      {!error && (
        <p className="mt-2 linear-text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          URL에 사용될 고유한 식별자입니다. 영문, 숫자, 하이픈(-), 언더스코어(_) 사용 가능 
          <br />
          💡 엔터 키 또는 '중복 검사' 버튼으로 수동 검증
        </p>
      )}
    </div>
  );
};
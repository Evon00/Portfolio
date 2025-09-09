'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, isAuthenticated, saveToken, type LoginCredentials } from '@/lib/auth';

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 이미 로그인된 경우 대시보드로 리디렉션
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      
      if (result.success && result.token) {
        saveToken(result.token);
        router.push('/admin/dashboard');
      } else {
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError(''); // 입력 시 에러 메시지 초기화
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="linear-title-2 mb-2">
            관리자 로그인
          </h2>
          <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>
            포트폴리오 관리 시스템에 로그인하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="linear-card p-8 space-y-6">
            {/* 아이디 입력 */}
            <div>
              <label htmlFor="username" className="block linear-text-small font-medium mb-2">
                아이디
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleInputChange('username')}
                className="linear-input"
                placeholder="관리자 아이디를 입력하세요"
                disabled={isLoading}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block linear-text-small font-medium mb-2">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleInputChange('password')}
                className="linear-input"
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-lg p-3" style={{ backgroundColor: '#2a1b1b', border: '1px solid #4a2626' }}>
                <div className="flex">
                  <svg className="h-5 w-5" style={{ color: '#ff6b6b' }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-2 text-sm" style={{ color: '#ff9999' }}>{error}</p>
                </div>
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="w-full linear-button-primary flex justify-center py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </div>
        </form>


        {/* 메인 사이트로 돌아가기 */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-medium transition-colors" 
            style={{ color: 'var(--color-accent-primary)' }}
          >
            ← 메인 사이트로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
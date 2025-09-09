'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 모바일 메뉴가 열려있을 때 스크롤 방지
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/projects', label: 'Projects' },
    { href: '/admin', label: 'Admin' }
  ];

  return (
    <header 
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ 
        backgroundColor: 'rgba(10, 10, 10, 0.8)', 
        borderColor: 'var(--color-border-primary)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="linear-title-5 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--color-text-primary)' }}
            >
              유재혁
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg linear-text-regular font-medium transition-all duration-200 hover:opacity-80 ${
                  isActive(item.href)
                    ? 'linear-tag-accent'
                    : ''
                }`}
                style={{ 
                  color: isActive(item.href) 
                    ? 'var(--color-accent-primary)' 
                    : 'var(--color-text-secondary)' 
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: 'var(--color-text-secondary)',
                backgroundColor: isMenuOpen ? 'var(--color-bg-tertiary)' : 'transparent'
              }}
              aria-label="메뉴 열기"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 linear-modal-backdrop"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* 메뉴 컨텐츠 */}
          <div 
            className="absolute top-0 right-0 w-64 h-full border-l backdrop-blur-md"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)', 
              borderColor: 'var(--color-border-primary)' 
            }}
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
              <span className="linear-text-regular font-medium" style={{ color: 'var(--color-text-primary)' }}>
                메뉴
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent'
                }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 네비게이션 링크 */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg linear-text-regular font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'linear-tag-accent'
                      : 'hover:bg-gray-800'
                  }`}
                  style={{ 
                    color: isActive(item.href) 
                      ? 'var(--color-accent-primary)' 
                      : 'var(--color-text-secondary)',
                    backgroundColor: isActive(item.href) 
                      ? 'rgba(94, 106, 210, 0.1)' 
                      : 'transparent'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
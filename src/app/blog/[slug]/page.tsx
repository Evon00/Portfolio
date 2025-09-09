'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogService, type BlogPost } from '@/services/blogService';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // params가 Promise이므로 resolve
        const resolvedParams = await params;
        
        // API에서 게시글 조회
        const foundPost = await blogService.getBySlug(resolvedParams.slug);
        
        if (!foundPost) {
          notFound();
          return;
        }

        setPost(foundPost);

        // 관련 게시글 조회
        try {
          const allPostsResponse = await blogService.getBlogPosts(0, 10);
          const related = allPostsResponse.posts
            .filter(p => p.id !== foundPost.id && p.techStack.some(tech => foundPost.techStack.includes(tech)))
            .slice(0, 2);
          setRelatedPosts(related);
        } catch (relatedErr) {
          console.warn('관련 게시글 로드 실패:', relatedErr);
        }

      } catch (err) {
        console.error('게시글 로드 실패:', err);
        setError(err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [params]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="linear-text-regular text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="linear-button-primary"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 게시글이 없는 경우
  if (!post) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 네비게이션 */}
        <nav className="mb-8">
          <Link
            href="/blog"
            className="group linear-button-secondary flex items-center gap-2 w-fit"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            블로그 목록으로 돌아가기
          </Link>
        </nav>

        {/* 게시글 헤더 */}
        <header className="linear-card p-8 mb-8">
          <h1 className="linear-title-1 mb-6">
            {post.title}
          </h1>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-6 linear-text-small">
              <span className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                조회수 {post.viewCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                읽는 시간 {post.readTime}분
              </span>
            </div>
          </div>

          {/* 기술 스택 태그 */}
          <div className="flex flex-wrap gap-3 mb-6">
            {post.techStack.map((tech) => (
              <Link
                key={tech}
                href={`/blog?tech=${encodeURIComponent(tech)}`}
                className="linear-tag"
              >
                {tech}
              </Link>
            ))}
          </div>

          {/* 요약 */}
          <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h2 className="linear-text-medium mb-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                <span className="text-white text-xs">📝</span>
              </div>
              요약
            </h2>
            <p className="linear-text-regular" style={{ color: 'var(--color-text-secondary)' }}>{post.summary}</p>
          </div>
        </header>

        {/* 게시글 본문 */}
        <article className="linear-card p-8 mb-12">
          <MarkdownRenderer 
            content={post.content}
            className="leading-relaxed"
          />
        </article>

        {/* 관련 게시글 */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="linear-title-2 mb-8 text-center">
              관련 게시글
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group linear-card transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <div className="h-32 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-2 opacity-80">📖</div>
                        <p className="text-xs font-medium linear-text-small">관련 글</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="linear-text-medium mb-3 group-hover:opacity-75 transition-opacity line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="linear-text-small mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {relatedPost.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="linear-tag">
                        {new Date(relatedPost.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="linear-text-small">{relatedPost.readTime}분 읽기</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
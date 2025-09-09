'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 코드 블록에서 텍스트 추출하는 함수
  const extractCodeText = (children: React.ReactNode): string => {
    if (typeof children === 'string') {
      return children;
    }
    if (React.isValidElement(children) && children.props?.children) {
      return extractCodeText(children.props.children);
    }
    if (Array.isArray(children)) {
      return children.map(child => extractCodeText(child)).join('');
    }
    return '';
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text.trim());
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text.trim();
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  let codeBlockIndex = 0;

  return (
    <div className={`prose prose-lg prose-gray max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 코드 블록 스타일링
          pre: ({ children, ...props }) => {
            const currentIndex = codeBlockIndex++;
            const codeText = extractCodeText(children);
            const isCopied = copiedIndex === currentIndex;
            
            return (
              <div className="relative my-6">
                <div className="px-4 py-2 flex items-center justify-between rounded-t-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <span className="linear-text-small font-medium">Code</span>
                  <button
                    onClick={() => copyToClipboard(codeText, currentIndex)}
                    className="flex items-center gap-1 linear-text-small px-3 py-1.5 rounded transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: isCopied ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)',
                      color: isCopied ? 'white' : 'var(--color-text-secondary)'
                    }}
                    title={isCopied ? "복사됨!" : "코드 복사"}
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        복사됨
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre 
                  className="p-4 rounded-b-lg overflow-x-auto m-0" 
                  style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                  {...props}
                >
                  {children}
                </pre>
              </div>
            );
          },
          // 인라인 코드 스타일링
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: (props: any) => {
            // pre 태그 내부에 있으면 코드 블록, 아니면 인라인 코드
            const isInline = !props.className;
            if (isInline) {
              return (
                <code 
                  className="px-2 py-1 rounded text-sm font-mono"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
                  {...props}
                >
                  {props.children}
                </code>
              );
            }
            return (
              <code className="text-sm leading-relaxed" {...props}>
                {props.children}
              </code>
            );
          },
          // 이미지 스타일링
          img: ({ src, alt, ...props }) => (
            <>
              <img
                src={src}
                alt={alt}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md my-6"
                style={{ display: 'block', margin: '1.5rem auto' }}
                {...props}
              />
              {alt && (
                <span className="block text-center text-gray-500 text-sm italic" style={{ margin: '0.5rem auto 1.5rem auto' }}>
                  {alt}
                </span>
              )}
            </>
          ),
          // 헤딩 스타일링
          h1: ({ children, ...props }) => (
            <h1 className="linear-title-3 mt-8 mb-4 first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="linear-title-4 mt-6 mb-3" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="linear-title-5 mt-4 mb-2" {...props}>
              {children}
            </h3>
          ),
          // 문단 스타일링
          p: ({ children, ...props }) => (
            <p className="mb-4 linear-text-regular leading-relaxed" style={{ color: 'var(--color-text-secondary)' }} {...props}>
              {children}
            </p>
          ),
          // 리스트 스타일링
          ul: ({ children, ...props }) => (
            <ul className="mb-4 pl-6 list-disc linear-text-regular" style={{ color: 'var(--color-text-secondary)' }} {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-4 pl-6 list-decimal linear-text-regular" style={{ color: 'var(--color-text-secondary)' }} {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="mb-1" {...props}>
              {children}
            </li>
          ),
          // 링크 스타일링
          a: ({ children, href, ...props }) => (
            <a 
              href={href}
              className="underline transition-colors"
              style={{ color: 'var(--color-accent-primary)' }}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          // 블록쿼트 스타일링
          blockquote: ({ children, ...props }) => (
            <blockquote 
              className="pl-4 my-4 italic py-2 rounded-r"
              style={{ 
                borderLeft: `4px solid var(--color-accent-primary)`,
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)'
              }}
              {...props}
            >
              {children}
            </blockquote>
          ),
          // 테이블 스타일링
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full" style={{ borderColor: 'var(--color-border)' }} {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead style={{ backgroundColor: 'var(--color-bg-tertiary)' }} {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody style={{ backgroundColor: 'var(--color-bg-secondary)' }} {...props}>
              {children}
            </tbody>
          ),
          th: ({ children, ...props }) => (
            <th 
              className="px-6 py-3 text-left linear-text-small font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-6 py-4 whitespace-nowrap linear-text-regular" style={{ color: 'var(--color-text-primary)' }} {...props}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
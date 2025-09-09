import { memo, useCallback } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/services/blogService';
import { 
  IMAGE_CONSTANTS, 
  THEME_CONSTANTS, 
  TEXT_CONSTANTS, 
  DATE_CONSTANTS,
  INTERACTION_CONSTANTS 
} from '@/constants/ui';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
  refreshKey?: number;
  className?: string;
}

interface BlogImageProps {
  post: BlogPost;
}

const BlogImage: React.FC<BlogImageProps> = memo(({ post }) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Blog post image failed to load:', post.images?.[0]);
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const fallback = target.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }, [post.images]);

  return (
    <div 
      className="rounded-lg mb-6 border relative overflow-hidden blog-image-container"
      style={{ 
        height: `${IMAGE_CONSTANTS.BLOG_IMAGE_HEIGHT} !important`,
        minHeight: `${IMAGE_CONSTANTS.BLOG_IMAGE_HEIGHT} !important`,
        maxHeight: `${IMAGE_CONSTANTS.BLOG_IMAGE_HEIGHT} !important`,
        background: `linear-gradient(135deg, ${THEME_CONSTANTS.TERTIARY_BG}, ${THEME_CONSTANTS.QUATERNARY_BG})`,
        borderColor: THEME_CONSTANTS.BORDER_SECONDARY,
        display: 'block !important'
      }}
    >
      {post.images?.[0] && (
        <img
          src={post.images[0]}
          alt={post.title}
          className="rounded-lg"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block'
          }}
          onError={handleImageError}
          loading="lazy"
        />
      )}
      <div 
        className="absolute inset-0 flex items-center justify-center text-center"
        style={{ display: post.images?.[0] ? 'none' : 'flex' }}
      >
        <div>
          <div className="text-2xl mb-2 opacity-60">📖</div>
          <p className="linear-text-mini opacity-60">블로그 포스트</p>
        </div>
      </div>
    </div>
  );
});

BlogImage.displayName = 'BlogImage';

export const BlogCard: React.FC<BlogCardProps> = memo(({ 
  post, 
  index = 0, 
  refreshKey = 0, 
  className = '' 
}) => {
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString(DATE_CONSTANTS.KOREAN_DATE_FORMAT);
  }, []);

  const cardKey = `${post.id}-${post.slug}-${refreshKey}-${index}`;

  return (
    <Link
      key={cardKey}
      href={`/blog/${post.slug}`}
      className={`${INTERACTION_CONSTANTS.CARD_BASE} group h-[36rem] flex flex-col ${className}`}
      aria-label={`${post.title} 블로그 포스트 읽기`}
    >
      <BlogImage post={post} />
      
      <h3 className={`linear-title-5 mb-3 group-hover:text-blue-400 transition-colors ${TEXT_CONSTANTS.TITLE_LINE_CLAMP} min-h-[3rem]`}>
        {post.title}
      </h3>
      
      <p className={`linear-text-regular mb-4 ${TEXT_CONSTANTS.TITLE_LINE_CLAMP} min-h-[2.5rem]`}>
        {post.summary}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4 min-h-[1.5rem]">
        {post.techStack.slice(0, TEXT_CONSTANTS.MAX_TECH_TAGS_DISPLAY).map((tech) => (
          <span
            key={tech}
            className={`${INTERACTION_CONSTANTS.TAG_BASE} text-xs flex-shrink-0 max-w-[8rem]`}
            title={tech}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {tech}
          </span>
        ))}
        {post.techStack.length > TEXT_CONSTANTS.MAX_TECH_TAGS_DISPLAY && (
          <span className={`${INTERACTION_CONSTANTS.TAG_BASE} text-xs`}>
            +{post.techStack.length - TEXT_CONSTANTS.MAX_TECH_TAGS_DISPLAY}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-auto">
        <span className="linear-text-small">{formatDate(post.createdAt)}</span>
        <span className="linear-text-small">{post.readTime}{DATE_CONSTANTS.READ_TIME_SUFFIX}</span>
      </div>
    </Link>
  );
});

BlogCard.displayName = 'BlogCard';
import Link from 'next/link';
import { Calendar, Clock, Eye, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { CoverImage } from '@/components/shared/cover-image';
import { ROUTES } from '@/lib/constants';
import { formatShortDate, formatViews } from '@/lib/format';
import type { Article } from '@/types';
import { getAvatarFallback } from '@/lib/utils';

interface ArticleListCardProps {
  article: Article;
  compact?: boolean;
  priority?: boolean;
}

export function ArticleListCard({ article, compact, priority = false }: ArticleListCardProps) {
  return (
    <Link
      href={ROUTES.blogDetail(article.slug)}
      className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:shadow-md sm:gap-5"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-36">
        <CoverImage
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="144px"
          priority={priority}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {article.category.name}
          </Badge>
          {article.trending && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-primary">
              <TrendingUp className="h-3 w-3" /> Trending
            </span>
          )}
        </div>
        <h3
          className="mb-2 line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {article.title}
        </h3>
        {!compact && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground hidden sm:block">
            {article.excerpt}
          </p>
        )}
        {compact && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:gap-4 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 shrink">
            <CoverImage
              src={getAvatarFallback(article.author.avatar)}
              alt={article.author.name}
              width={16}
              height={16}
              className="h-4 w-4 rounded-full shrink-0"
            />
            <span className="truncate" title={article.author.name}>{article.author.name}</span>
          </div>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3 shrink-0" />
            {article.readTime} min read
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3 shrink-0" />
            {formatShortDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Eye className="h-3 w-3 shrink-0" />
            {formatViews(article.views)} views
          </span>
        </div>
      </div>
    </Link>
  );
}

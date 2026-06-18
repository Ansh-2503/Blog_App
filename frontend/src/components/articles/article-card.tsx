import Link from 'next/link';
import { Calendar, Clock, Eye, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { CoverImage } from '@/components/shared/cover-image';
import { ROUTES } from '@/lib/constants';
import { formatShortDate, formatViews } from '@/lib/format';
import type { Article } from '@/types';
import { getAvatarFallback } from '@/lib/utils';

export type ArticleCardVariant =
  | 'default'
  | 'compact'
  | 'featured'
  | 'trending';

interface ArticleCardProps {
  article: Article;
  variant?: ArticleCardVariant;
  priority?: boolean;
}

export function ArticleCard({ article, variant = 'default', priority = false }: ArticleCardProps) {
  const href = ROUTES.blogDetail(article.slug);

  if (variant === 'featured') {
    return (
      <Link href={href} className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative h-72 overflow-hidden">
            <CoverImage
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Featured
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge variant="secondary" className="mb-3 text-xs">
                {article.category.name}
              </Badge>
              <h2
                className="mb-3 text-xl font-semibold leading-snug text-white transition-colors group-hover:text-primary-foreground/90"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {article.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-white/70 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 shrink">
                  <CoverImage
                    src={getAvatarFallback(article.author.avatar)}
                    alt={article.author.name}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover shrink-0"
                  />
                  <span className="truncate" title={article.author.name}>{article.author.name}</span>
                </div>
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3 shrink-0" />
                  {article.readTime} min
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {formatShortDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Eye className="h-3 w-3 shrink-0" />
                  {formatViews(article.views)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group flex gap-3 border-b border-border py-3 last:border-0"
      >
        <div className="min-w-0 flex-1">
          <Badge variant="outline" className="mb-1.5 text-xs">
            {article.category.name}
          </Badge>
          <h4 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h4>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground min-w-0">
            <span className="truncate" title={article.author.name}>{article.author.name}</span>
            <span className="flex items-center gap-0.5 shrink-0">
              <Clock className="h-3 w-3 shrink-0" />
              {article.readTime}m
            </span>
          </div>
        </div>
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          <CoverImage
            src={article.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      </Link>
    );
  }

  const cardInner = (
    <>
      <div className="relative h-44 overflow-hidden bg-muted">
        <CoverImage
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
        />
        {article.trending && (
          <div className="absolute left-3 top-3">
            <span className="flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
              <TrendingUp className="h-3 w-3 text-primary" /> Trending
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <Badge variant="secondary" className="mb-2 text-xs">
          {article.category.name}
        </Badge>
        <h3
          className="mb-2 line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {article.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        {variant === 'trending' ? (
          <div className="space-y-2.5 border-t border-border pt-3">
            <div className="flex items-center justify-between text-xs gap-2 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 shrink">
                <CoverImage
                  src={getAvatarFallback(article.author.avatar)}
                  alt={article.author.name}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-cover shrink-0"
                />
                <span className="font-medium text-foreground truncate" title={article.author.name}>
                  {article.author.name}
                </span>
              </div>
              <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                <Calendar className="h-3 w-3 shrink-0" />
                {formatShortDate(article.publishedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatViews(article.views)} views
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 shrink">
              <CoverImage
                src={getAvatarFallback(article.author.avatar)}
                alt={article.author.name}
                width={18}
                height={18}
                className="h-4.5 w-4.5 rounded-full object-cover shrink-0"
              />
              <span className="truncate" title={article.author.name}>{article.author.name}</span>
            </div>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3 shrink-0" />
              {article.readTime} min
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3 shrink-0" />
              {formatShortDate(article.publishedAt)}
            </span>
            <span className="ml-auto flex items-center gap-1 shrink-0">
              <Eye className="h-3 w-3 shrink-0" />
              {formatViews(article.views)}
            </span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      {cardInner}
    </Link>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  Eye,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import { ArticleBody } from '@/components/blog/article-body';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoverImage } from '@/components/shared/cover-image';
import { getRelatedArticles } from '@/lib/articles';
import { ROUTES } from '@/lib/constants';
import { formatFollowers, formatLongDate, formatShortDate, formatViews } from '@/lib/format';
import type { Article } from '@/types';
import { getAvatarFallback } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/context/auth-store';

interface BlogDetailViewProps {
  article: Article;
}

const PdfDownloadButton = dynamic(
  () => import('@/components/blog/pdf-download-button'),
  { 
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground opacity-50 cursor-not-allowed"
      >
        <Download className="h-4 w-4" /> Loading PDF...
      </button>
    )
  }
);

export function BlogDetailView({ article }: BlogDetailViewProps) {
  const relatedArticles = getRelatedArticles(article);
  const [isClient, setIsClient] = useState(false);
  const [viewCount, setViewCount] = useState(article.views);
  const { user } = useAuthStore();
  const hasRecordedView = useRef(false);

  useEffect(() => {
    setIsClient(true);

    if (user && article.id && !hasRecordedView.current) {
      hasRecordedView.current = true;
      apiFetch(`/posts/${article.id}/view`, { method: 'PATCH' })
        .then((res) => {
          if (res.views) {
            setViewCount(res.views);
          }
        })
        .catch((err) => {
          console.error('Failed to record view:', err);
        });
    }
  }, [article.id, user]);

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link href={ROUTES.home} className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.blog} className="transition-colors hover:text-foreground">
            Articles
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={ROUTES.category(article.category.slug)}
            className="transition-colors hover:text-foreground"
          >
            {article.category.name}
          </Link>
        </nav>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-72 overflow-hidden rounded-2xl bg-muted md:h-96">
          <CoverImage
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <article>
            <div className="mb-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{article.category.name}</Badge>
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1
                className="mb-5 text-3xl font-medium leading-tight text-foreground md:text-4xl"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {article.title}
              </h1>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
                <div className="flex items-center gap-3">
                  <CoverImage
                    src={getAvatarFallback(article.author.avatar)}
                    alt={article.author.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-border"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {article.author.name}
                    </p>

                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTime} min read
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatLongDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatViews(viewCount)} views
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <PdfDownloadButton article={article} />
              </div>
            </div>

            <ArticleBody content={(article as any).content || (article as any).htmlContent} />
          </article>
        </div>

        <div className="mt-8">
          <Link
            href={ROUTES.blog}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
}

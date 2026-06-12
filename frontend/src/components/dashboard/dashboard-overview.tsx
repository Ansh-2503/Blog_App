'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import {ArrowUpRight,Clock,Edit,ExternalLink,Eye,FileText,Heart,Plus,TrendingUp,Users,} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CoverImage } from '@/components/shared/cover-image';
import { DASHBOARD_STATS } from '@/lib/data';
import { ARTICLE_STATUS_STYLES } from '@/lib/article-status';
import { ROUTES } from '@/lib/constants';
import { formatViews } from '@/lib/format';
import { useAuthStore } from '@/context/auth-store';


function StatCard({
  label,
  value,
  change,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
          <TrendingUp className="h-3 w-3" /> {change}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mb-1 h-8 w-20 animate-pulse" />
      ) : (
        <p className="mb-0.5 text-2xl font-bold text-foreground">{value}</p>
      )}
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function DashboardOverview() {
  const { user } = useAuthStore();
  
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['creator-articles', user?.id],
    queryFn: async () => {
      const data = await apiFetch(`/posts?author=${user?.id}`);
      return data;
    },
    enabled: !!user?.id,
  });

  const articles = responseData?.data || [];
  const recentArticles = articles.slice(0, 5);

  const totalViews = articles.reduce((sum: number, article: any) => sum + (article.views || 0), 0);
  const publishedCount = articles.filter((article: any) => article.status === 'published').length;
  const draftCount = articles.filter((article: any) => article.status === 'draft').length;

  return (
    <div className="max-w-6xl p-6">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Welcome back, {user?.name || 'Creator'} 👋
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.newArticle} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> New Article
          </Link>
        </Button>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Views"
          value={formatViews(totalViews)}
          change="+12.4%"
          icon={Eye}
          isLoading={isLoading}
        />
        <StatCard
          label="Published"
          value={publishedCount}
          change="+2"
          icon={FileText}
          isLoading={isLoading}
        />
      </div>

      <div className="mb-5 grid gap-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Content Summary
          </h3>
          <div className="space-y-3">
            {[
              {
                label: 'Published',
                value: isLoading ? '...' : publishedCount,
                color: 'bg-green-500',
              },
              {
                label: 'Drafts',
                value: isLoading ? '...' : draftCount,
                color: 'bg-yellow-500',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {value}
                  </span>
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Total articles
                </span>
                <span className="text-sm font-bold text-foreground">
                  {isLoading ? '...' : articles.length}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full text-sm" asChild>
            <Link href={ROUTES.articles}>Manage articles</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Articles</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.articles} className="text-xs">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg animate-pulse" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3 animate-pulse" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-10 animate-pulse" />
                    <Skeleton className="h-3 w-10 animate-pulse" />
                    <Skeleton className="h-3 w-10 animate-pulse" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full animate-pulse" />
                <div className="flex shrink-0 items-center gap-1">
                  <Skeleton className="h-7 w-7 rounded-md animate-pulse" />
                  <Skeleton className="h-7 w-7 rounded-md animate-pulse" />
                </div>
              </div>
            ))
          ) : recentArticles.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No recent articles found.
            </div>
          ) : (
            recentArticles.map((article: any) => (
              <div
                key={article.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/30"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <CoverImage
                    src={article.coverImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {article.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {formatViews(article.views)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3 w-3" />
                      {article.likes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {article.readTime}m
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${ARTICLE_STATUS_STYLES[article.status] || ARTICLE_STATUS_STYLES.draft}`}
                >
                  {article.status}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href={ROUTES.editArticle(article.id)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href={ROUTES.blogDetail(article.slug)} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

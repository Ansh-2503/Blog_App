'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { ArticleListCard } from '@/components/articles/article-list-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORIES } from '@/lib/data';
import { SORT_OPTIONS } from '@/lib/articles';
import type { SortOption } from '@/lib/articles';
import { ROUTES } from '@/lib/constants';
import { apiFetch } from '@/lib/api-client';

// Listing Skeleton Component
function ArticleListCardSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 md:flex-row">
      <Skeleton className="h-44 w-full rounded-xl md:w-64 shrink-0" />
      <div className="flex flex-1 flex-col justify-between py-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-7 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogListing() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('latest');

  // React Query fetch request
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['posts', { search, category: selectedCategory, sort }],
    queryFn: async () => {
      const categoryParam = selectedCategory ? `&category=${selectedCategory}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const sortParam = `&sort=${sort}`;
      const data = await apiFetch(`/posts?status=published${categoryParam}${searchParam}${sortParam}`);
      return data;
    },
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await apiFetch(`/posts/categories`);
      return data;
    },
  });

  const posts = responseData?.data || [];
  const categories = categoriesResponse?.data || CATEGORIES;

  const selectedCategoryName = categories.find(
    (c: any) => c.slug === selectedCategory,
  )?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1
          className="mb-2 text-3xl font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          All Articles
        </h1>
        <p className="text-muted-foreground">
          Deep technical content written by engineers in the field.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, topics, authors..."
            className="h-10 w-full rounded-xl border border-border bg-input-background pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/50"
            aria-label="Search articles"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-10 cursor-pointer rounded-xl border border-border bg-input-background px-3 text-sm text-foreground outline-none"
            aria-label="Sort articles"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="h-10" type="button">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          All Topics
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            type="button"
            onClick={() =>
              setSelectedCategory(
                selectedCategory === cat.slug ? null : cat.slug,
              )
            }
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {cat.name}
            <span className="ml-1.5 opacity-60">{cat.count}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <p className="mb-4 text-sm text-muted-foreground">Loading articles...</p>
          ) : (
            <p className="mb-4 text-sm text-muted-foreground">
              {posts.length} article{posts.length !== 1 ? 's' : ''}
              {selectedCategoryName && ` in ${selectedCategoryName}`}
            </p>
          )}

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
              Failed to retrieve articles. Please check your connection and try again.
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              <ArticleListCardSkeleton />
              <ArticleListCardSkeleton />
              <ArticleListCardSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border py-20 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
              <p className="mb-1 font-medium text-foreground">No articles found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory(null);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((article: any, i: number) => (
                <ArticleListCard key={article.id} article={article} priority={i === 0} />
              ))}
            </div>
          )}
        </div>

        <aside className="hidden w-72 shrink-0 space-y-6 lg:block">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Popular Topics
            </h3>
            <div className="space-y-2">
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.slug ? null : cat.slug,
                    )
                  }
                  className="flex w-full items-center justify-between py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span
                    className={
                      selectedCategory === cat.slug
                        ? 'font-medium text-primary'
                        : ''
                    }
                  >
                    {cat.name}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-primary p-5 text-primary-foreground">
            <h3 className="mb-2 text-sm font-semibold">Write for DevPulse</h3>
            <p className="mb-4 text-xs leading-relaxed opacity-70">
              Share your engineering knowledge with 48k+ developers.
            </p>
            <Button
              size="sm"
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link href={ROUTES.register}>
                Start Writing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';

import { ArticleCard } from '@/components/articles/article-card';
import { NewsletterSection } from '@/components/home/newsletter-section';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/data';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Home | DevPulse',
  description:
    'Engineering insights on TypeScript, Rust, systems design, and modern software.',
};

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').replace('localhost', '127.0.0.1');

async function fetchHomePosts(query: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/posts?status=published&${query}`, {
      next: { revalidate: 30 }, // Cache response for 30s
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
    }
  } catch (error) {
    console.error(`Error fetching home posts [${query}]:`, error);
  }
  return null;
}

async function fetchCategories() {
  try {
    const res = await fetch(`${BACKEND_URL}/posts/categories`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
  return null;
}

export default async function HomePage() {
  // Fetch live data from backend
  const liveTrending = await fetchHomePosts('sort=trending');
  const liveLatest = await fetchHomePosts('sort=latest');
  const liveCategories = await fetchCategories();

  const trendingArticles = liveTrending ? liveTrending.slice(0, 4) : [];
  const latestArticles = liveLatest ? liveLatest.slice(0, 6) : [];
  const categories = liveCategories || CATEGORIES;

  return (
    <div className="bg-background">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Trending Articles</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.blog} className="flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {trendingArticles.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingArticles.map((article: any, i: number) => (
              <ArticleCard key={article.id} article={article} variant="trending" priority={i === 0} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground text-sm">
            No trending articles found at the moment.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl border-t border-border px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-semibold text-foreground">Browse by Topic</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={ROUTES.category(cat.slug)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary/40 hover:bg-accent"
            >
              <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                {cat.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {cat.count} articles
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t border-border px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Latest Articles</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.blog} className="flex items-center gap-1">
              Browse all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {latestArticles.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article: any, i: number) => (
              <ArticleCard key={article.id} article={article} priority={i === 0 && trendingArticles.length === 0} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground text-sm">
            No articles have been published yet. Check back soon!
          </div>
        )}
      </section>

      <NewsletterSection />
    </div>
  );
}

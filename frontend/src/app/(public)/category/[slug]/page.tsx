import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  TrendingUp,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoverImage } from '@/components/shared/cover-image';
import {
  getArticlesByCategorySlug,
  getCategoryBySlug,
} from '@/lib/articles';
import { CATEGORIES } from '@/lib/data';
import { ROUTES } from '@/lib/constants';
import { formatShortDate, formatViews } from '@/lib/format';
import { getAvatarFallback } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').replace('localhost', '127.0.0.1');

async function fetchCategoriesFromServer() {
  try {
    const res = await fetch(`${BACKEND_URL}/posts/categories`, {
      next: { revalidate: 30 },
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

async function fetchArticlesByCategoryFromServer(slug: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/posts?status=published&category=${slug}`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
    }
  } catch (error) {
    console.error(`Error fetching articles for category [${slug}]:`, error);
  }
  return null;
}

export async function generateStaticParams() {
  // Return static paths for prerendering fallback (optional)
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: 'Category' };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch real categories and articles from backend
  const serverCategories = await fetchCategoriesFromServer();
  const allCategories = serverCategories || CATEGORIES;
  
  const category = allCategories.find((c: any) => c.slug === slug) ?? allCategories[0];
  
  const serverArticles = await fetchArticlesByCategoryFromServer(category.slug);
  const articles = serverArticles || getArticlesByCategorySlug(category.slug);
  
  const otherCategories = allCategories.filter((c: any) => c.slug !== category.slug);
  const totalViewsK =
    articles.length > 0
      ? Math.round(articles.reduce((s: number, a: any) => s + a.views, 0) / 1000)
      : 0;

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav
            className="mb-5 flex items-center gap-2 text-sm text-muted-foreground"
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
            <span className="text-foreground">{category.name}</span>
          </nav>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1
                className="mb-3 text-4xl font-medium text-foreground"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {category.name}
              </h1>
              <p className="max-w-lg text-muted-foreground">{category.description}</p>
              <div className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">{category.count}</strong>{' '}
                  articles
                </span>
                <span>
                  <strong className="text-foreground">{totalViewsK}k</strong> total
                  views
                </span>
              </div>
            </div>
            <Button asChild className="hidden sm:flex">
              <Link href={ROUTES.newArticle}>Write in {category.name}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {articles.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border py-20 text-center">
                <p className="font-medium text-foreground">
                  No published articles in {category.name} yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first to write one!
                </p>
                <Button className="mt-4" asChild>
                  <Link href={ROUTES.newArticle}>Write Article</Link>
                </Button>
              </div>
            ) : (
              <>
                {articles[0] && (
                  <Link
                    href={ROUTES.blogDetail(articles[0].slug)}
                    className="group mb-8 block"
                  >
                    <div className="relative mb-5 h-64 overflow-hidden rounded-2xl bg-muted">
                      <CoverImage
                        src={articles[0].coverImage}
                        alt={articles[0].title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <Badge className="mb-2 bg-primary text-xs text-primary-foreground">
                          Featured
                        </Badge>
                        <h2
                          className="text-xl font-semibold text-white"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {articles[0].title}
                        </h2>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="space-y-4">
                  {articles.slice(1).map((article: any) => (
                    <Link
                      key={article.id}
                      href={ROUTES.blogDetail(article.slug)}
                      className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <CoverImage
                          src={article.coverImage}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="96px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        {article.trending && (
                          <span className="mb-1 flex items-center gap-1 text-xs font-medium text-primary">
                            <TrendingUp className="h-3 w-3" /> Trending
                          </span>
                        )}
                        <h3
                          className="mb-2 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {article.title}
                        </h3>
                        <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CoverImage
                              src={getAvatarFallback(article.author.avatar)}
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4 rounded-full"
                            />
                            <span>{article.author.name}</span>
                          </div>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {article.readTime}m
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-3 w-3" />
                            {formatShortDate(article.publishedAt)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-3 w-3" />
                            {formatViews(article.views)} views
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="hidden space-y-5 lg:col-span-1 lg:block">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Other Topics
              </h3>
              <div className="space-y-1">
                {otherCategories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={ROUTES.category(cat.slug)}
                    className="group flex items-center justify-between py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="transition-colors group-hover:text-primary">
                      {cat.name}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {cat.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/8 p-5">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Write in {category.name}
              </h3>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                Share your expertise with thousands of engineers.
              </p>
              <Button size="sm" className="w-full" asChild>
                <Link href={ROUTES.register}>
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

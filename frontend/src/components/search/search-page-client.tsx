'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Eye, Search, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoverImage } from '@/components/shared/cover-image';
import { AUTHORS } from '@/lib/data';
import { ROUTES } from '@/lib/constants';
import { formatShortDate, formatViews } from '@/lib/format';
import { getAvatarFallback } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';
import type { Category, Article } from '@/types';

type SearchTab = 'articles' | 'authors' | 'topics';

const SUGGESTED_TERMS = ['TypeScript', 'Rust', 'Kubernetes', 'Architecture', 'AI/ML'];

interface SearchPageClientProps {
  categories: Category[];
}

export function SearchPageClient({ categories }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(qParam);
  const [activeTab, setActiveTab] = useState<SearchTab>('articles');

  const q = qParam.toLowerCase();

  const [articleResults, setArticleResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!qParam) {
      setArticleResults([]);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/posts?search=${encodeURIComponent(qParam)}`);
        if (res.success) {
          setArticleResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [qParam]);

  const authorResults = useMemo(
    () =>
      AUTHORS.filter(
        (a) =>
          !q ||
          a.name.toLowerCase().includes(q),
      ),
    [q],
  );

  const categoryResults = useMemo(
    () =>
      categories.filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      ),
    [q, categories],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    router.push(query.trim() ? `${ROUTES.search}?${params}` : ROUTES.search);
  };

  const applySuggestedTerm = (term: string) => {
    setQuery(term);
    router.push(`${ROUTES.search}?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, authors, topics..."
              className="h-12 w-full rounded-xl border border-border bg-input-background pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-ring/50"
              aria-label="Search"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-6">
            Search
          </Button>
        </form>

        {q && (
          <p className="mt-4 text-sm text-muted-foreground">
            Showing results for{' '}
            <strong className="text-foreground">&quot;{qParam}&quot;</strong>
            {' — '}
            <span>
              {articleResults.length} articles, {authorResults.length} authors,{' '}
              {categoryResults.length} topics
            </span>
          </p>
        )}
      </div>

      {q ? (
        <>
          <div className="mb-6 flex gap-1 border-b border-border">
            {(
              [
                { key: 'articles' as const, label: 'Articles', count: articleResults.length },
                { key: 'authors' as const, label: 'Authors', count: authorResults.length },
                { key: 'topics' as const, label: 'Topics', count: categoryResults.length },
              ] as const
            ).map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                  {count}
                </span>
              </button>
            ))}
          </div>

          {activeTab === 'articles' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : articleResults.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
                  <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="font-medium text-foreground">No articles found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try different keywords
                  </p>
                </div>
              ) : (
                articleResults.map((article) => (
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
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge variant="secondary" className="mb-1 text-xs">
                        {article.category.name}
                      </Badge>
                      <h3
                        className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {article.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{article.author.name}</span>
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
                ))
              )}
            </div>
          )}

          {activeTab === 'authors' && (
            <div className="space-y-3">
              {authorResults.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
                  <p className="font-medium text-foreground">No authors found</p>
                </div>
              ) : (
                authorResults.map((author) => (
                  <div
                    key={author.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
                  >
                    <CoverImage
                      src={getAvatarFallback(author.avatar)}
                      alt={author.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{author.name}</h3>

                      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                        <span>
                          {(author.followers / 1000).toFixed(1)}k followers
                        </span>
                        <span>{author.articles} articles</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" type="button">
                      Follow
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="grid gap-4 sm:grid-cols-2">
              {categoryResults.length === 0 ? (
                <div className="col-span-2 rounded-2xl border-2 border-dashed border-border py-16 text-center">
                  <p className="font-medium text-foreground">No topics found</p>
                </div>
              ) : (
                categoryResults.map((cat) => (
                  <Link
                    key={cat.id}
                    href={ROUTES.category(cat.slug)}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                        {cat.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {cat.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {cat.count} articles
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <Search className="mx-auto mb-4 h-14 w-14 text-muted-foreground/30" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Search DevPulse
          </h2>
          <p className="mb-8 text-muted-foreground">
            Find articles, authors, and engineering topics
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => applySuggestedTerm(term)}
                className="rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-colors hover:bg-accent"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

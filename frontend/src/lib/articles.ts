import { ARTICLES, CATEGORIES } from '@/lib/data';
import type { Article } from '@/types';

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'oldest', label: 'Oldest' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export function getPublishedArticles(): Article[] {
  return ARTICLES.filter((a) => a.status === 'published');
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}

export function getArticleByIdOrFallback(id: string): Article {
  return getArticleById(id) ?? ARTICLES[0];
}

export function getArticleOrFallback(slug: string): Article {
  return getArticleBySlug(slug) ?? ARTICLES[0];
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return ARTICLES.filter(
    (a) => a.id !== article.id && a.category.id === article.category.id,
  ).slice(0, limit);
}

export function getArticlesByCategorySlug(slug: string): Article[] {
  return getPublishedArticles().filter((a) => a.category.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function filterArticles(
  articles: Article[],
  options: {
    search?: string;
    categorySlug?: string | null;
    sort?: SortOption;
  },
): Article[] {
  let result = [...articles];

  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (options.categorySlug) {
    result = result.filter((a) => a.category.slug === options.categorySlug);
  }

  switch (options.sort) {
    case 'popular':
      result.sort((a, b) => b.views - a.views);
      break;
    case 'trending':
      result = result.filter((a) => a.trending);
      break;
    case 'oldest':
      result.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
      break;
    default:
      result.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  return result;
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase();
  if (!q) return [];
  return getPublishedArticles().filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      a.category.name.toLowerCase().includes(q),
  );
}

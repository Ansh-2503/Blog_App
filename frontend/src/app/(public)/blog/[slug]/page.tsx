import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogDetailView } from '@/components/blog/blog-detail-view';
import { getArticleBySlug, getArticleOrFallback } from '@/lib/articles';
import { ARTICLES } from '@/lib/data';

type Props = { params: Promise<{ slug: string }> };

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').replace('localhost', '127.0.0.1');

// Server-side fetch helper
async function fetchArticleFromServer(slug: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/posts/slug/${slug}`, {
      next: { revalidate: 30 }, // Revalidate cache every 30 seconds
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          ...data.data,
          htmlContent: data.htmlContent,
        };
      }
    }
  } catch (error) {
    console.error(`Error fetching article [${slug}] from server:`, error);
  }
  return null;
}

export async function generateStaticParams() {
  // Prerender known paths for faster initial delivery
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

/**
 * Dynamic SEO & Metadata Generation
 * 
 * Next.js fetches the article details during Server-Side Rendering (SSR) 
 * to dynamically inject <meta> tags, title, and keywords.
 * If backend fetching fails, it falls back to mock data to ensure SEO stability.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Try to load from server first, fallback to mock data
  const article = await fetchArticleFromServer(slug) || 
                  getArticleBySlug(slug) || 
                  getArticleOrFallback(slug);
                  
  const parsedSeoKeywords = article.seoKeywords ? article.seoKeywords.split(',').map((k: string) => k.trim()) : [];
  const baseKeywords = parsedSeoKeywords.length > 0 
    ? parsedSeoKeywords 
    : (article.tags || []);
  
  const keywords = baseKeywords.length 
      ? [...baseKeywords, 'engineering blog', 'DevPulse', 'tech'] 
      : ['blog', 'engineering blog', 'software engineering', 'tech blog', 'deep technical writing', 'DevPulse'];

  return {
    title: `${article.title} | DevPulse`,
    description: article.excerpt,
    keywords,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch dynamic article from the backend
  let article = await fetchArticleFromServer(slug);
  
  // Fallback to mock data if backend doesn't have it
  if (!article) {
    article = getArticleBySlug(slug) || null;
  }
  
  if (!article) {
    // If not found in mock data either, throw 404
    notFound();
  }

  return <BlogDetailView article={article} />;
}

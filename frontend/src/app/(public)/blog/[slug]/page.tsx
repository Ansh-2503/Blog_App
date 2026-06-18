import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogDetailView } from '@/components/blog/blog-detail-view';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || 
  process.env.BACKEND_URL || 
  'http://localhost:5000/api'
).replace('localhost', '127.0.0.1');

// Server-side fetch helper
async function fetchArticleFromServer(slug: string) {
  console.log(`[Blog Detail SSR] Fetching article for slug "${slug}"`);
  console.log(`[Blog Detail SSR] Using BACKEND_URL: "${BACKEND_URL}"`);
  
  try {
    const targetUrl = `${BACKEND_URL}/posts/slug/${slug}`;
    const res = await fetch(targetUrl, {
      cache: 'no-store',
    });
    
    console.log(`[Blog Detail SSR] Backend responded with status: ${res.status}`);
    
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        console.log(`[Blog Detail SSR] Successfully retrieved article: "${data.data.title}"`);
        return {
          ...data.data,
          htmlContent: data.htmlContent,
        };
      } else {
        console.warn(`[Blog Detail SSR] Backend returned success=false:`, data.message || 'Unknown error');
      }
    } else {
      console.warn(`[Blog Detail SSR] Fetch failed with status ${res.status}`);
    }
  } catch (error: any) {
    console.error(`[Blog Detail SSR] Exception fetching article [${slug}] from server:`, error.message || error);
  }
  return null;
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${BACKEND_URL}/posts?status=published`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data.map((article: any) => ({ slug: article.slug }));
      }
    }
  } catch (error) {
    console.error('Error fetching static params:', error);
  }
  return [];
}

/**
 * Dynamic SEO & Metadata Generation
 * 
 * Next.js fetches the article details during Server-Side Rendering (SSR) 
 * to dynamically inject <meta> tags, title, and keywords.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Try to load from server first
  const article = await fetchArticleFromServer(slug);
  if (!article) {
    return {
      title: 'Article Not Found | DevPulse',
      description: 'The requested article could not be found.',
    };
  }
                  
  const parsedSeoKeywords = article.seoKeywords ? article.seoKeywords.split(',').map((k: string) => k.trim()) : [];
  const baseKeywords = parsedSeoKeywords.length > 0 
    ? parsedSeoKeywords 
    : (article.tags || []);
  
  const keywords = baseKeywords.length 
      ? [...baseKeywords, 'engineering blog', 'DevPulse', 'tech'] 
      : ['blog', 'engineering blog', 'software engineering', 'tech blog', 'deep technical writing', 'DevPulse'];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devpulse.io';
  const canonicalUrl = `${siteUrl}/blog/${slug}`;
  const title = `${article.title} | DevPulse`;
  const description = article.excerpt;
  const imageUrl = article.coverImage || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop&auto=format';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'DevPulse',
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch dynamic article from the backend
  let article = await fetchArticleFromServer(slug);
  
  if (!article) {
    // If not found in mock data either, throw 404
    notFound();
  }
  
  return <BlogDetailView article={article} />;
}

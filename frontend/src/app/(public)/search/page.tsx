import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SearchPageClient } from '@/components/search/search-page-client';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search articles, authors, and topics on DevPulse.',
};

import { CATEGORIES } from '@/lib/data';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').replace('localhost', '127.0.0.1');

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

function SearchFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="h-12 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default async function SearchResultsPage() {
  const liveCategories = await fetchCategories();
  const categories = liveCategories || CATEGORIES;

  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageClient categories={categories} />
    </Suspense>
  );
}

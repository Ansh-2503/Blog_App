import type { Metadata } from 'next';

import { BlogListing } from '@/components/blog/blog-listing';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Browse all engineering articles on DevPulse.',
  keywords: [
    'articles',
    'posts',
    'engineering blog',
    'software engineering articles',
    'tech posts',
    'coding tutorials',
    'developer guides'
  ],
};

export default function BlogListingPage() {
  return <BlogListing />;
}

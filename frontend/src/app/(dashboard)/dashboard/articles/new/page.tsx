import type { Metadata } from 'next';

import { ArticleEditor } from '@/components/dashboard/article-editor';

export const metadata: Metadata = {
  title: 'New Article',
};

export default function CreateArticlePage() {
  return <ArticleEditor />;
}

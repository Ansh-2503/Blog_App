import type { Metadata } from 'next';

import { ArticlePreview } from '@/components/dashboard/article-preview';
import { getArticleByIdOrFallback } from '@/lib/articles';
import { ARTICLES } from '@/lib/data';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({ id: article.id }));
}

export const metadata: Metadata = {
  title: 'Preview Article',
};

export default async function ArticlePreviewPage({ params }: Props) {
  const { id } = await params;
  const article = getArticleByIdOrFallback(id);
  return <ArticlePreview article={article} />;
}

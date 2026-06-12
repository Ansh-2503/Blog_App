import type { Metadata } from 'next';

import { ArticleEditor } from '@/components/dashboard/article-editor';
import { ARTICLES } from '@/lib/data';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({ id: article.id }));
}

export const metadata: Metadata = {
  title: 'Edit Article',
};

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  return <ArticleEditor editMode articleId={id} />;
}

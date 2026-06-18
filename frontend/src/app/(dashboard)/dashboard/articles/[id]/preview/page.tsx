'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';

import { ArticlePreview } from '@/components/dashboard/article-preview';
import { apiFetch } from '@/lib/api-client';

type Props = { params: Promise<{ id: string }> };

export default function ArticlePreviewPage({ params }: Props) {
  const { id } = React.use(params);

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['article-preview', id],
    queryFn: async () => {
      const data = await apiFetch(`/posts/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  if (error || !responseData?.success || !responseData?.data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-destructive">Failed to load article preview.</p>
      </div>
    );
  }

  const post = responseData.data;

  // Adapt backend payload to Article interface expected by ArticlePreview
  const article = {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    htmlContent: post.content,
    coverImage: post.coverImage,
    category: {
      name: post.category,
      slug: post.category,
    },
    author: {
      name: 'You',
      avatar: '',
    },
    tags: post.seoKeywords ? post.seoKeywords.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    readTime: Math.max(1, Math.round((post.content || '').split(/\s+/).filter(Boolean).length / 200)),
    publishedAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    status: post.status,
  };

  return <ArticlePreview article={article as any} />;
}

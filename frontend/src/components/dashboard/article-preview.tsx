'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Download, Edit, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoverImage } from '@/components/shared/cover-image';
import { ROUTES } from '@/lib/constants';
import type { Article } from '@/types';
import { getAvatarFallback } from '@/lib/utils';
import { ArticleBody } from '@/components/blog/article-body';

const sampleCode = `const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3).max(20),
  age: z.number().int().min(13).max(120),
});

type UserRegistration = z.infer<typeof UserRegistrationSchema>;`;

interface ArticlePreviewProps {
  article: Article;
}

export function ArticlePreview({ article }: ArticlePreviewProps) {
  return (
    <div className="min-h-full bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-background/10 bg-foreground px-6 py-3 text-background">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.editArticle(article.id)}
            className="flex items-center gap-1.5 text-sm text-background/70 transition-colors hover:text-background"
          >
            <ArrowLeft className="h-4 w-4" /> Back to editor
          </Link>
          <span className="text-background/30">·</span>
          <span className="rounded-full border border-background/20 px-2 py-0.5 text-xs text-background/50">
            Preview mode
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
            asChild
          >
            <Link href={ROUTES.editArticle(article.id)}>
              <Edit className="h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-background text-foreground hover:bg-background/90"
            type="button"
            onClick={() => toast.success('Article published!')}
          >
            <Send className="h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="relative mb-8 h-72 overflow-hidden rounded-2xl bg-muted">
          <CoverImage
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{article.category.name}</Badge>
          {article.tags.map((t) => (
            <Badge key={t} variant="outline" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>

        <h1
          className="mb-4 text-3xl font-medium leading-tight text-foreground"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {article.title}
        </h1>
        <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>

        <div className="mb-8 flex items-center justify-between border-y border-border py-4">
          <div className="flex items-center gap-3">
            <CoverImage
              src={getAvatarFallback(article.author.avatar)}
              alt={article.author.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {article.author.name}
              </p>

            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime} min read
            </span>
            <button
              type="button"
              onClick={() => toast.success('PDF downloaded!')}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
          </div>
        </div>

        <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground">
          <ArticleBody content={(article as any).content || (article as any).htmlContent} />
        </div>
      </div>
    </div>
  );
}

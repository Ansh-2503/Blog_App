'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Eye,
  Image as ImageIcon,
  Save,
  Send,
  Upload,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/elements/rich-text-editor';
import { CoverImage } from '@/components/shared/cover-image';
import { CATEGORIES } from '@/lib/data';
import { ROUTES } from '@/lib/constants';
import { apiFetch } from '@/lib/api-client';

interface ArticleEditorProps {
  editMode?: boolean;
  articleId?: string;
}

export function ArticleEditor({ editMode = false, articleId }: ArticleEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    coverImage: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });
  
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [uploading, setUploading] = useState(false);

  // 1. Fetch post details if in Edit Mode
  const { data: responseData, isLoading: isFetching } = useQuery({
    queryKey: ['article-edit', articleId],
    queryFn: async () => {
      const data = await apiFetch(`/posts/${articleId}`);
      return data;
    },
    enabled: editMode && !!articleId,
  });

  // Load editor state from database on edit mode load
  useEffect(() => {
    if (editMode && responseData?.success && responseData?.data) {
      const post = responseData.data;
      setForm({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || '',
        tags: post.tags || [],
        status: post.status || 'draft',
        coverImage: post.coverImage || '',
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || '',
        seoKeywords: post.seoKeywords || '',
      });
    }
  }, [editMode, responseData]);

  // 2. Persistent Form Cache (Restore unsaved draft content on mount)
  useEffect(() => {
    if (!editMode) {
      const cached = localStorage.getItem('unsaved-editor-draft');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setForm((prev) => ({ ...prev, ...parsed }));
          toast.info('Restored unsaved draft content from cache');
        } catch (e) {
          console.error('Failed to parse cached editor draft', e);
        }
      }
    }
  }, [editMode]);

  // Persist form changes in background (Autosave locally)
  useEffect(() => {
    if (!editMode && (form.title || form.content || form.excerpt)) {
      const handler = setTimeout(() => {
        const cacheData = {
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          category: form.category,
          tags: form.tags,
          status: form.status,
          coverImage: form.coverImage,
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
          seoKeywords: form.seoKeywords,
        };
        localStorage.setItem('unsaved-editor-draft', JSON.stringify(cacheData));
      }, 1000);
      
      return () => clearTimeout(handler);
    }
  }, [form, editMode]);

  const handleChange = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 5) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  // 3. Image Upload to Multer/Cloudinary backend
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await apiFetch('/posts/upload-cover', {
        method: 'POST',
        body: formData,
      });

      if (data.success && data.url) {
        handleChange('coverImage', data.url);
        toast.success('Cover image uploaded successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // 4. Mutations for Creation / Update
  const saveMutation = useMutation({
    mutationFn: async (targetStatus?: 'draft' | 'published') => {
      const payload = {
        ...form,
        htmlContent: form.content,
        seoKeywords: form.seoKeywords || form.tags.join(', '),
        status: targetStatus || form.status,
      };

      if (editMode && articleId) {
        return apiFetch(`/posts/${articleId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        return apiFetch('/posts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: (data) => {
      // Clear persistent local storage cache on success
      localStorage.removeItem('unsaved-editor-draft');
      toast.success(
        form.status === 'published'
          ? 'Article published successfully!'
          : 'Draft saved successfully!'
      );
      router.push(ROUTES.articles);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save article');
    },
  });

  const handleSave = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) {
      toast.error('Please add an article title');
      return;
    }
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    if (!form.excerpt.trim()) {
      toast.error('Please write a brief summary');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Please write some content for the article');
      return;
    }

    // Temporarily update status state locally before trigger, or trigger mutation directly
    setForm(prev => ({ ...prev, status }));
    saveMutation.mutate(status);
  };

  const wordCount = form.content ? form.content.split(/\s+/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));

  const previewHref =
    editMode && articleId
      ? ROUTES.previewArticle(articleId)
      : ROUTES.previewArticle('new');

  if (editMode && isFetching) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading article workstation...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />

      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.articles}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Articles
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-medium text-foreground">
            {editMode ? 'Edit Article' : 'New Article'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => {
              if (!editMode && !form.title) {
                toast.info('Add a title and save draft to preview');
                return;
              }
              router.push(previewHref);
            }}
          >
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4" /> {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={() => handleSave('published')}
            disabled={saveMutation.isPending}
          >
            <Send className="h-4 w-4" /> {saveMutation.isPending ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-8">
            {/* Cover Image Upload Area */}
            <div className="mb-6">
              {form.coverImage ? (
                <div className="group relative overflow-hidden rounded-xl h-48 border border-border">
                  <CoverImage
                    src={form.coverImage}
                    alt="Cover image"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={handleImageUploadClick} disabled={uploading}>
                        Change Image
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleChange('coverImage', '')}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleImageUploadClick}
                  className="flex h-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border transition-all hover:border-primary/40 hover:bg-accent/20"
                >
                  <div className="text-center">
                    {uploading ? (
                      <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {uploading ? 'Uploading image to Cloudinary...' : 'Add a cover image'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <textarea
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Article title..."
              rows={2}
              className="mb-4 w-full resize-none border-none bg-transparent text-3xl font-semibold leading-tight text-foreground outline-none placeholder:text-muted-foreground/40"
              style={{ fontFamily: 'var(--font-serif)' }}
              aria-label="Article title"
            />

            <textarea
              value={form.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="Write a brief description of your article..."
              rows={2}
              className="mb-6 w-full resize-none border-none bg-transparent text-base leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/40"
              aria-label="Article excerpt"
            />

            <div className="mb-6 border-t border-border" />

            {/* Content HTML Editor */}
            <RichTextEditor
              value={form.content}
              onChange={(val) => handleChange('content', val)}
              className="mb-6"
            />
          </div>
        </div>

        <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-10 w-full rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="content"
                className="h-10 flex-1 rounded-none border-b-2 border-transparent text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="h-10 flex-1 rounded-none border-b-2 border-transparent text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 space-y-5 p-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-input-background px-3 text-sm outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-input-background px-3 text-sm outline-none"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tags{' '}
                  <span className="font-normal normal-case text-muted-foreground/50">
                    ({form.tags.length}/5)
                  </span>
                </label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="h-8 flex-1 rounded-lg border border-border bg-input-background px-2.5 text-xs outline-none focus:ring-1 focus:ring-ring/50"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-lg border border-border p-2 transition-colors hover:bg-accent"
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Estimated reading time:{' '}
                  <strong className="text-foreground">{readMinutes} min</strong>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Word count:{' '}
                  <strong className="text-foreground">{wordCount}</strong>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-0 space-y-4 p-4">
              <div className="rounded-lg border border-primary/20 bg-primary/8 p-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Optimize your article for search engines. Good SEO helps more
                  engineers discover your content.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SEO Title
                </label>
                <input
                  value={form.seoTitle}
                  onChange={(e) => handleChange('seoTitle', e.target.value)}
                  placeholder="Override the article title for search..."
                  className="h-9 w-full rounded-lg border border-border bg-input-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SEO Keywords
                </label>
                <input
                  value={form.seoKeywords}
                  onChange={(e) => handleChange('seoKeywords', e.target.value)}
                  placeholder="Comma-separated keywords (e.g. react, nextjs, seo)..."
                  className="h-9 w-full rounded-lg border border-border bg-input-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Meta Description
                </label>
                <textarea
                  value={form.seoDescription}
                  onChange={(e) => handleChange('seoDescription', e.target.value)}
                  placeholder="Describe your article for search results..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring/50"
                />
              </div>

              <div className="rounded-lg bg-muted/40 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Search Preview
                </p>
                <p className="line-clamp-1 text-sm font-medium text-primary">
                  {form.seoTitle || form.title || 'Article title'}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  devpulse.io/blog/your-article-slug
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {form.seoDescription ||
                    form.excerpt ||
                    'Article description will appear here...'}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

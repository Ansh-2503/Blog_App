'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  Heart,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CoverImage } from '@/components/shared/cover-image';
import { Skeleton } from '@/components/ui/skeleton';
import { ARTICLE_STATUS_STYLES } from '@/lib/article-status';
import { ROUTES } from '@/lib/constants';
import { formatShortDate, formatViews } from '@/lib/format';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/context/auth-store';

const STATUS_FILTERS = ['all', 'published', 'draft'] as const;
const ITEMS_PER_PAGE = 10;

// Memoized row component to prevent re-rendering all rows when selection changes
const MemoizedArticleRow = React.memo(({ 
  article, 
  isSelected, 
  toggleSelect, 
  toggleStatusMutation, 
  setDeleteId 
}: { 
  article: any; 
  isSelected: boolean; 
  toggleSelect: (id: string) => void;
  toggleStatusMutation: any;
  setDeleteId: (id: string) => void;
}) => {
  return (
    <tr
      className={`transition-colors hover:bg-accent/20 ${isSelected ? 'bg-primary/5' : ''}`}
    >
      <td className="px-4 py-3.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelect(article.id)}
          className="rounded"
          aria-label={`Select ${article.title}`}
        />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            <CoverImage
              src={article.coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="min-w-0">
            <p className="max-w-[280px] truncate text-sm font-medium text-foreground">
              {article.title}
            </p>
            <div className="mt-0.5 flex flex-wrap gap-1.5">
              {article.tags.slice(0, 2).map((t: string) => (
                <span
                  key={t}
                  className="text-xs text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 md:table-cell">
        <Badge variant="secondary" className="text-xs">
          {article.category?.name || 'Uncategorized'}
        </Badge>
      </td>
      <td className="hidden px-4 py-3.5 lg:table-cell">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {formatViews(article.views)}
          </span>
          <span className="flex items-center gap-0.5">
            <Heart className="h-3 w-3" />
            {article.likes}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {article.readTime}m
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Switch
            checked={article.status === 'published'}
            disabled={toggleStatusMutation.isPending}
            onCheckedChange={(checked) => {
              toggleStatusMutation.mutate({
                id: article.id,
                status: checked ? 'published' : 'draft',
              });
            }}
            aria-label="Toggle publish status"
          />
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${ARTICLE_STATUS_STYLES[article.status as keyof typeof ARTICLE_STATUS_STYLES]}`}
          >
            {article.status}
          </span>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 sm:table-cell">
        <span className="text-xs text-muted-foreground">
          {formatShortDate(article.publishedAt)}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link
                href={ROUTES.editArticle(article.id)}
                className="flex items-center gap-2"
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={ROUTES.previewArticle(article.id)}
                className="flex items-center gap-2"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={ROUTES.blogDetail(article.slug)}
                target="_blank"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View live
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={() => toast.success('Article duplicated')}
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => setDeleteId(article.id)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
});
MemoizedArticleRow.displayName = 'MemoizedArticleRow';

export function ArticlesManagement() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  // Search state with debouncing
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  
  // Modal Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Debounce search input to prevent re-filtering continuously
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // reset to first page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch articles
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['creator-articles', user?.id],
    queryFn: async () => {
      const data = await apiFetch(`/posts?author=${user?.id}`);
      return data;
    },
    enabled: !!user?.id,
  });

  const articles = responseData?.data || [];

  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'published' }) => {
      return apiFetch(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-articles', user?.id] });
      toast.success('Article status updated');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update article status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/posts/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-articles', user?.id] });
      toast.success('Article deleted successfully');
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete article');
    },
  });

  // Filtered Articles
  const filtered = useMemo(() => {
    let result = articles;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a: any) =>
          a.title.toLowerCase().includes(q) ||
          a.category?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((a: any) => a.status === statusFilter);
    }
    return result;
  }, [articles, search, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginatedArticles.length && paginatedArticles.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedArticles.map((a: any) => a.id)));
    }
  };

  return (
    <div className="max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">My Articles</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${articles.length} articles total`}
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.newArticle} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> New Article
          </Link>
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles..."
            className="h-9 w-full rounded-lg border border-border bg-input-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            aria-label="Search articles"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`h-9 rounded-lg px-3 text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/8 px-4 py-2.5 animate-in slide-in-from-top-2">
          <span className="text-sm font-medium text-primary">
            {selected.size} selected
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => toast.success('Articles duplicated')}
            >
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              type="button"
              onClick={() => {
                setSelected(new Set());
                toast.success('Articles deleted');
              }}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setSelected(new Set())}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selected.size === paginatedArticles.length && paginatedArticles.length > 0
                    }
                    onChange={toggleAll}
                    className="rounded"
                    aria-label="Select all articles"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Article
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                  Category
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:table-cell">
                  Stats
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                  Date
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-4" /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-3 w-16" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-8 w-8 rounded-full" /></td>
                  </tr>
                ))
              ) : paginatedArticles.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-14 text-center text-sm text-muted-foreground"
                  >
                    No articles found
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article: any) => (
                  <MemoizedArticleRow 
                    key={article.id} 
                    article={article} 
                    isSelected={selected.has(article.id)} 
                    toggleSelect={toggleSelect}
                    toggleStatusMutation={toggleStatusMutation}
                    setDeleteId={setDeleteId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} articles
            </p>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                type="button"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                type="button"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

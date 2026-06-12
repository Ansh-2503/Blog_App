'use client';

import { useState } from 'react';
import { List } from 'lucide-react';

export const ARTICLE_TOC = [
  { id: 'introduction', label: 'Introduction', level: 1 },
  { id: 'why-runtime-validation', label: 'Why Runtime Validation Matters', level: 1 },
  { id: 'defining-schemas', label: 'Defining Schemas with Zod', level: 1 },
  { id: 'type-safe-api', label: 'Building a Type-Safe API Layer', level: 1 },
  { id: 'advanced-patterns', label: 'Advanced Patterns', level: 1 },
  { id: 'partial-recursive', label: 'Partial and Recursive Schemas', level: 2 },
  { id: 'conclusion', label: 'Conclusion', level: 1 },
] as const;

export function ArticleToc() {
  const [tocOpen, setTocOpen] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between"
        onClick={() => setTocOpen((o) => !o)}
        aria-expanded={tocOpen}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <List className="h-4 w-4" /> Table of Contents
        </div>
      </button>
      {tocOpen && (
        <nav className="space-y-1" aria-label="Table of contents">
          {ARTICLE_TOC.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block py-1 text-xs leading-snug text-muted-foreground transition-colors hover:text-primary ${item.level === 2 ? 'pl-4' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

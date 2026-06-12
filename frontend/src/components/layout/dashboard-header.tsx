'use client';

import Link from 'next/link';
import { Bell, Moon, Search, Sun } from 'lucide-react';

import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/lib/constants';

export function DashboardHeader() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search articles..."
          className="h-8 w-56 rounded-md bg-input-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/50"
          aria-label="Search articles"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          href={ROUTES.home}
          className="ml-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← View site
        </Link>
      </div>
    </header>
  );
}

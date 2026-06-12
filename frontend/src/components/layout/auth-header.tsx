'use client';

import Link from 'next/link';
import { Moon, Rss, Sun } from 'lucide-react';

import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/lib/constants';

export function AuthHeader() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-8 py-5">
      <Link href={ROUTES.home} className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Rss className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          DevPulse
        </span>
      </Link>
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </header>
  );
}

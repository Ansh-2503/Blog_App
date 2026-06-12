'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/context/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  Menu,
  Moon,
  PenLine,
  Rss,
  Search,
  Sun,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES } from '@/lib/data';
import { ROUTES } from '@/lib/constants';
import { cn, getAvatarFallback } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
        const res = await fetch(`${BACKEND_URL}/posts/categories`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCategories(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching categories for navbar:', error);
      }
    };
    fetchCategories();
  }, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `${ROUTES.search}?q=${encodeURIComponent(searchQuery.trim())}`,
      );
      setSearchOpen(false);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_-3px_rgba(0,0,0,0.35)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={ROUTES.home} className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
              <Rss className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              DevPulse
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1.5 md:flex"
            aria-label="Main navigation"
          >
            <Link
              href={ROUTES.home}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-[1px]',
                isActive(ROUTES.home) && pathname === ROUTES.home
                  ? 'bg-primary/8 text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              Home
            </Link>
            <Link
              href={ROUTES.blog}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-[1px]',
                isActive(ROUTES.blog)
                  ? 'bg-primary/8 text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              Articles
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setCatOpen((o) => !o)}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-[1px]',
                  isActive('/category')
                    ? 'bg-primary/8 text-primary font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                aria-expanded={catOpen}
                aria-haspopup="true"
              >
                Topics
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform duration-200',
                    catOpen && 'rotate-180',
                  )}
                />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full z-50 mt-2.5 w-64 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={ROUTES.category(cat.slug)}
                      onClick={() => setCatOpen(false)}
                      className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150 hover:bg-accent/80 hover:pl-3.5"
                    >
                      <span className="text-foreground transition-colors group-hover:text-primary">{cat.name}</span>
                      <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-xs text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        {cat.count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
             {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="hidden items-center md:flex animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="relative flex items-center rounded-full border border-border bg-input-background pl-3 pr-1 py-0.5 focus-within:ring-2 focus-within:ring-primary/45 transition-all w-60">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="h-8 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
                    aria-label="Search articles"
                  />
                  <button
                    type="submit"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/95 transition-colors"
                    aria-label="Submit search"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-accent transition-colors"
                    aria-label="Close search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground hover:-translate-y-[1px] md:flex"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="hidden items-center gap-2.5 md:flex">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="relative h-7 w-7 overflow-hidden rounded-full border border-border/80 shadow-xs hover:scale-[1.05] hover:border-primary focus:outline-none transition-all duration-200 cursor-pointer"
                    >
                      <Image
                        src={getAvatarFallback(user.avatar)}
                        alt={user.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized={user.avatar?.includes('googleusercontent.com')}
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col px-2.5 py-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                    <DropdownMenuSeparator className="-mx-2 my-1.5" />
                    {user.role === 'CREATOR' && (
                      <DropdownMenuItem asChild className="rounded-lg py-2 transition-all duration-150 hover:bg-accent/80">
                        <Link href={ROUTES.dashboard} className="w-full cursor-pointer">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="rounded-lg py-2 transition-all duration-150 hover:bg-accent/80">
                      <Link href={ROUTES.account} className="w-full cursor-pointer">
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="-mx-2 my-1.5" />
                    <DropdownMenuItem
                      onClick={logout}
                      variant="destructive"
                      className="w-full cursor-pointer rounded-lg py-2 transition-all duration-150"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                </>
              )}
            </div>

            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-4">
            <form onSubmit={handleSearch} className="mb-3 flex">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="h-9 flex-1 rounded-l-md border border-border bg-input-background px-3 text-sm outline-none"
                aria-label="Search articles"
              />
              <button
                type="submit"
                className="h-9 rounded-r-md bg-primary px-3 text-primary-foreground"
                aria-label="Submit search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
            {[
              { href: ROUTES.home, label: 'Home' },
              { href: ROUTES.blog, label: 'Articles' },
              ...(user && user.role === 'CREATOR' ? [{ href: ROUTES.dashboard, label: 'Dashboard' }] : []),
              ...(user ? [{ href: ROUTES.account, label: 'Account Settings' }] : []),
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <div className="flex flex-col gap-2 pt-3">
                <Button variant="destructive" size="sm" className="w-full" onClick={() => { logout(); setMobileOpen(false); }}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={ROUTES.login} onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link
                    href={ROUTES.register}
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {catOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setCatOpen(false)}
          aria-label="Close topics menu"
          tabIndex={-1}
        />
      )}
    </header>
  );
}

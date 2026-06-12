'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, LogOut, Plus, Rss } from 'lucide-react';

import { useAuthStore } from '@/context/auth-store';
import { DASHBOARD_NAV } from '@/lib/nav-config';
import { ROUTES } from '@/lib/constants';
import { cn, getAvatarFallback } from '@/lib/utils';

export function DashboardSidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link href={ROUTES.home} className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary">
            <Rss className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">DevPulse</span>
        </Link>
      </div>

      <nav
        className="flex-1 space-y-6 overflow-y-auto px-3 py-4"
        aria-label="Dashboard navigation"
      >
        {DASHBOARD_NAV.filter(({ section }) => {
          if (user?.role === 'VISITOR') {
            return section === 'Settings';
          }
          return true;
        }).map(({ section, items }) => (
          <div key={section}>
            <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              {section}
            </p>
            {items.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive(href, exact)
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {isActive(href, exact) && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {user?.role !== 'VISITOR' && (
        <div className="space-y-1 border-t border-sidebar-border px-3 py-3">
          <Link
            href={ROUTES.newArticle}
            className="flex w-full items-center gap-2.5 rounded-lg bg-sidebar-primary px-3 py-2 text-sm font-medium text-sidebar-primary-foreground transition-colors hover:bg-sidebar-primary/90"
          >
            <Plus className="h-4 w-4" />
            Write Article
          </Link>
        </div>
      )}

      <div className="border-t border-sidebar-border px-3 py-3">
        <div
          onClick={logout}
          className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent"
          title="Click to log out"
        >
          <Image
            src={getAvatarFallback(user?.avatar)}
            alt={user?.name || "User Avatar"}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
            unoptimized={user?.avatar?.includes('googleusercontent.com')}
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name || 'Loading...'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.role === 'CREATOR' ? 'Creator Account' : 'Visitor'}
            </p>
          </div>
          <LogOut
            className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </div>
      </div>
    </aside>
  );
}

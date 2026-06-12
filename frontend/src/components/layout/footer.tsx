import Link from 'next/link';
import { Github, Linkedin, Rss, Twitter } from 'lucide-react';

import { CATEGORIES } from '@/lib/data';
import { ROUTES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-20 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-background/10 pb-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Rss className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">DevPulse</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-background/60">
              Engineering insights from practitioners building the systems of
              tomorrow.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Github, label: 'GitHub' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Linkedin, label: 'LinkedIn' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="rounded-lg bg-background/8 p-2 text-background/60 transition-colors hover:bg-background/15 hover:text-background"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">
              Topics
            </h4>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={ROUTES.category(cat.slug)}
                    className="text-sm text-background/55 transition-colors hover:text-background"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: ROUTES.blog, label: 'All Articles' },
                { href: ROUTES.search, label: 'Search' },
                { href: ROUTES.register, label: 'Start Writing' },
                { href: ROUTES.dashboard, label: 'Creator Dashboard' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-background/55 transition-colors hover:text-background"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">
              Newsletter
            </h4>
            <p className="mb-4 text-sm leading-relaxed text-background/55">
              Get weekly engineering insights delivered to your inbox.
            </p>
            <div className="flex flex-col gap-2" role="group" aria-label="Newsletter signup">
              <input
                type="email"
                placeholder="your@email.com"
                className="rounded-lg border border-background/15 bg-background/10 px-3 py-2 text-sm text-background outline-none placeholder:text-background/35 focus:ring-1 focus:ring-primary"
                aria-label="Email for newsletter"
              />
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
          <p className="text-xs text-background/40">
            © {new Date().getFullYear()} DevPulse. Built for engineers, by
            engineers.
          </p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Cookie Policy'].map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs text-background/40 transition-colors hover:text-background/70"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

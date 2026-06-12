'use client';

import { useState } from 'react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="bg-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2
            className="mb-3 text-3xl text-background"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            Stay at the forefront of engineering
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-background/60">
            Join 48,000+ engineers who get weekly deep-dives on systems design,
            TypeScript, Rust, and modern software engineering.
          </p>
          {subscribed ? (
            <div className="rounded-xl border border-primary/30 bg-primary/20 px-6 py-4 text-sm font-medium text-primary">
              ✓ You&apos;re subscribed! Check your inbox for a confirmation.
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-xl border border-background/20 bg-background/10 px-4 py-2.5 text-sm text-background outline-none placeholder:text-background/40 focus:ring-2 focus:ring-primary"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe Free
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-background/35">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}

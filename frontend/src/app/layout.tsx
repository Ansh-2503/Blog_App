import type { Metadata } from 'next';

import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DevPulse — Engineering Blog',
    template: '%s · DevPulse',
  },
  description:
    'A multi-user engineering blog for deep technical writing on software, systems, and AI.',
  keywords: [
    'blog',
    'engineering blog',
    'software engineering',
    'tech blog',
    'deep technical writing',
    'software',
    'systems',
    'AI',
    'web development',
    'coding',
    'programming',
    'developer',
    'technology',
    'backend',
    'frontend',
    'architecture',
    'system design',
    'artificial intelligence'
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

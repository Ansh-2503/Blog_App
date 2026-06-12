import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Access denied',
};

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-semibold text-destructive">403</p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Access denied</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You do not have permission to view this resource.
      </p>
      <Button className="mt-8" asChild>
        <Link href={ROUTES.home}>Go home</Link>
      </Button>
    </div>
  );
}

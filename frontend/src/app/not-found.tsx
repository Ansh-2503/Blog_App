import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-6xl font-semibold text-primary">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href={ROUTES.home}>Back to home</Link>
      </Button>
    </div>
  );
}

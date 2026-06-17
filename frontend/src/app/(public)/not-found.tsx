import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function PublicNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-4 text-center py-16">
      <p className="text-6xl font-semibold text-primary">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Article or Page Not Found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The article you are trying to view does not exist, is not published yet, or has been moved.
      </p>
      <Button asChild>
        <Link href={ROUTES.home}>Back to Feed</Link>
      </Button>
    </div>
  );
}

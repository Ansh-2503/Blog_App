'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/auth-store';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('VISITOR' | 'CREATOR')[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/');
      } else if (!allowedRoles.includes(user.role)) {
        router.replace('/403');
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Authorizing session...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
export default RoleGuard;

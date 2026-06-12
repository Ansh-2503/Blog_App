import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your DevPulse account.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

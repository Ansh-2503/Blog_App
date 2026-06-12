import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Choose a new password for your DevPulse account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

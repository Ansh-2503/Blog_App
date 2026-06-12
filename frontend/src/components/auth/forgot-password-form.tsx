'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { authInputClassName, authLabelClassName } from '@/components/auth/auth-field-styles';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Check your email
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          We&apos;ve sent a password reset link to{' '}
          <strong className="text-foreground">{email}</strong>. The link expires
          in 15 minutes.
        </p>
        <p className="mb-6 text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder, or{' '}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setSent(false)}
          >
            try again
          </button>
          .
        </p>
        <Button variant="outline" className="w-full" asChild>
          <Link href={ROUTES.login}>
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h1 className="mb-1.5 text-2xl font-semibold text-foreground">
          Forgot password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className={authLabelClassName}>
            Email address
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={authInputClassName}
          />
        </div>
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

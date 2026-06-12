'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { authInputClassName, authLabelClassName } from '@/components/auth/auth-field-styles';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passwordsMismatch = !!confirm && confirm !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Password reset token is missing or expired');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Password updated!
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Your password has been reset successfully.
        </p>
        <Button className="w-full" onClick={() => router.push(ROUTES.login)}>
          Sign in with new password
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-1.5 text-2xl font-semibold text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password" className={authLabelClassName}>
            New password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={`${authInputClassName} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="reset-confirm" className={authLabelClassName}>
            Confirm new password
          </label>
          <input
            id="reset-confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className={`${authInputClassName} ${
              passwordsMismatch
                ? 'border-destructive ring-2 ring-destructive/20'
                : ''
            }`}
            aria-invalid={passwordsMismatch}
          />
          {passwordsMismatch && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              Passwords do not match
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={loading || passwordsMismatch}
        >
          {loading ? 'Updating...' : 'Update password'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href={ROUTES.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

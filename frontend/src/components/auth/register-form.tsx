'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { AuthDivider } from '@/components/auth/auth-divider';
import { authInputClassName, authLabelClassName } from '@/components/auth/auth-field-styles';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { Button } from '@/components/ui/button';
import { PASSWORD_REQUIREMENTS } from '@/lib/auth';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/context/auth-store';
import { ROUTES } from '@/lib/constants';

export function RegisterForm() {
  const router = useRouter();
  
  // Registration Form States
  const [step, setStep] = useState<1 | 2>(1); // 1: Sign up inputs, 2: OTP Verification
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VISITOR' as 'VISITOR' | 'CREATOR',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  // OTP Verification States
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Submit Step 1: Initiate Sign-up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Please accept the terms of service');
      return;
    }
    
    setLoading(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      
      if (data.otp) {
        toast.warning('⚠ Demo Mode (Live Server): OTP is shown instead of email', { duration: 6000 });
        setOtp(data.otp);
      } else {
        toast.success('Verification code sent to your email!');
      }
      
      setStep(2); // Advance to OTP entry step
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Submit Step 2: Verify OTP and log in
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          otp,
        }),
      });

      // Login user state
      useAuthStore.getState().login(data.token, data.user);
      
      toast.success('Email verified! Welcome to DevPulse.');
      
      // Redirect based on role chosen using hard navigation
      if (data.user.role === 'CREATOR') {
        window.location.href = ROUTES.articles;
      } else {
        window.location.href = ROUTES.home;
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const [cooldown, setCooldown] = useState(0);

  // Timer for resend cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      
      if (data.otp) {
        toast.warning('⚠ Demo Mode (Live Server): OTP is shown instead of email', { duration: 6000 });
        setOtp(data.otp);
      } else {
        toast.success('A new verification code has been sent!');
      }
      
      setCooldown(60); // Start 60s cooldown on success
    } catch (err: any) {
      // If the backend returns a 429 error, it will say "Please wait X seconds..."
      // We can try to parse the seconds from the message or just set a default
      toast.error(err.message || 'Failed to resend code');
      const match = err.message?.match(/wait (\d+) seconds/);
      if (match && match[1]) {
        setCooldown(parseInt(match[1], 10));
      }
    } finally {
      setResending(false);
    }
  };

  // Render Step 2: OTP Verification UI
  if (step === 2) {
    return (
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign up
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h1 className="mb-1.5 text-2xl font-semibold text-foreground">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to <br />
            <strong className="text-foreground">{form.email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp-input" className={authLabelClassName}>
              Verification Code
            </label>
            <input
              id="otp-input"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className={`${authInputClassName} text-center text-lg font-semibold tracking-[0.5em]`}
            />
          </div>

          <Button type="submit" className="h-10 w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || cooldown > 0}
            className="inline-flex items-center gap-1.5 text-xs text-primary underline-offset-4 hover:underline disabled:opacity-50"
          >
            {resending ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : null}
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend verification code'}
          </button>
        </div>
      </div>
    );
  }

  // Render Step 1: Signup Details Form UI
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-1.5 text-2xl font-semibold text-foreground">
          Join DevPulse
        </h1>
        <p className="text-sm text-muted-foreground">
          Create your account and start sharing knowledge
        </p>
      </div>

      <SocialAuthButtons isRegister={true} />
      <AuthDivider label="or with email" />

      <form onSubmit={handleSignUpSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className={authLabelClassName}>
            Full name
          </label>
          <input
            id="register-name"
            name="name"
            required
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Smith"
            className={authInputClassName}
          />
        </div>

        <div>
          <label htmlFor="register-email" className={authLabelClassName}>
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={authInputClassName}
          />
        </div>

        <div>
          <label htmlFor="register-role" className={authLabelClassName}>
            I want to join as a
          </label>
          <select
            id="register-role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className={`${authInputClassName} bg-card`}
          >
            <option value="VISITOR">Visitor (Read-only access)</option>
            <option value="CREATOR">Creator (Write & Publish articles)</option>
          </select>
        </div>

        <div>
          <label htmlFor="register-password" className={authLabelClassName}>
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Choose a strong password"
              className={`${authInputClassName} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 space-y-1" role="list" aria-label="Password requirements">
              {PASSWORD_REQUIREMENTS.map((r) => (
                <div
                  key={r.label}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    r.check(form.password)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Check
                    className={`h-3 w-3 ${r.check(form.password) ? 'opacity-100' : 'opacity-30'}`}
                  />
                  {r.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded"
            aria-label="Accept terms of service and privacy policy"
          />
          <span className="text-xs leading-relaxed text-muted-foreground">
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={ROUTES.login}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

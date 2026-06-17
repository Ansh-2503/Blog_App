'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const isNewUser = searchParams.get('isNewUser');

  useEffect(() => {
    if (token) {
      // 1. Set token in localStorage so apiFetch and auth-store can use it
      localStorage.setItem('token', token);
      
      // 2. Set token in cookies so Next.js middleware allows protected routes
      const expires = new Date();
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      document.cookie = `token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      
      // 3. Hard redirect to ensure middleware sees the new cookie
      // auth-store's initialize() will run on the new page and fetch the user profile
      if (isNewUser === 'true') {
        window.location.href = '/complete-profile';
      } else {
        window.location.href = '/feed';
      }
    } else {
      window.location.href = '/?error=NoTokenProvided';
    }
  }, [token, isNewUser]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-foreground">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}

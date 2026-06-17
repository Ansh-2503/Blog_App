'use client';

import { useEffect, useState } from 'react';
import { Chrome } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/context/auth-store';

declare global {
  interface Window {
    google: any;
  }
}

interface SocialAuthButtonsProps {
  isRegister?: boolean;
}

export function SocialAuthButtons({ isRegister }: SocialAuthButtonsProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'VISITOR' });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error === 'GoogleAuthFailed') {
        toast.error(`Google Authentication Failed: ${error}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (error) {
        toast.error(`Authentication Error: ${error}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (token) {
        // Clear token from URL to avoid leaking it
        window.history.replaceState({}, document.title, window.location.pathname);
        
        const promise = (async () => {
          // Temporarily set token in localStorage so fetch uses it
          localStorage.setItem('token', token);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          
          if (!data.success) {
            throw new Error('Could not fetch user profile');
          }
          
          useAuthStore.getState().login(token, data.user);
          
          setTimeout(() => {
            if (data.user.role === 'CREATOR') {
              window.location.href = '/dashboard/articles';
            } else {
              window.location.href = '/feed';
            }
          }, 500);
        })();

        toast.promise(promise, {
          loading: 'Completing Sign In...',
          success: 'Signed in successfully!',
          error: (err) => err.message || 'Verification failed',
        });
      }
    }
  }, []);

  const handleGoogleSignInClick = () => {
    executeGoogleSignIn();
  };

  const executeGoogleSignIn = (stateData?: any) => {
    // We expect NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set in frontend .env
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Client ID is not configured');
      return;
    }
    const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'}/auth/google/callback`;
    
    let stateParam = 'google';
    if (stateData) {
      stateParam = btoa(JSON.stringify(stateData));
    }
    
    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&state=${stateParam}`;
    window.location.href = googleUrl;
  };

  return (
    <div className="mb-6">
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full gap-2"
        onClick={handleGoogleSignInClick}
      >
        <Chrome className="h-4 w-4" /> Google
      </Button>
    </div>
  );
}

import { create } from 'zustand';
import { apiFetch } from '@/lib/api-client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'VISITOR' | 'CREATOR';
  isVerified: boolean;
  avatar?: string | null;
  username?: string;
  bio?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: UserProfile) => void;
}

// Cookie Helper functions
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string) => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: true,

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCookie('token', token, 7);
    setCookie('role', user.role, 7);
    set({ token, user, loading: false });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setCookie('role', user.role, 7);
    set({ user });
  },

  logout: async () => {
    try {
      if (typeof window !== 'undefined') {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('token');
    removeCookie('role');
    set({ token: null, user: null, loading: false });
    window.location.href = '/';
  },

  initialize: async () => {
    if (typeof window === 'undefined') return;
    
    const storedToken = localStorage.getItem('token') || getCookie('token');

    if (storedToken) {
      try {
        // Verify token validity by calling /me endpoint through apiFetch (auto-refreshes if needed)
        const data = await apiFetch('/auth/me');

        if (data && data.success) {
          const newToken = localStorage.getItem('token') || storedToken;
          set({ token: newToken, user: data.user, loading: false });
          // Sync cookie and localStorage
          setCookie('role', data.user.role, 7);
          setCookie('token', newToken, 7);
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          return;
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      }
    }

    // Clear stale state if verify fails or no token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('token');
    removeCookie('role');
    set({ token: null, user: null, loading: false });
  },
}));

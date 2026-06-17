/**
 * DevPulse API Client Wrapper
 * 
 * Centralized data fetching utility that implements:
 * 1. Automatic JWT Bearer token injection from localStorage.
 * 2. Token refresh interceptor: Automatically handles 401 Unauthorized errors by 
 *    calling /auth/refresh-token and retrying the original request.
 * 3. Base URL resolution and standardized JSON parsing.
 */
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

let refreshTokenPromise: Promise<string | null> | null = null;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Set default content type to JSON unless uploading FormData (image upload)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    let res = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers,
    });

    let data = await res.json().catch(() => ({}));
    // If token expired (401), try to refresh
    if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh-token') {
      try {
        if (!refreshTokenPromise) {
          refreshTokenPromise = fetch(`${BACKEND_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
          }).then(async (refreshRes) => {
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              localStorage.setItem('token', refreshData.token);
              return refreshData.token;
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              if (typeof document !== 'undefined') {
                document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
                document.cookie = 'role=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
              }
              window.location.href = '/';
              return null;
            }
          }).catch((err) => {
            console.error('Failed to refresh token:', err);
            return null;
          }).finally(() => {
            refreshTokenPromise = null;
          });
        }

        const newToken = await refreshTokenPromise;
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`);
          res = await fetch(`${BACKEND_URL}${endpoint}`, {
            credentials: 'include',
            ...options,
            headers,
          });
          data = await res.json().catch(() => ({}));
        }
      } catch (err) {
        console.error('Error during token refresh flow:', err);
      }
    }

    if (!res.ok) {
      throw new Error(data.message || data.error || 'Something went wrong');
    }

    return data;
  } catch (error: any) {
    console.error(`apiFetch Error [${endpoint}]:`, error.message);
    throw error;
  }
}

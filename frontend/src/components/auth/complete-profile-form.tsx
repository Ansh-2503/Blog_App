'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { authInputClassName, authLabelClassName } from '@/components/auth/auth-field-styles';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/context/auth-store';
import { ROUTES } from '@/lib/constants';

export function CompleteProfileForm() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: '',
    role: 'VISITOR' as 'VISITOR' | 'CREATOR',
  });
  const [loading, setLoading] = useState(false);

  // Fetch current user details to pre-fill name
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiFetch('/auth/me');
        if (data.user) {
          setForm((f) => ({ ...f, name: data.user.name || '' }));
        }
      } catch (err) {
        // Ignore error
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    setLoading(true);
    try {
      const data = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      
      // Update store
      useAuthStore.getState().setUser(data.user);
      
      toast.success('Profile completed successfully!');
      
      // Redirect based on role
      if (data.user.role === 'CREATOR') {
        router.push(ROUTES.articles);
      } else {
        router.push(ROUTES.home);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-1.5 text-2xl font-semibold text-foreground">
          Complete Your Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Please provide your name and select your role to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={authLabelClassName}>
            Full name
          </label>
          <input
            id="name"
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
          <label htmlFor="role" className={authLabelClassName}>
            I want to join as a
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className={`${authInputClassName} bg-card`}
          >
            <option value="VISITOR">Visitor (Read-only access)</option>
            <option value="CREATOR">Creator (Write & Publish articles)</option>
          </select>
        </div>

        <Button type="submit" className="h-10 w-full mt-4" disabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}

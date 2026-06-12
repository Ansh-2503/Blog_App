'use client';

import { useRef, useEffect, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch } from '@/lib/api-client';

import { Button } from '@/components/ui/button';
import { CoverImage } from '@/components/shared/cover-image';
import { useAuthStore } from '@/context/auth-store';
import { getAvatarFallback } from '@/lib/utils';

const fieldInputClass =
  'h-9 w-full rounded-lg border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50';

export function ProfileSettings() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : '',
    bio: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name,
        username: user.name.toLowerCase().replace(/\s+/g, ''),
      }));
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          bio: form.bio,
        }),
      });
      if (res.success && res.user) {
        useAuthStore.getState().setUser(res.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to compress image on client-side before uploading (drastically cuts upload time)
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400; // Profile pictures don't need to be large
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        if (event.target?.result) img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    toast.loading('Processing image...', { id: 'upload-image' });
    const compressedFile = await compressImage(file);

    const formData = new FormData();
    formData.append('image', compressedFile);

    try {
      toast.loading('Uploading image...', { id: 'upload-image' });
      const res = await apiFetch('/auth/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.data && user) {
        useAuthStore.getState().setUser({ ...user, avatar: res.data.avatar });
        toast.success('Profile photo updated successfully', { id: 'upload-image' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image', { id: 'upload-image' });
    }
  };

  const handleDeleteImage = async () => {
    try {
      toast.loading('Removing image...', { id: 'delete-image' });
      const res = await apiFetch('/auth/profile-image', {
        method: 'DELETE',
      });

      if (res.success && res.data && user) {
        useAuthStore.getState().setUser({ ...user, avatar: res.data.avatar });
        toast.success('Profile photo removed', { id: 'delete-image' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image', { id: 'delete-image' });
    }
  };

  return (
    <div className="max-w-2xl p-6">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your public profile and author information
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Profile Photo
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <CoverImage
                src={getAvatarFallback(user?.avatar)}
                alt={user?.name || 'User Avatar'}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-border"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                aria-label="Change profile photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
                  Upload new photo
                </Button>
                {user?.avatar && (
                  <Button variant="ghost" size="sm" type="button" onClick={handleDeleteImage} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG or JPEG · Max 5MB · Square recommended
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">
            Basic Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Full name
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={fieldInputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  @
                </span>
                <input
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className={`${fieldInputClass} pl-7`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={4}
              placeholder="Write a short bio about yourself..."
              className="w-full resize-none rounded-lg border border-border bg-input-background px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/50"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {form.bio.length}/300 characters
            </p>
          </div>



        <div className="flex gap-3">
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
          <Button variant="outline" type="button" onClick={() => {
            setForm({
              name: user?.name || '',
              username: user?.username || (user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : ''),
              bio: user?.bio || '',
            });
          }}>
            Discard
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}

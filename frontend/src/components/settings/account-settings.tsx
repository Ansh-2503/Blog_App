'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Eye,
  EyeOff,
  Shield,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/context/auth-store';
import { apiFetch } from '@/lib/api-client';

const fieldInputClass =
  'h-9 w-full rounded-lg border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50';

export function AccountSettings() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState({
    newFollower: true,
    articleComment: true,
    weeklyDigest: true,
    productUpdates: false,
    articleLikes: true,
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
  };

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        }),
      });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl p-6">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-foreground">Account Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your account security, notifications, and preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Shield className="h-4 w-4 text-primary" /> Email Address
          </h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Current email
            </label>
            <div className="flex gap-2">
              <input
                key={user?.email || 'default'}
                defaultValue={user?.email || "marcus@stripe.com"}
                type="email"
                className={`${fieldInputClass} flex-1`}
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => toast.success('Verification email sent!')}
              >
                Change
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              A verification email will be sent to your new address.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Shield className="h-4 w-4 text-primary" /> Change Password
          </h2>

          {[
            {
              label: 'Current password',
              show: showCurrentPw,
              toggle: () => setShowCurrentPw((s) => !s),
              value: passwords.currentPassword,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))
            },
            {
              label: 'New password',
              show: showNewPw,
              toggle: () => setShowNewPw((s) => !s),
              value: passwords.newPassword,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPasswords(p => ({ ...p, newPassword: e.target.value }))
            },
          ].map(({ label, show, toggle, value, onChange }) => (
            <div key={label}>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {label}
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${fieldInputClass} pr-10`}
                  value={value}
                  onChange={onChange}
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Confirm new password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className={fieldInputClass}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleChangePassword}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating...' : 'Update password'}
          </Button>
        </div>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Deleting your account is permanent. All your articles, followers, and
            data will be removed.
          </p>
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground">
              Type <strong>delete my account</strong> to confirm
            </label>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="delete my account"
              className="h-9 w-full rounded-lg border border-destructive/30 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-destructive/20"
            />
            <Button
              variant="destructive"
              size="sm"
              type="button"
              disabled={deleteConfirm !== 'delete my account'}
              onClick={() =>
                toast.error('Account deletion is disabled in demo mode')
              }
            >
              <Trash2 className="h-4 w-4" /> Delete Account Permanently
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

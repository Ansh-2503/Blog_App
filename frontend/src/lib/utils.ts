import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarFallback(avatarUrl?: string | null): string {
  if (!avatarUrl || avatarUrl.includes('api.dicebear.com')) {
    return '/user.png';
  }
  return avatarUrl;
}

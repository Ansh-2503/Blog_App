'use client';

import { useContext } from 'react';

import { ThemeContextValue } from '@/context/theme-provider';

export function useTheme() {
  return useContext(ThemeContextValue);
}

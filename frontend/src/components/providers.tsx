'use client';

import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/context/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/context/auth-store';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  // Initialize Auth state on mount
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster position="bottom-right" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

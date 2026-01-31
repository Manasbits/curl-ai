'use client';

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import QueryProvider from '@/components/query-provider';
import { ErrorBoundary } from '@/components/error-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ErrorBoundary>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ErrorBoundary>
    </QueryProvider>
  );
}

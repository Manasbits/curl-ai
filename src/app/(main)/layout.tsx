'use client';

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import QueryProvider from '@/components/query-provider';
import { ErrorBoundary } from '@/components/error-boundary';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">{children}</div>
        </AuthProvider>
      </ErrorBoundary>
    </QueryProvider>
  );
}
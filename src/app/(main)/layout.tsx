'use client';

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import QueryProvider from '@/components/query-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { MainNavbar } from '@/components/ui/main-navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 relative pb-24">
            {children}
            <MainNavbar />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </QueryProvider>
  );
}
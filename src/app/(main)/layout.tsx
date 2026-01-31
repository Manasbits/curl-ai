'use client';

import React from 'react';
import { MainNavbar } from '@/components/ui/main-navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <main className="safe-area-bottom">
        {children}
      </main>
      <MainNavbar />
    </div>
  );
}

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';



export function MainNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex items-center justify-between px-4 py-2 shadow-lg">
      <div className="flex flex-1 justify-evenly items-center relative">
        <button
          onClick={() => router.push('/home')}
          className={cn(
            'flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium transition-colors',
            pathname === '/home'
              ? 'text-cyan-600'
              : 'text-gray-500 hover:text-cyan-500'
          )}
        >
          <Home className="w-6 h-6 mb-0.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => router.push('/routine')}
          className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center border-4 border-white transition-all -translate-y-6 mx-4"
          aria-label="Create Routine"
          style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}
        >
          <Plus className="w-7 h-7" />
        </button>
        <button
          onClick={() => router.push('/profile')}
          className={cn(
            'flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium transition-colors',
            pathname === '/profile'
              ? 'text-cyan-600'
              : 'text-gray-500 hover:text-cyan-500'
          )}
        >
          <User className="w-6 h-6 mb-0.5" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
}

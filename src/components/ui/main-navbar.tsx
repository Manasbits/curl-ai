'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, Plus, Dumbbell, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "nav-item flex-1 min-w-0",
        isActive && "active"
      )}
    >
      <div className={cn(
        "transition-transform duration-300",
        isActive && "scale-110"
      )}>
        {icon}
      </div>
      <span className="text-xs font-medium truncate">{label}</span>
    </button>
  );
}

export function MainNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', href: '/home' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Progress', href: '/progress' },
    { type: 'fab' as const },
    { icon: <Dumbbell className="w-5 h-5" />, label: 'History', href: '/workout_history' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-navbar animate-slide-in-bottom">
      <div className="flex items-end justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.type === 'fab') {
            return (
              <button
                key="fab"
                onClick={() => router.push('/routine')}
                className="nav-fab"
                aria-label="Create Workout"
              >
                <Plus className="w-6 h-6" />
              </button>
            );
          }
          
          return (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label!}
              href={item.href!}
              isActive={pathname === item.href}
              onClick={() => router.push(item.href!)}
            />
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

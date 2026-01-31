'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
};

export function Input({ label, icon, error, className = '', ...props }: InputProps) {
  return (
    <label className={cn("flex flex-col gap-2 w-full", className)}>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div className={cn(
        "glass-input flex items-center rounded-xl px-4 py-3.5 transition-all duration-300",
        error && "border-destructive focus-within:border-destructive focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
      )}>
        {icon && (
          <div className="mr-3 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground/60 text-base"
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-destructive mt-1 animate-fade-in">
          {error}
        </span>
      )}
    </label>
  );
}

export default Input;

import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost';
};

export function Button({ variant = 'default', className = '', children, ...props }: ButtonProps) {
  const base =
    'rounded-full px-6 py-3 font-medium shadow-sm disabled:opacity-60 transition-colors w-full';
  const vstyles =
    variant === 'ghost'
      ? 'bg-transparent border border-gray-200 text-gray-800 hover:bg-gray-50'
      : 'bg-[#0f1724] text-white';
  return (
    <button className={`${base} ${vstyles} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;

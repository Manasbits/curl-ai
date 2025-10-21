import React from 'react';

export function ProviderIcon({ provider }: { provider: 'google' | 'apple' | 'facebook' }) {
  const base = 'w-10 h-10 rounded-full bg-white shadow flex items-center justify-center';
  if (provider === 'google') {
    return (
      <div className={base}>
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.5 24.5c0-1.4-.1-2.7-.4-4H24v7.6h11.9c-.5 3-2.6 5.5-5.6 6.8v5.6h9.1c5.3-4.9 8.6-12 8.6-20z" fill="#4285F4"/>
          <path d="M24 44c6 0 11-2 14.7-5.5l-9.1-5.6c-2 1.4-4.7 2.2-7.6 2.2-5.9 0-10.9-4-12.7-9.5H2.9v6A22 22 0 0024 44z" fill="#34A853"/>
          <path d="M11.3 26.1A13.6 13.6 0 0110 24c0-1 .2-1.9.4-2.8v-6H2.9A22 22 0 002 24c0 3.6.9 7 2.9 10.1l8.4-8z" fill="#FBBC05"/>
          <path d="M24 10.5c3.3 0 6.3 1.1 8.6 3.2l6.5-6.5C35 3.7 30 2 24 2 14 2 5.2 7.5 2.9 15.7l8.4 6.6C13.1 15 18.1 10.5 24 10.5z" fill="#EA4335"/>
        </svg>
      </div>
    );
  }
  if (provider === 'apple') {
    return (
      <div className={base}>
        <svg width="18" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.365 1.43c.3.4.6.9.6 1.5-.006 1.1-.9 2.5-1.9 3.3-.9.7-2.1 1.3-3.3 1.1-.2-.9.1-2 .7-2.8.6-.8 1.6-1.6 2.6-2.1.6-.3 1.2-.6 1.3-.6z" fill="#000"/>
          <path d="M19.4 6.7c-.9-1.2-2-2.1-3.5-2.6-1.2-.4-2.5-.3-3.8.3-1 .5-1.8 1.3-2.5 2.2-1 1.2-1.7 2.7-1.6 4.3.1 1.6.9 3.1 2 4.2.8.8 1.8 1.4 2.9 1.9 1.3.6 2.9 1 4.3 1 .6 0 1.2 0 1.8-.2.1 0 .6-.1.6-.1.2-.1.4-.2.5-.3.6-.3 1.1-.9 1.4-1.6.5-1.3.6-2.8.3-4.2-.3-1.6-1.3-3-2.6-4z" fill="#000"/>
        </svg>
      </div>
    );
  }
  return (
    <div className={base}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 4.9 3.5 9 8.1 9.9v-7h-2.4v-2.9h2.4V9.6c0-2.4 1.4-3.8 3.6-3.8 1 0 1.8.1 2 .1v2.3h-1.2c-1 0-1.3.6-1.3 1.2v1.6h2.7l-.4 2.9h-2.3V22C18.5 21 22 16.9 22 12z" fill="#1877F2"/>
      </svg>
    </div>
  );
}

export default ProviderIcon;

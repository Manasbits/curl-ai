'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { useProfile } from '@/hooks/use-profile';
import type { UserProfile } from '@/lib/firestore';

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  clearError: () => void;
};



const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const profileQuery = useProfile(uid || '');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setUid(u?.uid || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function clearError() {
    setError(null);
  }

  async function refetch() {
    setIsRefetching(true);
    try {
      await profileQuery.refetch();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsRefetching(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
  profile: profileQuery.data ?? null,
        loading: profileQuery.isLoading || loading,
        error: error || profileQuery.error || null,
        refetch,
        isRefetching,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

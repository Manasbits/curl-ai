'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { useProfile } from '@/hooks/use-profile';
import type { UserProfile } from '@/lib/firestore';
import { initializeUserInFirestore } from '@/lib/firestore';
import { useRoutines } from '@/hooks/use-routines';
import type { Routine, Workout } from '@/lib/types/workout';
import { useCompletedWorkouts, useFavoriteWorkouts } from '@/hooks/use-workout-history';

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  routines: Routine[] | null;
  completedWorkouts: Workout[] | null;
  favoriteWorkouts: Workout[] | null;
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
  const { routines: routinesQuery } = useRoutines(uid || '');
  const completedQuery = useCompletedWorkouts(uid || '');
  const favoriteQuery = useFavoriteWorkouts(uid || '');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        // Ensure user profile is initialized in Firestore
        try {
          await initializeUserInFirestore(u);
        } catch (error) {
          console.error('Error initializing user profile:', error);
          setError(error as Error);
        }
      }
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
      await Promise.all([
        profileQuery.refetch(),
        routinesQuery.refetch(),
        completedQuery.refetch(),
        favoriteQuery.refetch()
      ]);
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
  routines: routinesQuery.data ?? null,
  completedWorkouts: completedQuery.data ?? null,
  favoriteWorkouts: favoriteQuery.data ?? null,
  loading: profileQuery.isLoading || routinesQuery.isLoading || completedQuery.isLoading || favoriteQuery.isLoading || loading,
  error: error || profileQuery.error || routinesQuery.error || completedQuery.error || favoriteQuery.error || null,
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

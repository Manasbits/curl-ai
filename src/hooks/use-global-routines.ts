import { useQuery } from '@tanstack/react-query';
import { getGlobalRoutines } from '@/lib/firestore';
import type { GlobalRoutine } from '@/lib/types/schema';

/**
 * Hook to fetch global routines from Firestore
 * Falls back to empty array if collection doesn't exist
 */
export function useGlobalRoutines() {
  return useQuery<GlobalRoutine[]>({
    queryKey: ['globalRoutines'],
    queryFn: () => getGlobalRoutines(),
    staleTime: 1000 * 60 * 10, // Stay fresh for 10 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 1, // Only retry once if it fails
  });
}

import { useQuery } from '@tanstack/react-query';
import { getGlobalExercises } from '@/lib/firestore';
import type { GlobalExercise } from '@/lib/types/schema';

/**
 * Hook to fetch global exercises from Firestore
 * Falls back to empty array if collection doesn't exist
 */
export function useGlobalExercises() {
  return useQuery<GlobalExercise[]>({
    queryKey: ['globalExercises'],
    queryFn: () => getGlobalExercises(),
    staleTime: 1000 * 60 * 10, // Stay fresh for 10 minutes (exercises don't change often)
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 1, // Only retry once if it fails
  });
}

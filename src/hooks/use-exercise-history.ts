import { useQuery } from '@tanstack/react-query';
import { getExerciseHistoryByName } from '@/lib/firestore';
import type { ExerciseHistory } from '@/lib/types/schema';

export function useExerciseHistory(userId: string, exerciseName: string) {
  return useQuery<ExerciseHistory | null>({
    queryKey: ['exerciseHistory', userId, exerciseName],
    queryFn: () => getExerciseHistoryByName(userId, exerciseName),
    enabled: !!userId && !!exerciseName,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
}


import { useQuery } from '@tanstack/react-query';
import { getExerciseProgress } from '@/lib/firestore';
import type { ExerciseProgress } from '@/lib/types/workout';

export function useExerciseProgress(userId: string, exerciseName: string, startDate: string, endDate: string) {
  return useQuery<ExerciseProgress[], Error>({
    queryKey: ['exerciseProgress', userId, exerciseName, startDate, endDate],
    queryFn: () => getExerciseProgress(userId, exerciseName, startDate, endDate),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

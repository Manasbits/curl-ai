import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkout, finishWorkout, saveSetRealtime } from '@/lib/firestore';
import type { Workout, Exercise, Set } from '@/lib/types/workout';

export function useActiveWorkout(userId: string, routineId?: string) {
  const queryClient = useQueryClient();

  // Start a new workout
  const startWorkout = useMutation({
    mutationFn: async (exercises: Exercise[]) => {
      const workout: Omit<Workout, 'id'> = {
        routine_id: routineId || '',
        start_time: new Date(),
        end_time: null,
        duration_seconds: 0,
        is_favorite: false,
        ai_suggestions: [],
        exercises,
        status: 'in_progress'
      };
      return createWorkout(userId, workout);
    }
  });

  // Save a set in real-time
  const saveSet = useMutation({
    mutationFn: async (params: { workoutId: string; exerciseId: string; set: Set }) => {
      await saveSetRealtime(userId, params.workoutId, params.exerciseId, params.set);
    }
  });

  // Complete the workout
  const completeWorkout = useMutation({
    mutationFn: async (params: { workoutId: string; endTime: Date; durationSeconds: number }) => {
      await finishWorkout(userId, params.workoutId, params.endTime, params.durationSeconds);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
    }
  });

  return {
    startWorkout,
    saveSet,
    completeWorkout
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompletedWorkouts, getFavoriteWorkouts, toggleWorkoutFavorite } from '@/lib/firestore';

// Hook to fetch completed workouts (can be prefetched in AuthContext)
export function useCompletedWorkouts(userId: string) {
  return useQuery({
    queryKey: ['workouts', userId, 'completed'],
    queryFn: () => getCompletedWorkouts(userId),
    staleTime: 1000 * 60 * 10,
    enabled: !!userId,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook to fetch favorite workouts (can be prefetched in AuthContext)
export function useFavoriteWorkouts(userId: string) {
  return useQuery({
    queryKey: ['workouts', userId, 'favorites'],
    queryFn: () => getFavoriteWorkouts(userId),
    staleTime: 1000 * 60 * 10,
    enabled: !!userId,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Combined hook for the workout history page
export function useWorkoutHistory(userId: string) {
  const completed = useCompletedWorkouts(userId);
  const favorites = useFavoriteWorkouts(userId);

  const queryClient = useQueryClient();
  // Toggle favorite status for a workout
  const toggleFavorite = useMutation({
    mutationFn: async (params: { workoutId: string; isFavorite: boolean }) => {
      await toggleWorkoutFavorite(userId, params.workoutId, params.isFavorite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', userId, 'completed'] });
      queryClient.invalidateQueries({ queryKey: ['workouts', userId, 'favorites'] });
    },
  });

  return {
    completed,
    favorites,
    toggleFavorite,
  };
}

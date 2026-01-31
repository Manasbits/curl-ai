import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserRoutines, toggleRoutineFavorite, cloneGlobalRoutineToUser } from '@/lib/firestore';
import type { GlobalRoutine } from '@/lib/types/schema';

export function useRoutines(userId: string) {
  // Fetch all routines including predefined, custom, and AI generated
  const routines = useQuery({
    queryKey: ['routines', userId],
    queryFn: () => getUserRoutines(userId),
    enabled: !!userId, // Only fetch if we have a userId
    staleTime: 1000 * 60 * 5, // Stay fresh for 5 minutes
    gcTime: 1000 * 60 * 60, // Keep in garbage collection for 1 hour
  });

  const queryClient = useQueryClient();

  // Toggle favorite status for a routine
  const toggleFavorite = useMutation({
    mutationFn: async (params: { routineId: string; isFavorite: boolean }) => {
      await toggleRoutineFavorite(userId, params.routineId, params.isFavorite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', userId] });
    },
  });

  // Clone a global routine to user's routines
  const cloneGlobalRoutine = useMutation({
    mutationFn: async (globalRoutine: GlobalRoutine) => {
      return cloneGlobalRoutineToUser(userId, globalRoutine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', userId] });
    },
  });

  return {
    routines,
    toggleFavorite,
    cloneGlobalRoutine,
  };
}
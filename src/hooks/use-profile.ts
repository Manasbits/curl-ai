import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/firestore';

export function useProfile(userId: string) {
  return useQuery<UserProfile | null, Error>({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) => {
      await updateUserProfile(userId, updates);
      return updates;
    },
    onMutate: async ({ userId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['userProfile', userId] });
      const previous = queryClient.getQueryData(['userProfile', userId]);
  queryClient.setQueryData(['userProfile', userId], (old: UserProfile | null) => ({ ...old, ...updates }));
      return { previous };
    },
    onError: (err, { userId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['userProfile', userId], context.previous);
      }
    },
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
  });
}

'use client'
import { useAuth } from '@/context/auth-context';
import { useWorkoutHistory } from '@/hooks/use-workout-history';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function WorkoutHistoryPage() {
  const { user, completedWorkouts, favoriteWorkouts, loading } = useAuth();
  const userId = user?.uid || '';
  const { toggleFavorite } = useWorkoutHistory(userId);

  if (!userId) return <div className="p-6">Please sign in.</div>;
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6">Workout History</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Favorites</h2>
        {favoriteWorkouts && favoriteWorkouts.length > 0 ? (
          <ul className="space-y-2">
            {favoriteWorkouts.map((w) => (
              <li key={w.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex-1 font-medium">{w.routine_id}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleFavorite.mutate({ workoutId: w.id, isFavorite: !w.is_favorite })}
                >
                  <Star className={w.is_favorite ? 'text-yellow-400' : 'text-gray-400'} />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No favorite workouts yet.</div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">All Workouts</h2>
        {completedWorkouts && completedWorkouts.length > 0 ? (
          <ul className="space-y-2">
            {completedWorkouts.map((w) => (
              <li key={w.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex-1 font-medium">{w.routine_id}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleFavorite.mutate({ workoutId: w.id, isFavorite: !w.is_favorite })}
                >
                  <Star className={w.is_favorite ? 'text-yellow-400' : 'text-gray-400'} />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No workouts found.</div>
        )}
      </div>
    </div>
  );
}

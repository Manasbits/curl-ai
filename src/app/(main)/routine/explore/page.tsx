'use client'

import { useAuth } from '@/context/auth-context';
import { useRoutines } from '@/hooks/use-routines';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Star, ChevronRight, Dumbbell } from 'lucide-react';
import type { Routine } from '@/lib/types/workout';
import { useEffect } from 'react';
import { initializePredefinedRoutines } from '@/lib/firestore';

export default function ExploreRoutinesPage() {
  const { user } = useAuth();
  const userId = user?.uid || '';
  const { routines, toggleFavorite } = useRoutines(userId);
  const router = useRouter();

  // On first load, if no routines, initialize predefined routines
  useEffect(() => {
    if (!userId || routines.isLoading || routines.isFetching) return;
    if (routines.data && routines.data.length === 0) {
      initializePredefinedRoutines(userId).then(() => {
        // Refetch routines after initializing
        if (typeof routines.refetch === 'function') routines.refetch();
      });
    }
  }, [userId, routines, routines.data, routines.isLoading, routines.isFetching]);

  const handleStartWorkout = (routine: Routine) => {
    router.push(`/workout_log?routine=${routine.id}`);
  };

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen bg-white p-6">
        <h1 className="text-2xl font-bold mb-6">Explore Routines</h1>
        <div>Please sign in to view routines.</div>
      </div>
    );
  }

  if (routines.isLoading || routines.isFetching) {
    return (
      <div className="flex flex-col min-h-screen bg-white p-6">
        <h1 className="text-2xl font-bold mb-6">Explore Routines</h1>
        <div>Loading routines...</div>
      </div>
    );
  }

  if (routines.error) {
    return (
      <div className="flex flex-col min-h-screen bg-white p-6">
        <h1 className="text-2xl font-bold mb-6">Explore Routines</h1>
        <div className="text-red-500">Error loading routines. Please try again later.</div>
      </div>
    );
  }

  if (!routines.data || routines.data.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white p-6">
        <h1 className="text-2xl font-bold mb-6">Explore Routines</h1>
        <div>No routines found. Please create a custom routine or refresh the page.</div>
      </div>
    );
  }

  // Group routines by type
  const favoriteRoutines = routines.data.filter(r => r.is_favorite);
  const predefinedRoutines = routines.data.filter(r => r.type === 'predefined');
  const customRoutines = routines.data.filter(r => r.type === 'custom');
  const aiRoutines = routines.data.filter(r => r.type === 'ai_generated');

  const RoutineCard = ({ routine }: { routine: Routine }) => (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{routine.name}</h3>
          <button
            onClick={() => toggleFavorite.mutate({
              routineId: routine.id,
              isFavorite: !routine.is_favorite
            })}
            className={`p-2 rounded-full transition-colors ${
              routine.is_favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <Star className="w-5 h-5" fill={routine.is_favorite ? "currentColor" : "none"} />
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-3">{routine.description}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Dumbbell className="w-4 h-4" />
          <span>{routine.exercises.length} exercises</span>
          {routine.favorite_count > 0 && (
            <>
              <span>•</span>
              <Star className="w-4 h-4" />
              <span>{routine.favorite_count}</span>
            </>
          )}
        </div>
        <Button 
          onClick={() => handleStartWorkout(routine)}
          className="w-full flex items-center justify-center gap-2"
        >
          Start Workout
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="relative flex items-center justify-between p-4 border-b bg-white">
        <button onClick={() => router.back()} className="text-cyan-500 font-medium">Back</button>
        <h1 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">Explore Routines</h1>
        <span className="opacity-0">Back</span>
      </div>

      <div className="flex-1 p-4 pb-32">
        {favoriteRoutines.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Favorites</h2>
            {favoriteRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Predefined Routines</h2>
          {predefinedRoutines.map(routine => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </section>

        {customRoutines.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Custom Routines</h2>
            {customRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </section>
        )}

        {aiRoutines.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">AI Generated Routines</h2>
            {aiRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

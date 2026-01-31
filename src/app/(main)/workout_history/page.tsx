'use client'
import { useAuth } from '@/context/auth-context';
import { useWorkoutHistory } from '@/hooks/use-workout-history';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, ChevronLeft, Clock, Dumbbell, Calendar, History } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Workout } from '@/lib/types/workout';

export default function WorkoutHistoryPage() {
  const router = useRouter();
  const { user, completedWorkouts, favoriteWorkouts, loading } = useAuth();
  const userId = user?.uid || '';
  const { toggleFavorite } = useWorkoutHistory(userId);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please sign in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  const formatDate = (endTime: Date | null) => {
    if (!endTime) return '';
    const date = endTime instanceof Date ? endTime : new Date(endTime);
    return date.toLocaleDateString();
  };

  const WorkoutCard = ({ workout }: { workout: Workout }) => (
    <Card className="group">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          <Dumbbell className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground truncate">{workout.routine_id}</h3>
            <button
              onClick={() => toggleFavorite.mutate({ workoutId: workout.id, isFavorite: !workout.is_favorite })}
              className={`p-2 rounded-lg transition-all ${
                workout.is_favorite 
                  ? 'text-yellow-500 hover:bg-yellow-500/10' 
                  : 'text-muted-foreground hover:text-yellow-500 hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <Star className="w-5 h-5" fill={workout.is_favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          {workout.end_time && (
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(workout.end_time)}
              </span>
              {workout.duration_seconds && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(workout.duration_seconds / 60)}m
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="page-header flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="icon-btn w-10 h-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title flex-1 text-center pr-10">Workout History</h1>
      </header>

      <main className="flex-1 p-6 space-y-8 animate-fade-in-up">
        {/* Hero Section */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Journey</h2>
              <p className="text-muted-foreground text-sm">
                {completedWorkouts?.length || 0} workouts completed
              </p>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteWorkouts && favoriteWorkouts.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              Favorites
            </h2>
            <div className="space-y-3 stagger-children">
              {favoriteWorkouts.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          </section>
        )}

        {/* All Workouts Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-primary" />
            All Workouts
          </h2>
          {completedWorkouts && completedWorkouts.length > 0 ? (
            <div className="space-y-3 stagger-children">
              {completedWorkouts.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Workouts Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start your first workout to build your history
              </p>
              <Button onClick={() => router.push('/routine')}>
                Start Workout
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

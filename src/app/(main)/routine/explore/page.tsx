'use client'

import { useAuth } from '@/context/auth-context';
import { useRoutines } from '@/hooks/use-routines';
import { useGlobalRoutines } from '@/hooks/use-global-routines';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Star, ChevronRight, Dumbbell, ChevronLeft, Compass, Sparkles, Plus, Globe } from 'lucide-react';
import type { Routine } from '@/lib/types/workout';
import type { GlobalRoutine } from '@/lib/types/schema';
import { useEffect, useMemo } from 'react';
import { initializePredefinedRoutines } from '@/lib/firestore';

export default function ExploreRoutinesPage() {
  const { user } = useAuth();
  const userId = user?.uid || '';
  const { routines, toggleFavorite, cloneGlobalRoutine } = useRoutines(userId);
  const { data: globalRoutines = [], isLoading: isLoadingGlobal } = useGlobalRoutines();
  const router = useRouter();

  useEffect(() => {
    if (!userId || routines.isLoading || routines.isFetching) return;
    if (routines.data && routines.data.length === 0) {
      initializePredefinedRoutines(userId).then(() => {
        if (typeof routines.refetch === 'function') routines.refetch();
      });
    }
  }, [userId, routines]);

  const handleStartWorkout = (routine: Routine) => {
    router.push(`/workout_log?routine=${routine.id}`);
  };

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="page-header flex items-center gap-4">
          <button onClick={() => router.back()} className="icon-btn w-10 h-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="page-title flex-1 text-center pr-10">Explore</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Please sign in to view routines.</p>
        </div>
      </div>
    );
  }

  if (routines.isLoading || routines.isFetching || isLoadingGlobal) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="page-header flex items-center gap-4">
          <button onClick={() => router.back()} className="icon-btn w-10 h-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="page-title flex-1 text-center pr-10">Explore</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (routines.error) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="page-header flex items-center gap-4">
          <button onClick={() => router.back()} className="icon-btn w-10 h-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="page-title flex-1 text-center pr-10">Explore</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="text-center p-8">
            <div className="text-destructive mb-2">Error loading routines</div>
            <p className="text-muted-foreground text-sm">Please try again later</p>
          </Card>
        </div>
      </div>
    );
  }

  const favoriteRoutines = routines.data?.filter(r => r.is_favorite) || [];
  const predefinedRoutines = routines.data?.filter(r => r.type === 'predefined') || [];
  const customRoutines = routines.data?.filter(r => r.type === 'custom') || [];
  const aiRoutines = routines.data?.filter(r => r.type === 'ai_generated') || [];

  // Helper to convert GlobalRoutine to a display format compatible with RoutineCard
  const GlobalRoutineCard = ({ routine }: { routine: GlobalRoutine }) => {
    // Convert GlobalRoutine exercises to Routine format for display
    const exerciseCount = routine.exercises?.length || 0;
    
    return (
      <Card className="group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground">{routine.name}</h3>
              <span className="badge text-xs bg-primary/20 text-primary border-primary/30">
                <Globe className="w-3 h-3 mr-1" />
                Global
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{routine.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" />
            {exerciseCount} exercises
          </span>
          {routine.goal && (
            <span className="badge text-xs capitalize">{routine.goal}</span>
          )}
          {routine.difficulty && (
            <span className="badge text-xs capitalize">{routine.difficulty}</span>
          )}
          {routine.estimatedDuration && (
            <span className="text-xs">~{routine.estimatedDuration} min</span>
          )}
        </div>
        
        <Button 
          onClick={() => {
            cloneGlobalRoutine.mutate(routine, {
              onSuccess: () => {
                // Show success feedback
                alert(`"${routine.name}" has been added to your routines!`);
              },
              onError: (error) => {
                console.error('Error cloning routine:', error);
                alert('Failed to clone routine. Please try again.');
              }
            });
          }}
          className="w-full"
          size="sm"
          variant="secondary"
          disabled={cloneGlobalRoutine.isPending}
        >
          {cloneGlobalRoutine.isPending ? 'Cloning...' : 'Clone to My Routines'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Card>
    );
  };

  const RoutineCard = ({ routine }: { routine: Routine }) => (
    <Card className="group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{routine.name}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{routine.description}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite.mutate({
              routineId: routine.id,
              isFavorite: !routine.is_favorite
            });
          }}
          className={`p-2 rounded-lg transition-all ${
            routine.is_favorite 
              ? 'text-yellow-500 hover:bg-yellow-500/10' 
              : 'text-muted-foreground hover:text-yellow-500 hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          <Star className="w-5 h-5" fill={routine.is_favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5">
          <Dumbbell className="w-4 h-4" />
          {routine.exercises.length} exercises
        </span>
        {routine.favorite_count > 0 && (
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4" />
            {routine.favorite_count}
          </span>
        )}
      </div>
      
      <Button 
        onClick={() => handleStartWorkout(routine)}
        className="w-full"
        size="sm"
      >
        Start Workout
        <ChevronRight className="w-4 h-4" />
      </Button>
    </Card>
  );

  const SectionHeader = ({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) => (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="badge">{count}</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="page-header flex items-center gap-4">
        <button onClick={() => router.back()} className="icon-btn w-10 h-10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title flex-1 text-center pr-10">Explore Routines</h1>
      </header>

      <main className="flex-1 p-6 space-y-8 animate-fade-in-up">
        {/* Hero */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Find Your Routine</h2>
              <p className="text-muted-foreground text-sm">
                {((routines.data?.length || 0) + (globalRoutines.length || 0))} routines available
                {globalRoutines.length > 0 && (
                  <span className="ml-1">({globalRoutines.length} global)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Global Routines */}
        {globalRoutines.length > 0 && (
          <section>
            <SectionHeader 
              icon={<Globe className="w-5 h-5 text-blue-500" />} 
              title="Global Routines" 
              count={globalRoutines.length}
            />
            <div className="space-y-3 stagger-children">
              {globalRoutines.map(routine => (
                <GlobalRoutineCard key={routine.routineId} routine={routine} />
              ))}
            </div>
          </section>
        )}

        {/* Favorites */}
        {favoriteRoutines.length > 0 && (
          <section>
            <SectionHeader 
              icon={<Star className="w-5 h-5 text-yellow-500" />} 
              title="Favorites" 
              count={favoriteRoutines.length}
            />
            <div className="space-y-3 stagger-children">
              {favoriteRoutines.map(routine => (
                <RoutineCard key={routine.id} routine={routine} />
              ))}
            </div>
          </section>
        )}

        {/* Predefined */}
        {predefinedRoutines.length > 0 && (
          <section>
            <SectionHeader 
              icon={<Dumbbell className="w-5 h-5 text-primary" />} 
              title="Predefined Routines" 
              count={predefinedRoutines.length}
            />
            <div className="space-y-3 stagger-children">
              {predefinedRoutines.map(routine => (
                <RoutineCard key={routine.id} routine={routine} />
              ))}
            </div>
          </section>
        )}

        {/* Custom */}
        {customRoutines.length > 0 && (
          <section>
            <SectionHeader 
              icon={<Plus className="w-5 h-5 text-green-500" />} 
              title="Custom Routines" 
              count={customRoutines.length}
            />
            <div className="space-y-3 stagger-children">
              {customRoutines.map(routine => (
                <RoutineCard key={routine.id} routine={routine} />
              ))}
            </div>
          </section>
        )}

        {/* AI Generated */}
        {aiRoutines.length > 0 && (
          <section>
            <SectionHeader 
              icon={<Sparkles className="w-5 h-5 text-purple-500" />} 
              title="AI Generated" 
              count={aiRoutines.length}
            />
            <div className="space-y-3 stagger-children">
              {aiRoutines.map(routine => (
                <RoutineCard key={routine.id} routine={routine} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!routines.data || routines.data.length === 0) && (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Routines Found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create a custom routine to get started
            </p>
            <Button onClick={() => router.push('/routine/custom')}>
              Create Routine
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

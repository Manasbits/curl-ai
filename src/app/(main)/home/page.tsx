'use client'
import { LogOut, Star, ChevronRight, Flame, Dumbbell, Calendar, TrendingUp } from 'lucide-react';
import { signOut } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

export default function WorkoutPage() {
  const { profile: userProfile, loading, routines } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Get favorite routines for pinned workouts
  const pinnedWorkouts = routines?.filter(r => r.is_favorite) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="page-header flex items-center justify-between">
        <h1 className="page-title">Workout</h1>
        <button 
          onClick={handleLogout}
          className="icon-btn w-10 h-10"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="flex-1 p-6 space-y-8 stagger-children">
          {/* Welcome Section */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-2xl font-bold text-white">
                  {userProfile?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  Welcome back, {userProfile?.name?.split(' ')[0] || 'Athlete'}!
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {userProfile?.experience_level ? (
                    <span className="capitalize">{userProfile.experience_level}</span>
                  ) : 'Ready to train'}
                  {userProfile?.goal && (
                    <> • <span className="capitalize">{userProfile.goal.replace('_', ' ')}</span></>
                  )}
                </p>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="flex gap-4 mt-6">
              <div className="flex-1 text-center p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold text-lg">
                    {userProfile?.stats?.currentStreak ?? 0}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Day Streak</span>
              </div>
              <div className="flex-1 text-center p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <Dumbbell className="w-4 h-4" />
                  <span className="font-bold text-lg">{routines?.length || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground">Routines</span>
              </div>
              <div className="flex-1 text-center p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-bold text-lg">
                    {/* Weekly workouts will eventually come from activity_log aggregation */}
                    {userProfile?.stats?.totalWorkouts ?? 0}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
            </div>
          </div>

          {/* Quick Start Section */}
          <section>
            <h2 className="section-title flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Quick Start
            </h2>
            <div className="grid gap-3">
              <Button 
                onClick={() => router.push('/routine')} 
                size="lg"
                className="w-full justify-between"
              >
                <span>Plan a Workout</span>
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => router.push('/routine/explore')}
                variant="secondary"
                size="lg"
                className="w-full justify-between"
              >
                <span>Explore Routines</span>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </section>

          {/* Pinned Workouts */}
          {pinnedWorkouts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Pinned Workouts
                </h2>
              </div>
              <div className="space-y-3">
                {pinnedWorkouts.slice(0, 3).map((workout) => (
                  <Card key={workout.id} className="cursor-pointer" onClick={() => router.push(`/workout_log?routine=${workout.id}`)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {workout.name}
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {workout.exercises.length} exercises • {workout.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" size="sm">
                        Start Workout
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Empty State for No Workouts */}
          {pinnedWorkouts.length === 0 && (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Pinned Workouts</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Star your favorite routines for quick access
              </p>
              <Button 
                variant="secondary" 
                onClick={() => router.push('/routine/explore')}
              >
                Browse Routines
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

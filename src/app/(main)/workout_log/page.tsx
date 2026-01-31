"use client"

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Check, Sparkles, Dumbbell, Target, Timer, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useActiveWorkout } from '@/hooks/use-active-workout';
import { getExerciseHistoryByName } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface ExerciseSet {
  id: number;
  previous: string;
  kg: number;
  reps: number;
  time?: number;
  completed: boolean;
  // --- New richer fields used only on the client for now ---
  type?: 'normal' | 'warmup' | 'drop' | 'failure';
  rpe?: number;
  notes?: string;
  previousWeight?: number;
  previousReps?: number;
}

interface WorkoutExercise {
  id: number;
  name: string;
  type: string;
  category: string;
  description: string;
  timeElapsed: number;
  sets: ExerciseSet[];
}

function WorkoutLogContent() {
  const router = useRouter();
  const [workoutStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  const searchParams = useSearchParams();
  const routineParamId = searchParams.get('routine');
  const routineId = routineParamId || undefined;
  const { user, routines, loading } = useAuth();
  const userId = user?.uid || '';
  const { startWorkout, saveSet, completeWorkout } = useActiveWorkout(userId, routineId);
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  // Load routine and initialize workout with previous performance
  useEffect(() => {
    if (!routineId || !routines || !userId) return;
    if (exercises.length > 0) return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    // Initialize exercises with placeholder previous data
    const workoutExercises: WorkoutExercise[] = routine.exercises.map((ex, index) => ({
      id: index + 1,
      name: ex.name,
      type: 'Reps',
      category: ex.category,
      description: `${ex.sets.length} sets`,
      timeElapsed: 0,
      sets: ex.sets.map((set, setIndex) => ({
        id: setIndex + 1,
        previous: `${set.weight_kg}kg x ${set.reps}`, // Fallback to current set values
        kg: set.weight_kg,
        reps: set.reps,
        completed: false,
        previousWeight: set.weight_kg, // Will be updated from history
        previousReps: set.reps // Will be updated from history
      }))
    }));
    
    setExercises(workoutExercises);
    
    // Fetch exercise history for all exercises and update previous performance
    (async () => {
      try {
        const historyPromises = routine.exercises.map(ex => 
          getExerciseHistoryByName(userId, ex.name).catch(() => null)
        );
        const histories = await Promise.all(historyPromises);
        
        // Update exercises with previous performance data
        setExercises(prev => {
          return prev.map((exercise, index) => {
            const history = histories[index];
            if (!history || !history.records) return exercise;
            
            const records = history.records;
            // Get the most recent performance from performanceLog
            const performanceDates = Object.keys(history.performanceLog || {}).sort().reverse();
            const latestDate = performanceDates[0];
            const latestPerformance = latestDate ? history.performanceLog[latestDate] : null;
            
            // Use latest performance if available, otherwise use records
            const prevWeight = latestPerformance?.topSet?.weight || records.maxWeight || 0;
            const prevReps = latestPerformance?.topSet?.reps || records.maxReps || 0;
            
            if (prevWeight > 0 || prevReps > 0) {
              return {
                ...exercise,
                sets: exercise.sets.map(set => ({
                  ...set,
                  previousWeight: prevWeight,
                  previousReps: prevReps,
                  previous: `${prevWeight}kg x ${prevReps}`
                }))
              };
            }
            return exercise;
          });
        });
      } catch (err) {
        console.warn('Error fetching exercise histories:', err);
        // Keep fallback values
      }
    })();
  }, [routineId, routines, exercises.length, userId]);

  // Start the workout in Firestore
  const hasStartedRef = useRef(false);
  useEffect(() => {
    if (!routineId || !routines || workoutId || hasStartedRef.current || loading) return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    hasStartedRef.current = true;
    startWorkout.mutate(routine.exercises, {
      onSuccess: (id) => setWorkoutId(id)
    });
  }, [routineId, routines, workoutId, loading, startWorkout]);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = () => {
    const elapsed = Math.floor((currentTime - workoutStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleSetCompletion = (exerciseId: number, setId: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => {
            const newCompleted = !set.completed;
            if (set.id === setId && workoutId) {
              saveSet.mutate({
                workoutId,
                exerciseId: exerciseId.toString(),
                set: {
                  weight_kg: set.kg,
                  reps: set.reps,
                  completed: newCompleted,
                  saved_at: new Date()
                }
              });
            }
            return set.id === setId ? { ...set, completed: newCompleted } : set;
          })
        };
      }
      return ex;
    }));
  };

  const getTotalVolume = () => {
    return exercises.reduce((total, ex) => {
      return total + ex.sets.reduce((setTotal, set) => {
        // Only count normal sets for volume (exclude warmup)
        if (set.completed && set.type !== 'warmup') {
          return setTotal + (set.kg * set.reps);
        }
        return setTotal;
      }, 0);
    }, 0);
  };

  const getTotalReps = () => {
    return exercises.reduce((total, ex) => {
      return total + ex.sets.reduce((repTotal, set) => {
        // Only count normal sets for reps (exclude warmup)
        if (set.completed && set.type !== 'warmup') {
          return repTotal + set.reps;
        }
        return repTotal;
      }, 0);
    }, 0);
  };

  const getTotalSets = () => {
    return exercises.reduce((total, ex) => {
      return total + ex.sets.filter(set => set.completed && set.type !== 'warmup').length;
    }, 0);
  };

  const getCompletionPercentage = () => {
    const totalSets = exercises.reduce((t, ex) => t + ex.sets.length, 0);
    const completedSets = getTotalSets();
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.back()}
            className="icon-btn w-10 h-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="page-title">Workout Log</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Sparkles className="w-4 h-4" />
              AI Fix
            </Button>
            <Button 
              onClick={() => {
                if (workoutId) {
                  const endTime = new Date();
                  const durationSeconds = Math.floor((endTime.getTime() - workoutStartTime) / 1000);
                  const totalVolume = getTotalVolume();
                  const totalReps = getTotalReps();
                  const totalSets = getTotalSets();
                  completeWorkout.mutate({
                    workoutId,
                    endTime,
                    durationSeconds,
                    totalVolume,
                    totalReps,
                    totalSets
                  }, {
                    onSuccess: () => router.push('/workout_history')
                  });
                }
              }}
              size="sm"
            >
              {completeWorkout.isPending ? 'Saving...' : 'Finish'}
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold">{formatDuration()}</span>
            </div>
            <span className="text-xs text-muted-foreground">Duration</span>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-foreground mb-1">
              <Dumbbell className="w-4 h-4 text-primary" />
              <span className="font-bold">{getTotalVolume()}<span className="text-xs ml-0.5">kg</span></span>
            </div>
            <span className="text-xs text-muted-foreground">Volume</span>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-foreground mb-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="font-bold">{getCompletionPercentage()}%</span>
            </div>
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
        </div>
      </header>

      {/* Exercise List */}
      <div className="flex-1 p-4 space-y-4 stagger-children">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id} className="overflow-hidden">
            {/* Exercise Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-primary font-semibold text-lg">
                  {exercise.name}
                </h3>
                <p className="text-muted-foreground text-sm">{exercise.category} • {exercise.description}</p>
              </div>
            </div>

            {/* Sets Table */}
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_80px_80px_72px_60px_56px] gap-2 px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div>Set</div>
                <div>Previous</div>
                <div className="text-center">KG</div>
                <div className="text-center">Reps</div>
                <div className="text-center">Type</div>
                <div className="text-center">RPE</div>
                <div className="text-center">Done</div>
              </div>

              {/* Table Rows */}
              {exercise.sets.map((set, index) => (
                <div key={set.id} className="space-y-2">
                  <div
                    className={`grid grid-cols-[40px_1fr_80px_80px_72px_60px_56px] gap-2 items-center p-2 rounded-xl transition-all duration-300 ${
                      set.completed 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-[rgba(255,255,255,0.02)]'
                    }`}
                  >
                    {/* Set Number */}
                    <div className="flex items-center gap-1">
                      {index === 0 && (
                        <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                      )}
                      <span className={`font-medium ${index === 0 ? 'text-amber-500' : 'text-foreground'}`}>
                        {index === 0 ? 'W' : index}
                      </span>
                    </div>

                    {/* Previous */}
                    <div className="text-muted-foreground text-sm flex items-center gap-1">
                      {set.previousWeight !== undefined && set.previousReps !== undefined && 
                       set.previousWeight > 0 && set.previousReps > 0 ? (
                        <>
                          <span>{set.previous}</span>
                          {set.kg > 0 && set.reps > 0 && (
                            <>
                              {set.kg > set.previousWeight || set.reps > set.previousReps ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              ) : set.kg < set.previousWeight || set.reps < set.previousReps ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              ) : null}
                            </>
                          )}
                        </>
                      ) : (
                        <span>{set.previous}</span>
                      )}
                    </div>

                    {/* KG */}
                    <div>
                      <input
                        type="number"
                        value={set.kg}
                        onChange={(e) => {
                          const newExercises = [...exercises];
                          newExercises[exerciseIndex].sets[index].kg = Number(e.target.value);
                          setExercises(newExercises);
                        }}
                        className="w-full text-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 text-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Reps */}
                    <div>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => {
                          const newExercises = [...exercises];
                          newExercises[exerciseIndex].sets[index].reps = Number(e.target.value);
                          setExercises(newExercises);
                        }}
                        className="w-full text-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 text-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Set Type */}
                    <div>
                      <select
                        value={set.type || 'normal'}
                        onChange={(e) => {
                          const newExercises = [...exercises];
                          newExercises[exerciseIndex].sets[index].type = e.target.value as ExerciseSet['type'];
                          setExercises(newExercises);
                        }}
                        className="w-full text-xs bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg py-1 px-1 text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="warmup">Warmup</option>
                        <option value="drop">Drop</option>
                        <option value="failure">Failure</option>
                      </select>
                    </div>

                    {/* RPE */}
                    <div>
                      <input
                        type="number"
                        min="6"
                        max="10"
                        step="0.5"
                        value={set.rpe || ''}
                        placeholder="—"
                        onChange={(e) => {
                          const newExercises = [...exercises];
                          const value = e.target.value ? Number(e.target.value) : undefined;
                          newExercises[exerciseIndex].sets[index].rpe = value;
                          setExercises(newExercises);
                        }}
                        className="w-full text-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 text-foreground text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Checkbox */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleSetCompletion(exercise.id, set.id)}
                        className={`checkbox-glass ${set.completed ? 'checked' : ''}`}
                      >
                        {set.completed && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Notes Row (expandable) */}
                  {(set.notes !== undefined || set.completed) && (
                    <div className="ml-[52px]">
                      <textarea
                        placeholder="Add notes (optional)..."
                        value={set.notes || ''}
                        onChange={(e) => {
                          const newExercises = [...exercises];
                          newExercises[exerciseIndex].sets[index].notes = e.target.value || undefined;
                          setExercises(newExercises);
                        }}
                        className="w-full text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg py-2 px-3 text-foreground focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/50"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function WorkoutLogPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    }>
      <WorkoutLogContent />
    </Suspense>
  );
}

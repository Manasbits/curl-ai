'use client'
import { useAuth } from '@/context/auth-context';
import { useExerciseProgress } from '@/hooks/use-exercise-progress';
import { useExerciseHistory } from '@/hooks/use-exercise-history';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, TrendingUp, Dumbbell, Calendar, Activity, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ExerciseHistory } from '@/lib/types/schema';

export default function ProgressPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [exerciseName, setExerciseName] = useState('Bench Press (Barbell)');
  const [range, setRange] = useState(30);
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const historyQuery = useExerciseHistory(userId, exerciseName);
  const legacyQuery = useExerciseProgress(userId, exerciseName, startDate, endDate);

  const historyToRows = (history: ExerciseHistory) => {
    const entries = Object.values(history.performanceLog || {});
      // Filter by date range (YYYY-MM-DD string compare is safe)
    const inRange = entries.filter(e => e.date >= startDate && e.date <= endDate);
    // Sort ascending by date
    inRange.sort((a, b) => a.date.localeCompare(b.date));
    return inRange.map(e => ({
      date: e.date,
      workouts_count: 1,
      max_weight_kg: e.topSet?.weight ?? 0,
      max_reps: e.topSet?.reps ?? 0,
      total_volume_kg: e.totalVolume ?? 0,
      total_sets: e.totalSets ?? 0,
    }));
  };

  const useNewHistory = !!historyQuery.data;
  const data = useNewHistory ? historyToRows(historyQuery.data!) : legacyQuery.data;
  const isLoading = useNewHistory ? historyQuery.isLoading : legacyQuery.isLoading;
  const isError = useNewHistory ? !!historyQuery.error : legacyQuery.isError;

  const exercises = [
    'Bench Press (Barbell)',
    'Squat (Barbell)',
    'Deadlift (Barbell)',
    'Shoulder Press (Dumbbell)',
    'Bicep Curl (Dumbbell)',
    'Pull Up',
  ];

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
        <h1 className="page-title flex-1 text-center pr-10">Progress</h1>
      </header>

      <main className="flex-1 p-6 space-y-6 animate-fade-in-up">
        {/* Hero Stats */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Track Your Gains</h2>
              <p className="text-muted-foreground text-sm">Monitor your exercise progress</p>
            </div>
          </div>
        </div>

        {/* Records (new schema) */}
        {historyQuery.data?.records && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Max Weight</p>
              <p className="text-lg font-bold text-primary">{historyQuery.data.records.maxWeight} kg</p>
              <p className="text-xs text-muted-foreground mt-1">{historyQuery.data.records.maxWeightDate}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Max Reps</p>
              <p className="text-lg font-bold text-foreground">{historyQuery.data.records.maxReps}</p>
              <p className="text-xs text-muted-foreground mt-1">{historyQuery.data.records.maxRepsDate}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Estimated 1RM</p>
              <p className="text-lg font-bold text-foreground">{historyQuery.data.records.estimated1RM}</p>
              <p className="text-xs text-muted-foreground mt-1">{historyQuery.data.records.estimated1RMDate}</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <label className="text-xs text-muted-foreground mb-2 block">Exercise</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors pr-10"
                value={exerciseName}
                onChange={e => setExerciseName(e.target.value)}
              >
                {exercises.map(ex => (
                  <option key={ex} value={ex} className="bg-background">{ex}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </Card>

          <Card>
            <label className="text-xs text-muted-foreground mb-2 block">Time Range</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors pr-10"
                value={range}
                onChange={e => setRange(Number(e.target.value))}
              >
                <option value={7} className="bg-background">7 days</option>
                <option value={30} className="bg-background">30 days</option>
                <option value={90} className="bg-background">90 days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </Card>
        </div>

        {/* Progress Data */}
        {isLoading || (!useNewHistory && historyQuery.isLoading) ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner" />
          </div>
        ) : isError ? (
          <Card className="text-center py-8">
            <div className="text-destructive mb-2">Error loading progress</div>
            <p className="text-muted-foreground text-sm">Please try again later</p>
          </Card>
        ) : data && data.length > 0 ? (
          <div className="space-y-4 stagger-children">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Progress Data
            </h3>
            {data.map((entry, idx) => (
              <Card key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{entry.date}</span>
                  </div>
                  <span className="badge">{entry.workouts_count} workout{entry.workouts_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <p className="text-xs text-muted-foreground mb-1">Max Weight</p>
                    <p className="text-lg font-bold text-primary">{entry.max_weight_kg} kg</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <p className="text-xs text-muted-foreground mb-1">Max Reps</p>
                    <p className="text-lg font-bold text-foreground">{entry.max_reps}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <p className="text-xs text-muted-foreground mb-1">Total Volume</p>
                    <p className="text-lg font-bold text-foreground">{entry.total_volume_kg} kg</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <p className="text-xs text-muted-foreground mb-1">Total Sets</p>
                    <p className="text-lg font-bold text-foreground">{entry.total_sets}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Progress Data</h3>
            <p className="text-muted-foreground text-sm">
              Complete some workouts to see your progress for this exercise
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

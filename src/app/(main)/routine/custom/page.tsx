'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { createRoutine } from '@/lib/firestore';
import type { Routine } from '@/lib/types/workout';
import { ChevronLeft, Plus, Minus, Check, Timer, Flame, ChevronRight } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  category: string;
  image: string;
}

interface SetData {
  weight: number;
  reps: number;
}

interface RoutineExercise {
  id: number;
  name: string;
  category: string;
  image: string;
  sets: SetData[];
  breakSeconds: number;
  warmup: boolean;
}

export default function CustomRoutinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([]);
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [saving, setSaving] = useState(false);

  const exercises: Exercise[] = [
    { id: 1, name: 'Warm Up', category: 'Full Body', image: '🔥' },
    { id: 2, name: 'Bent Over Row (Barbell)', category: 'Upper Back', image: '🏋️' },
    { id: 3, name: 'Straight Arm Lat Pulldown (Cable)', category: 'Lats', image: '💪' },
    { id: 4, name: 'Deadlift (Barbell)', category: 'Glutes', image: '🏋️' },
    { id: 5, name: 'Rear Delt Reverse Fly (Machine)', category: 'Shoulders', image: '🎯' },
    { id: 6, name: 'Squat (Barbell)', category: 'Quadriceps', image: '🦵' },
    { id: 7, name: 'Bench Press (Barbell)', category: 'Chest', image: '💪' },
    { id: 8, name: 'Pull Up', category: 'Back', image: '🔝' },
    { id: 9, name: 'Shoulder Press (Dumbbell)', category: 'Shoulders', image: '🏋️' },
    { id: 10, name: 'Bicep Curl (Dumbbell)', category: 'Biceps', image: '💪' },
  ];

  const toggleExercise = (exercise: Exercise) => {
    const exists = selectedExercises.some(e => e.id === exercise.id);
    if (exists) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([
        ...selectedExercises,
        {
          ...exercise,
          sets: [{ weight: 0, reps: 10 }],
          breakSeconds: 60,
          warmup: false,
        },
      ]);
    }
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    setSelectedExercises(prev => prev.map((ex, i) =>
      i === exIdx
        ? {
            ...ex,
            sets: ex.sets.map((set, j) =>
              j === setIdx ? { ...set, [field]: value } : set
            ),
          }
        : ex
    ));
  };

  const addSet = (exIdx: number) => {
    setSelectedExercises(prev => prev.map((ex, i) =>
      i === exIdx ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 10 }] } : ex
    ));
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setSelectedExercises(prev => prev.map((ex, i) =>
      i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex
    ));
  };

  const updateBreak = (exIdx: number, value: number) => {
    setSelectedExercises(prev => prev.map((ex, i) =>
      i === exIdx ? { ...ex, breakSeconds: value } : ex
    ));
  };

  const toggleWarmup = (exIdx: number) => {
    setSelectedExercises(prev => prev.map((ex, i) =>
      i === exIdx ? { ...ex, warmup: !ex.warmup } : ex
    ));
  };

  const handleNext = () => setStep('configure');
  const handleBack = () => setStep('select');

  const handleSave = async () => {
    if (!user?.uid) {
      console.error('User not authenticated');
      return;
    }

    setSaving(true);

    const newRoutine: Omit<Routine, 'id' | 'created_at' | 'updated_at'> = {
      name: 'Custom Routine',
      type: 'custom',
      description: `Custom routine with ${selectedExercises.length} exercises`,
      is_favorite: false,
      favorite_count: 0,
      exercises: selectedExercises.map(ex => ({
        id: ex.id.toString(),
        name: ex.name,
        category: ex.category,
        sets: ex.sets.map(set => ({
          weight_kg: set.weight,
          reps: set.reps,
          completed: false,
          saved_at: new Date()
        })),
        break_seconds: ex.breakSeconds,
        is_warmup: ex.warmup
      }))
    };

    try {
      await createRoutine(user.uid, newRoutine);
      router.push('/routine/explore');
    } catch (error) {
      console.error('Failed to save routine:', error);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="page-header flex items-center gap-4">
        <button 
          onClick={() => step === 'configure' ? handleBack() : router.back()} 
          className="icon-btn w-10 h-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title flex-1 text-center pr-10">
          {step === 'select' ? 'Select Exercises' : 'Configure Sets'}
        </h1>
      </header>

      <main className="flex-1 p-6">
        {step === 'select' && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-1 rounded-full bg-primary" />
              <div className="flex-1 h-1 rounded-full bg-[rgba(255,255,255,0.1)]" />
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Select exercises to add to your routine ({selectedExercises.length} selected)
            </p>

            <div className="space-y-2 stagger-children">
              {exercises.map(exercise => {
                const isSelected = selectedExercises.some(e => e.id === exercise.id);
                return (
                  <button
                    key={exercise.id}
                    onClick={() => toggleExercise(exercise)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      isSelected 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-2xl">
                      {exercise.image}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-foreground">{exercise.name}</h3>
                      <p className="text-muted-foreground text-sm">{exercise.category}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-primary text-white' 
                        : 'bg-[rgba(255,255,255,0.05)] text-transparent'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedExercises.length > 0 && (
              <div className="sticky bottom-24 pt-4">
                <Button onClick={handleNext} className="w-full" size="lg">
                  Next: Configure Sets
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'configure' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-1 rounded-full bg-primary" />
              <div className="flex-1 h-1 rounded-full bg-primary" />
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Configure sets, weights, and rest times for each exercise
            </p>

            <div className="space-y-4 stagger-children">
              {selectedExercises.map((exercise, exIdx) => (
                <Card key={exercise.id}>
                  {/* Exercise Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-xl">
                      {exercise.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                      <p className="text-muted-foreground text-xs">{exercise.category}</p>
                    </div>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2 mb-4">
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2 p-2 rounded-lg bg-[rgba(255,255,255,0.03)]">
                        <span className="text-xs text-muted-foreground w-12">Set {setIdx + 1}</span>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={e => updateSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                          className="w-20 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground text-center text-sm focus:border-primary focus:outline-none"
                          placeholder="kg"
                        />
                        <span className="text-muted-foreground text-xs">kg</span>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={e => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                          className="w-16 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground text-center text-sm focus:border-primary focus:outline-none"
                          placeholder="reps"
                        />
                        <span className="text-muted-foreground text-xs">reps</span>
                        <button
                          onClick={() => removeSet(exIdx, setIdx)}
                          disabled={exercise.sets.length === 1}
                          className="icon-btn w-8 h-8 ml-auto disabled:opacity-30"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => addSet(exIdx)}
                    className="w-full mb-4"
                  >
                    <Plus className="w-4 h-4" />
                    Add Set
                  </Button>

                  {/* Break & Warmup */}
                  <div className="flex items-center gap-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                    <div className="flex items-center gap-2 flex-1">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Rest:</span>
                      <input
                        type="number"
                        value={exercise.breakSeconds}
                        onChange={e => updateBreak(exIdx, Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground text-center text-sm focus:border-primary focus:outline-none"
                      />
                      <span className="text-sm text-muted-foreground">sec</span>
                    </div>
                    <button
                      onClick={() => toggleWarmup(exIdx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        exercise.warmup 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                          : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-muted-foreground'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      <span className="text-sm">Warmup</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-24 pt-4 flex gap-3">
              <Button 
                variant="secondary" 
                onClick={handleBack} 
                className="flex-1"
                size="lg"
              >
                Back
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex-1"
                size="lg"
              >
                {saving ? (
                  <span className="loading-spinner" />
                ) : (
                  <>
                    Save Routine
                    <Check className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

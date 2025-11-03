'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { createRoutine } from '@/lib/firestore';
import type { Routine } from '@/lib/types/workout';

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

  // Hardcoded exercises (should be fetched or imported in real app)
  const exercises: Exercise[] = [
    { id: 1, name: 'Warm Up', category: 'Full Body', image: '💪' },
    { id: 2, name: 'Bent Over Row (Barbell)', category: 'Upper Back', image: '🏋️' },
    { id: 3, name: 'Straight Arm Lat Pulldown (Cable)', category: 'Lats', image: '💪' },
    { id: 4, name: 'Deadlift (Barbell)', category: 'Glutes', image: '🏋️' },
    { id: 5, name: 'Rear Delt Reverse Fly (Machine)', category: 'Shoulders', image: '🏋️' },
    { id: 6, name: 'Squat (Barbell)', category: 'Quadriceps', image: '🏋️' },
    { id: 7, name: 'Bench Press (Barbell)', category: 'Chest', image: '🏋️' },
    { id: 8, name: 'Pull Up', category: 'Back', image: '💪' },
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

    const newRoutine: Omit<Routine, 'id' | 'created_at' | 'updated_at'> = {
      name: 'Custom Routine', // TODO: Add input for name
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
      // TODO: Show error toast
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="relative flex items-center justify-between p-4 border-b bg-white">
        <button onClick={() => router.back()} className="text-cyan-500 font-medium">Back</button>
        <h1 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">Custom Routine</h1>
        <span className="opacity-0">Back</span>
      </div>
      <div className="flex-1 p-4 pb-32">
        {step === 'select' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Select Exercises</h2>
            <div className="space-y-3">
              {exercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => toggleExercise(exercise)}
                  className={`w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border ${selectedExercises.some(e => e.id === exercise.id) ? 'border-cyan-500 bg-cyan-50' : 'border-transparent'}`}
                >
                  <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    {exercise.image}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900 text-base">{exercise.name}</h3>
                    <p className="text-gray-500 text-sm">{exercise.category}</p>
                  </div>
                  {selectedExercises.some(e => e.id === exercise.id) && (
                    <span className="text-cyan-500 font-bold">Selected</span>
                  )}
                </button>
              ))}
            </div>
            {selectedExercises.length > 0 && (
              <Button onClick={handleNext} className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-xl text-base font-semibold">
                Next: Configure Sets
              </Button>
            )}
          </>
        )}
        {step === 'configure' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Configure Sets, Weights, Breaks</h2>
            <div className="space-y-8">
              {selectedExercises.map((exercise, exIdx) => (
                <div key={exercise.id} className="bg-gray-50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-2xl">{exercise.image}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{exercise.name}</div>
                      <div className="text-gray-500 text-xs">{exercise.category}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">Set {setIdx + 1}</span>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={e => updateSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded border border-gray-300 text-sm"
                          placeholder="Weight (kg)"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={e => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded border border-gray-300 text-sm"
                          placeholder="Reps"
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeSet(exIdx, setIdx)} disabled={exercise.sets.length === 1}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => addSet(exIdx)} className="mt-2">+ Add Set</Button>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <label className="text-sm text-gray-600">Break (sec):</label>
                    <input
                      type="number"
                      value={exercise.breakSeconds}
                      onChange={e => updateBreak(exIdx, Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded border border-gray-300 text-sm"
                    />
                    <label className="flex items-center gap-2 ml-4 text-sm">
                      <input
                        type="checkbox"
                        checked={exercise.warmup}
                        onChange={() => toggleWarmup(exIdx)}
                        className="accent-cyan-500"
                      />
                      Warmup
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <Button onClick={handleBack} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-medium">Back</Button>
              <Button onClick={handleSave} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-medium">Save Routine</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

'use client'
import { useState, useMemo } from 'react';
import { Search, Check, ChevronLeft, Dumbbell, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useGlobalExercises } from '@/hooks/use-global-exercises';
import type { GlobalExercise } from '@/lib/types/schema';

interface Exercise {
  id: number | string; // Can be number (fallback) or string (exerciseId)
  name: string;
  category: string;
  image: string;
  exerciseId?: string; // Store exerciseId for global exercises
}

// Fallback exercises (used when global_exercises collection is empty or fails)
const FALLBACK_EXERCISES: Exercise[] = [
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

// Helper to convert GlobalExercise to Exercise format
function globalExerciseToExercise(ge: GlobalExercise, index: number): Exercise {
  // Map primary muscle to category for display
  const categoryMap: Record<string, string> = {
    'Chest': 'Chest',
    'Back': 'Back',
    'Shoulders': 'Shoulders',
    'Legs': 'Legs',
    'Arms': 'Arms',
    'Biceps': 'Biceps',
    'Triceps': 'Triceps',
    'Quadriceps': 'Quadriceps',
    'Hamstrings': 'Hamstrings',
    'Glutes': 'Glutes',
    'Calves': 'Calves',
    'Core': 'Core',
    'Lats': 'Lats',
    'Upper Back': 'Upper Back',
  };
  
  // Get emoji based on equipment or muscle group
  const getEmoji = (equipment: string, primaryMuscle: string): string => {
    if (equipment.includes('Barbell')) return '🏋️';
    if (equipment.includes('Dumbbell')) return '💪';
    if (equipment.includes('Cable') || equipment.includes('Machine')) return '🎯';
    if (primaryMuscle.includes('Chest')) return '💪';
    if (primaryMuscle.includes('Leg')) return '🦵';
    if (primaryMuscle.includes('Back')) return '🔝';
    return '🏋️';
  };

  return {
    id: ge.exerciseId,
    exerciseId: ge.exerciseId,
    name: ge.name,
    category: categoryMap[ge.primaryMuscle] || ge.primaryMuscle,
    image: getEmoji(ge.equipment, ge.primaryMuscle),
  };
}

export default function ExercisesListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'equipment' | 'muscles' | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  
  // Fetch global exercises
  const { data: globalExercises = [], isLoading } = useGlobalExercises();
  
  // Transform global exercises or use fallback
  const exercises: Exercise[] = useMemo(() => {
    if (globalExercises.length > 0) {
      return globalExercises.map(globalExerciseToExercise);
    }
    // Fallback to hardcoded exercises if global_exercises is empty
    return FALLBACK_EXERCISES;
  }, [globalExercises]);

  const filteredExercises = useMemo(() => {
    let filtered = exercises;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // TODO: Add equipment and muscle group filters when needed
    // For now, filter buttons are UI-only
    
    return filtered;
  }, [exercises, searchQuery]);

  const toggleExerciseSelection = (exercise: Exercise) => {
    const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
    
    if (isSelected) {
      setSelectedExercises(selectedExercises.filter(ex => ex.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const isExerciseSelected = (exerciseId: number) => {
    return selectedExercises.some(ex => ex.id === exerciseId);
  };

  const handleAddExercises = () => {
    const existingExercises = localStorage.getItem('routineExercises');
    const currentExercises = existingExercises ? JSON.parse(existingExercises) : [];
    
    const updatedExercises = [...currentExercises, ...selectedExercises];
    localStorage.setItem('routineExercises', JSON.stringify(updatedExercises));
    
    router.push('/routine');
  };

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
        <h1 className="page-title flex-1 text-center pr-10">Add Exercise</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 animate-fade-in-up">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-4">
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelectedFilter(selectedFilter === 'equipment' ? null : 'equipment')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all duration-300 ${
              selectedFilter === 'equipment'
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-muted-foreground hover:bg-[rgba(255,255,255,0.06)]'
            }`}
          >
            <Filter className="w-4 h-4" />
            All Equipment
          </button>
          <button
            onClick={() => setSelectedFilter(selectedFilter === 'muscles' ? null : 'muscles')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all duration-300 ${
              selectedFilter === 'muscles'
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-muted-foreground hover:bg-[rgba(255,255,255,0.06)]'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            All Muscles
          </button>
        </div>

        {/* Recent Exercises Label */}
        <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4" />
          Recent Exercises
        </h2>

        {/* Exercise List */}
        <div className="space-y-2 stagger-children">
          {filteredExercises.map((exercise) => {
            const isSelected = isExerciseSelected(exercise.id);
            return (
              <button
                key={exercise.id}
                onClick={() => toggleExerciseSelection(exercise)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  isSelected 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                {/* Exercise Icon */}
                <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-2xl shrink-0">
                  {exercise.image}
                </div>

                {/* Exercise Info */}
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-foreground">{exercise.name}</h3>
                  <p className="text-muted-foreground text-sm">{exercise.category}</p>
                </div>

                {/* Check Icon */}
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

        {/* Empty State */}
        {filteredExercises.length === 0 && (
          <div className="glass-card p-8 text-center mt-8">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
            <p className="text-muted-foreground text-sm">
              Try a different search term
            </p>
          </div>
        )}
          </>
        )}
      </main>

      {/* Add Exercise Button */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 p-4">
          <Button
            onClick={handleAddExercises}
            className="w-full max-w-lg mx-auto block"
            size="lg"
          >
            Add {selectedExercises.length} Exercise{selectedExercises.length > 1 ? 's' : ''}
            <Check className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

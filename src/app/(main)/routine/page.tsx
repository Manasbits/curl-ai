'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Plus, Trash2, Home, TrendingUp, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Exercise {
  id: number;
  name: string;
  type: 'Reps' | 'Sets';
  category?: string;
}

export default function PlanRoutinePage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Load exercises from localStorage on mount and when returning to page
  useEffect(() => {
    const loadExercises = () => {
      const storedExercises = localStorage.getItem('routineExercises');
      if (storedExercises) {
        const parsed = JSON.parse(storedExercises);
        const formattedExercises = parsed.map((ex: Partial<Exercise>, index: number) => ({
          id: Date.now() + index, // Generate unique IDs
          name: ex.name ?? '',
          type: 'Reps' as const,
          category: ex.category
        }));
        setExercises(formattedExercises);
        // Clear the storage after loading
        localStorage.removeItem('routineExercises');
      }
    };

    loadExercises();

    // Listen for storage events (when localStorage is updated)
    window.addEventListener('storage', loadExercises);
    
    // Also check when window gains focus (user returns to page)
    window.addEventListener('focus', loadExercises);

    return () => {
      window.removeEventListener('storage', loadExercises);
      window.removeEventListener('focus', loadExercises);
    };
  }, []);

  const addExercise = () => {
    // Navigate to exercises list page
    router.push('/exercises_list');
  };

  const startWorkout = () => {
    // Save exercises to localStorage for workout log
    if (exercises.length > 0) {
      localStorage.setItem('workoutExercises', JSON.stringify(exercises));
      // Navigate to workout log page
      router.push('/workout_log');
    } else {
      alert('Please add exercises before starting workout');
    }
  };

  const removeExercise = (id: number) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const toggleType = (id: number) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, type: ex.type === 'Reps' ? 'Sets' : 'Reps' } : ex
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="relative flex items-center justify-center p-4 border-b bg-white shadow-sm py-8 drop-shadow-xl">
        <h1 className="text-lg font-medium">Routine</h1>
        <Clock className="absolute right-4 w-5 h-5 text-gray-700" />
      </div>

      {/* Content */}
      <div className="flex-1 p-5 pb-32 py-16">
        <h2 className="text-3xl mb-5 font-semibold text-gray-900 font-sans">Plan a Routine.</h2>

        {/* AI Generate Button */}
        <Button className="w-full bg-[#1F2937] hover:bg-[#5179cd] text-white py-4 rounded-xl mb-4 flex items-center justify-center gap-2 text-base font-medium">
          Generate AI Routine
          <Sparkles className="w-5 h-5 text-blue-400" />
        </Button>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['Muscle', 'Time', 'Mood', 'Equipment'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 whitespace-nowrap hover:bg-gray-50"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Text Input */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <textarea
              placeholder="Ask Curl to Generate your Routine..."
              className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none border-none outline-none min-h-[60px]"
            />
            <div className="flex gap-3 mt-2">
              <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-400">
                <Plus className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 text-gray-400 text-sm">
                <span>📎</span>
                <span className="text-xs">Attach</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <hr className="border-gray-300 mb-6" />

        {/* Exercise List */}
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <div key={exercise.id} className="mb-4 flex items-center gap-3">
              <div className="flex-1">
                <span className="text-cyan-500 font-semibold text-sm">{exercise.name}</span>
                {exercise.category && (
                  <p className="text-gray-400 text-xs mt-1">{exercise.category}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleType(exercise.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                    exercise.type === 'Reps' 
                      ? 'bg-[#1F2937] text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Reps
                </button>
                <button
                  onClick={() => toggleType(exercise.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                    exercise.type === 'Sets' 
                      ? 'bg-[#1F2937] text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Sets
                </button>
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center my-4">No exercises added yet</p>
        )}

        {/* Add Exercise Section */}
        <div className="text-center my-6">
          <p className="text-gray-400 text-sm mb-4">Add an exercise to start your workout</p>
          <Button
            onClick={addExercise}
            className="w-full bg-[#1F2937] hover:bg-[#111827] text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </Button>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex gap-3 mb-4">
          <Button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-medium">
            Settings
          </Button>
          <Button className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-3 rounded-xl font-medium">
            Discard Workout
          </Button>
        </div>

        <Button 
          onClick={startWorkout}
          className="w-full bg-cyan-400 hover:bg-cyan-500 text-white py-4 rounded-xl text-base font-semibold"
        >
          Start Workout
        </Button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1F2937] text-white flex justify-around py-3 shadow-lg">
        <button className="flex flex-col items-center gap-1">
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs">Activity</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bot className="w-5 h-5" />
          <span className="text-xs">AI</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <User className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </button>
      </nav>
    </div>
  );
}
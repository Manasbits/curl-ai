'use client'
import { useState } from 'react';
import { Search, Home, TrendingUp, Bot, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: number;
  name: string;
  category: string;
  image: string;
}

export default function ExercisesListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'equipment' | 'muscles' | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

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

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    // Store selected exercises in localStorage temporarily
    const existingExercises = localStorage.getItem('routineExercises');
    const currentExercises = existingExercises ? JSON.parse(existingExercises) : [];
    
    // Add new exercises to the list
    const updatedExercises = [...currentExercises, ...selectedExercises];
    localStorage.setItem('routineExercises', JSON.stringify(updatedExercises));
    
    // Navigate back to routine page
    router.push('/main/routine');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b bg-white">
        <button 
          onClick={() => router.back()}
          className="text-cyan-500 font-medium"
        >
          Cancel
        </button>
        <h1 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">
          Add Exercise
        </h1>
        <button className="text-cyan-500 font-medium opacity-0">
          Create
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-32">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search exercise"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelectedFilter(selectedFilter === 'equipment' ? null : 'equipment')}
            className={`flex-1 py-2 rounded-lg font-medium text-sm ${
              selectedFilter === 'equipment'
                ? 'bg-[#1F2937] text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Equipment
          </button>
          <button
            onClick={() => setSelectedFilter(selectedFilter === 'muscles' ? null : 'muscles')}
            className={`flex-1 py-2 rounded-lg font-medium text-sm ${
              selectedFilter === 'muscles'
                ? 'bg-[#1F2937] text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Muscles
          </button>
        </div>

        {/* Recent Exercises */}
        <h2 className="text-gray-500 text-sm font-medium mb-4">Recent Exercises</h2>

        {/* Exercise List */}
        <div className="space-y-3">
          {filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => toggleExerciseSelection(exercise)}
              className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* Exercise Icon/Image */}
              <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                {exercise.image}
              </div>

              {/* Exercise Info */}
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900 text-base">
                  {exercise.name}
                </h3>
                <p className="text-gray-500 text-sm">{exercise.category}</p>
              </div>

              {/* Check Icon */}
              <div className={`w-8 h-8 border-2 rounded-full flex items-center justify-center flex-shrink-0 ${
                isExerciseSelected(exercise.id)
                  ? 'bg-cyan-500 border-cyan-500'
                  : 'border-gray-300'
              }`}>
                {isExerciseSelected(exercise.id) && (
                  <Check className="w-5 h-5 text-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Exercise Button - Shows when exercises are selected */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <Button
            onClick={handleAddExercises}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-xl text-base font-semibold"
          >
            Add {selectedExercises.length} Exercise{selectedExercises.length > 1 ? 's' : ''}
          </Button>
        </div>
      )}

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
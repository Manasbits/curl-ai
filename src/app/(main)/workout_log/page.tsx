'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Clock, Home, TrendingUp, Bot, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExerciseSet {
  id: number;
  previous: string;
  kg: number;
  reps: number;
  time?: number;
  completed: boolean;
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

export default function WorkoutLogPage() {
  const router = useRouter();
  const [workoutStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  // Load exercises and initialize workout data
  useEffect(() => {
    const storedExercises = localStorage.getItem('workoutExercises');
    if (storedExercises) {
      const parsed = JSON.parse(storedExercises);
      const workoutExercises = parsed.map((ex: any, index: number) => ({
        id: index + 1,
        name: ex.name,
        type: ex.type || 'Reps',
        category: ex.category,
        description: 'Description...',
        timeElapsed: 0,
        sets: [
          { id: 1, previous: '20kg x 15', kg: 20, reps: 20, completed: false },
          { id: 2, previous: '25kg x 15', kg: 30, reps: 15, completed: false },
          { id: 3, previous: '30kg x 15', kg: 35, reps: 15, completed: false },
          { id: 4, previous: '40kg x 15', kg: 40, reps: 15, completed: false },
        ]
      }));
      setExercises(workoutExercises);
    }
  }, []);

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
    return `${hours}h ${minutes}min ${seconds}s`;
  };

  const toggleSetCompletion = (exerciseId: number, setId: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => 
            set.id === setId ? { ...set, completed: !set.completed } : set
          )
        };
      }
      return ex;
    }));
  };

  const getTotalVolume = () => {
    let total = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          total += set.kg * set.reps;
        }
      });
    });
    return total;
  };

  const getTotalSets = () => {
    let total = 0;
    exercises.forEach(ex => {
      total += ex.sets.filter(set => set.completed).length;
    });
    return total;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronDown className="w-5 h-5" />
            <h1 className="text-lg font-semibold">Workout Log</h1>
          </div>
          <div className="flex gap-2">
            <Button className="bg-[#1F2937] hover:bg-[#111827] text-white px-4 py-2 rounded-lg text-sm">
              AI Fix
            </Button>
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Finish
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-1">Duration</p>
            <p className="text-cyan-500 font-medium">{formatDuration()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Volume</p>
            <p className="font-medium">{getTotalVolume()} kg</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Sets</p>
            <p className="font-medium">{getTotalSets()}</p>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 px-4 py-4 pb-24 space-y-4">
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="bg-white rounded-2xl shadow-sm p-4">
            {/* Exercise Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-cyan-500 font-semibold">
                    {exercise.name} ({exercise.type})
                  </h3>
                  {exerciseIndex > 0 && (
                    <span className="bg-[#1F2937] text-white text-xs px-2 py-1 rounded">
                      AI Fix
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1">{exercise.description}</p>
                <div className="flex items-center gap-1 text-cyan-500 text-sm mt-2">
                  <Clock className="w-4 h-4" />
                  <span>Time Elapsed: 2min 30s</span>
                </div>
              </div>
            </div>

            {/* Sets Table */}
            <div className="mt-4">
              {/* Table Header */}
              <div className="grid grid-cols-[50px_100px_70px_70px_50px] gap-2 pb-2 border-b text-xs font-medium text-gray-600">
                <div>Set</div>
                <div>Previous</div>
                <div>KG</div>
                <div>{exercise.type === 'Time' ? 'Time (s)' : 'Reps'}</div>
                <div></div>
              </div>

              {/* Table Rows */}
              {exercise.sets.map((set, index) => (
                <div
                  key={set.id}
                  className="grid grid-cols-[50px_100px_70px_70px_50px] gap-2 py-3 border-b last:border-b-0 items-center text-sm"
                >
                  {/* Set Number */}
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <div className="w-1 h-6 bg-yellow-400 rounded"></div>
                    )}
                    <span className={index === 0 ? 'text-yellow-500 font-bold' : 'font-medium'}>
                      {index === 0 ? 'W' : index}
                    </span>
                  </div>

                  {/* Previous */}
                  <div className="text-gray-600 text-xs">{set.previous}</div>

                  {/* KG */}
                  <div className="text-center">
                    <input
                      type="number"
                      value={set.kg}
                      onChange={(e) => {
                        const newExercises = [...exercises];
                        newExercises[exerciseIndex].sets[index].kg = Number(e.target.value);
                        setExercises(newExercises);
                      }}
                      className="w-full text-center border-none outline-none bg-transparent"
                    />
                  </div>

                  {/* Reps/Time */}
                  <div className="text-center">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => {
                        const newExercises = [...exercises];
                        newExercises[exerciseIndex].sets[index].reps = Number(e.target.value);
                        setExercises(newExercises);
                      }}
                      className="w-full text-center border-none outline-none bg-transparent"
                    />
                  </div>

                  {/* Checkbox */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleSetCompletion(exercise.id, set.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        set.completed
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {set.completed && <Check className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
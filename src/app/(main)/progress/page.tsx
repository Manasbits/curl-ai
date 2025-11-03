'use client'
import { useAuth } from '@/context/auth-context';
import { useExerciseProgress } from '@/hooks/use-exercise-progress';
import { useState } from 'react';

export default function ProgressPage() {
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [exerciseName, setExerciseName] = useState('Bench Press (Barbell)');
  const [range, setRange] = useState(30); // days
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data, isLoading, isError } = useExerciseProgress(userId, exerciseName, startDate, endDate);

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6">Progress Tracking</h1>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Exercise</label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={exerciseName}
          onChange={e => setExerciseName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Time Range (days)</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={range}
          onChange={e => setRange(Number(e.target.value))}
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div className="text-red-500">Error loading progress.</div>
      ) : data && data.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-2">Progress Data</h2>
          <ul className="space-y-2">
            {data.map((entry, idx) => (
              <li key={idx} className="bg-gray-50 rounded p-3">
                <div>Date: {entry.date}</div>
                <div>Max Weight: {entry.max_weight_kg} kg</div>
                <div>Max Reps: {entry.max_reps}</div>
                <div>Total Volume: {entry.total_volume_kg} kg</div>
                <div>Total Sets: {entry.total_sets}</div>
                <div>Workouts: {entry.workouts_count}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>No progress data found for this exercise and range.</div>
      )}
    </div>
  );
}

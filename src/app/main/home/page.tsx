'use client'
import { useState } from 'react';
import { RefreshCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WorkoutPage() {
  const [pinnedWorkouts] = useState([
    {
      title: 'Push',
      description: 'Warm up, Bench press(Barbell), Incline Bench Press (Dumbell), Incline...'
    }
  ]);

  const [history] = useState([
    {
      date: '13/02/2025',
      description: 'Warm up, Bent Over Row (Barbell), Lat Pulldown (Cable), Bicep Curl (Dumbell)...'
    }
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] py-10 drop-shadow-black">
      {/* Header */}
      <div className="relative flex items-center p-4 border-b bg-white shadow-sm drop-shadow-black">
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-sans font-regular">
        Workout
      </h1>
      <RefreshCcw className="ml-auto w-5 h-5 text-gray-600" />
    </div>

      {/* Quick Start Section */}
      <div className="p-6">
        <h2 className="text-3xl mb-4 font-sans font-semibold">Quick Start.</h2>
        <div className="flex flex-col gap-3 mb-6">
          <Button className="bg-[#111827] text-[#CCCCCC] py-3 text-base rounded-lg font-sans font-semibold ">Plan a Workout</Button>
          <Button className="bg-[#111827] text-[#CCCCCC] py-3 text-base rounded-lg font-sans font-semibold">Explore Workouts</Button>
        </div>

        {/* Pinned Workouts */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2 w-full">
            <span className="text-sm font-semibold text-[#111827] font-sans">
              Pinned Workouts
            </span>
            <Star className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </div>
          {pinnedWorkouts.map((workout, index) => (
            <Card key={index} className="mb-4 shadow-sm drop-shadow-2xl">
              <CardContent className="p-4">
                <h3 className="text-lg mb-1 font-sans font-bold">{workout.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{workout.description}</p>
                <Button className="bg-blue-600 text-white w-full py-2 rounded-lg">
                  Start Routine
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>



        {/* History */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm font-sans font-semibold text-[#111827]">History</span>
          </div>
          {history.map((item, index) => (
            <Card key={index} className="mb-4 mb-4 shadow-sm drop-shadow-2xl ">
              <CardContent className="p-4">
                <h3 className="text-lg mb-1 font-sans font-bold">{item.date}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{item.description}</p>
                <Button className="bg-blue-600 text-white w-full py-2 rounded-lg">View Routine</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black text-white flex justify-around py-3">
        <button className="flex flex-col items-center text-xs">
          <span>🏠</span>
          <span>Home</span>
        </button>
        <button className="flex flex-col items-center text-xs">
          <span>📊</span>
          <span>Activity</span>
        </button>
        <button className="flex flex-col items-center text-xs">
          <span>🤖</span>
          <span>AI</span>
        </button>
        <button className="flex flex-col items-center text-xs">
          <span>👤</span>
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

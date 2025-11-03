import React from 'react';
import { Sparkles, Plus, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AIRoutineOption() {
  return (
    <Card className="mb-4 shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="bg-blue-100 rounded-full p-3">
          <Sparkles className="w-7 h-7 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">AI Generated Routine</div>
          <div className="text-gray-500 text-sm">Coming soon</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomRoutineOption({ onClick }: { onClick: () => void }) {
  return (
    <Card className="mb-4 shadow-sm cursor-pointer hover:shadow-md transition" onClick={onClick}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="bg-cyan-100 rounded-full p-3">
          <Plus className="w-7 h-7 text-cyan-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">Create Custom Routine</div>
          <div className="text-gray-500 text-sm">Add exercises, sets, reps, and weights</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExploreRoutinesOption({ onClick }: { onClick: () => void }) {
  return (
    <Card className="mb-4 shadow-sm cursor-pointer hover:shadow-md transition" onClick={onClick}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="bg-yellow-100 rounded-full p-3">
          <Star className="w-7 h-7 text-yellow-500" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">Explore Existing Routines</div>
          <div className="text-gray-500 text-sm">Push/Pull/Legs & your favorites</div>
        </div>
      </CardContent>
    </Card>
  );
}

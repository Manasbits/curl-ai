'use client'

import { useRouter } from 'next/navigation';
import { AIRoutineOption, CustomRoutineOption, ExploreRoutinesOption } from '@/components/ui/routine-options';
import { ChevronLeft, Sparkles } from 'lucide-react';

export default function PlanRoutinePage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="page-header flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="icon-btn w-10 h-10"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title flex-1 text-center pr-10">Routine</h1>
      </header>

      {/* Main Options */}
      <div className="flex-1 p-6">
        <div className="max-w-lg mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 mb-4 shadow-lg animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Path
            </h2>
            <p className="text-muted-foreground">
              Create the perfect workout routine for your goals
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4 stagger-children">
            <AIRoutineOption />
            <CustomRoutineOption onClick={() => router.push('/routine/custom')} />
            <ExploreRoutinesOption onClick={() => router.push('/routine/explore')} />
          </div>
        </div>
      </div>
    </div>
  );
}

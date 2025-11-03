'use client'

import { useRouter } from 'next/navigation';
import { AIRoutineOption, CustomRoutineOption, ExploreRoutinesOption } from '@/components/ui/routine-options';


export default function PlanRoutinePage() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="relative flex items-center justify-center p-4 border-b bg-white shadow-sm py-8 drop-shadow-xl">
        <h1 className="text-lg font-medium">Routine</h1>
      </div>

      {/* Main Options */}
      <div className="flex-1 p-5 pb-32 py-16 max-w-lg mx-auto w-full">
        <h2 className="text-3xl mb-8 font-semibold text-gray-900 font-sans text-center">Choose a Routine Option</h2>
        <AIRoutineOption />
        <CustomRoutineOption onClick={() => router.push('/routine/custom')} />
        <ExploreRoutinesOption onClick={() => router.push('/routine/explore')} />
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { Sparkles, Plus, Compass, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OptionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
  disabled?: boolean;
}

function OptionCard({ icon, iconBg, title, description, badge, onClick, disabled }: OptionCardProps) {
  return (
    <Card 
      className={`cursor-pointer group ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            {badge && (
              <span className="badge text-xs">{badge}</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </Card>
  );
}

export function AIRoutineOption() {
  return (
    <OptionCard
      icon={<Sparkles className="w-7 h-7 text-purple-400" />}
      iconBg="bg-purple-500/20"
      title="AI Generated"
      description="Let AI create your perfect routine"
      badge="Coming Soon"
      disabled
    />
  );
}

export function CustomRoutineOption({ onClick }: { onClick: () => void }) {
  return (
    <OptionCard
      icon={<Plus className="w-7 h-7 text-primary" />}
      iconBg="bg-primary/20"
      title="Create Custom"
      description="Build your own workout routine"
      onClick={onClick}
    />
  );
}

export function ExploreRoutinesOption({ onClick }: { onClick: () => void }) {
  return (
    <OptionCard
      icon={<Compass className="w-7 h-7 text-amber-400" />}
      iconBg="bg-amber-500/20"
      title="Explore Routines"
      description="Push/Pull/Legs & community favorites"
      onClick={onClick}
    />
  );
}

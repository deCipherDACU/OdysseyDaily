'use client';

import type { DungeonCrawl } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

interface DungeonCrawlItemProps {
  dungeon: DungeonCrawl;
}

function DungeonCrawlItemComponent({ dungeon }: DungeonCrawlItemProps) {
  const completedChallenges = dungeon.challenges.filter(c => c.completed).length;
  const totalChallenges = dungeon.challenges.length;
  const progress = (completedChallenges / totalChallenges) * 100;

  return (
    <LiquidGlassCard className={cn("p-6 h-full flex flex-col", dungeon.completed && "bg-black/20 border-dashed border-white/20")}>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn("font-headline text-xl font-semibold text-white", dungeon.completed && "text-muted-foreground")}>{dungeon.title}</h3>
            <p className={cn("text-muted-foreground text-sm", dungeon.completed && "text-muted-foreground/60")}>{dungeon.description}</p>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < dungeon.difficulty ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50",
                  dungeon.completed && "text-muted-foreground/30 fill-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <div>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-semibold text-white">Progress</span>
            <span className="text-white">{completedChallenges} / {totalChallenges}</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>
    </LiquidGlassCard>
  );
}

export const DungeonCrawlItem = React.memo(DungeonCrawlItemComponent);

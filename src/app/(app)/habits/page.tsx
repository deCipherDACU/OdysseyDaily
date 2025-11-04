
'use client';

import PageHeader from "@/components/shared/PageHeader";
import { HabitTracker } from '@/components/habits/HabitTracker';
import { ChallengeHub } from '@/components/challenges/ChallengeHub';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Flame, Target } from "lucide-react";

export default function HabitsPage() {
  return (
    <>
      <PageHeader
        title="Habits & Challenges"
        description="Forge powerful routines and conquer long-term goals."
      />
      <Tabs defaultValue="habits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="habits">
            <Flame className="mr-2"/>
            Habits
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="mr-2"/>
            Challenges
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="habits">
          <HabitTracker />
        </TabsContent>
        
        <TabsContent value="challenges">
            <ChallengeHub />
        </TabsContent>
      </Tabs>
    </>
  );
}

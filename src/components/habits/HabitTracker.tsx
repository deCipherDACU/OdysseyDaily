
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Habit } from '@/lib/types';
import { CheckCircle2, Circle, Flame, Calendar, Plus, ChevronDown } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { CreateHabitDialog } from './CreateHabitDialog';
import { useCollection } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { habitsCollection, completeHabit } from '@/lib/firebase/firestore/habits';
import { useUser as useAppUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidGlassButton } from '../ui/LiquidGlassButton';

interface HabitTrackerProps {}

const HabitItem: React.FC<{ habit: Habit }> = ({ habit }) => {
    const { user } = useUser();
    const { db } = useFirestore();
    const { addXp, addCoins } = useAppUser();
    const { toast } = useToast();

    const today = format(new Date(), 'yyyy-MM-dd');
    const isCompleted = habit.completionHistory?.some(c => c.date === today && c.completed) || false;

    const handleCompleteHabit = async () => {
        if (!user || !db) return;
        const result = await completeHabit(db, user.uid, habit.id, today);
        if (result) {
          addXp(result.xpEarned);
          addCoins(result.coinEarned);
          toast({
            title: "Habit Completed!",
            description: `+${result.xpEarned} XP, +${result.coinEarned} Coins. Streak: ${result.newStreak} days.`
          })
        }
    };
    
    return (
        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
            <Button
                variant={isCompleted ? "default" : "outline"}
                size="icon"
                onClick={handleCompleteHabit}
                disabled={isCompleted}
                className="flex-shrink-0 h-10 w-10"
            >
                {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                ) : (
                    <Circle className="w-5 h-5" />
                )}
            </Button>
            <div className="flex-1">
                <h4 className="font-medium">{habit.title}</h4>
                <p className="text-sm text-muted-foreground">{habit.description}</p>
            </div>
            {(habit.streak || 0) > 0 && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                    <Flame className="w-3 h-3" />
                    <span>{habit.streak}</span>
                </Badge>
            )}
        </div>
    )
}

export const HabitTracker: React.FC<HabitTrackerProps> = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useUser();
  const { db } = useFirestore();
  const habitsRef = user ? habitsCollection(db, user.uid) : null;
  const { data: habits, isLoading } = useCollection<Habit>(habitsRef);

  const habitsByCategory = habits?.reduce((acc, habit) => {
    const category = habit.category || 'General';
    if (!acc[category]) {
        acc[category] = [];
    }
    acc[category].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>) || {};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary font-headline">Habit Dashboard</h2>
        <LiquidGlassButton onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </LiquidGlassButton>
      </div>

      {isLoading && <p>Loading habits...</p>}

      {!isLoading && habits && habits.length > 0 && (
        <div className="space-y-4">
          {Object.entries(habitsByCategory).map(([category, habitList]) => (
            <LiquidGlassCard key={category}>
                <CardHeader>
                    <CardTitle className="font-headline text-xl text-white">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-border">
                        {habitList.map(habit => <HabitItem key={habit.id} habit={habit} />)}
                    </div>
                </CardContent>
            </LiquidGlassCard>
          ))}
        </div>
      )}

      {!isLoading && (!habits || habits.length === 0) && (
        <LiquidGlassCard className="p-8 text-center border-dashed">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2 text-white">No habits yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
            Start building better habits to level up your character!
            </p>
            <LiquidGlassButton onClick={() => setShowCreateDialog(true)}>
            Create Your First Habit
            </LiquidGlassButton>
        </LiquidGlassCard>
      )}

      <CreateHabitDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};

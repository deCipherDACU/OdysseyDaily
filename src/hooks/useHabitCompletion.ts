
'use client';

import { useUser } from '@/context/UserContext';
import { RewardEngine } from '@/lib/services/rewardEngine';
import { useToast } from './use-toast';
import type { Habit, EnhancedCompletion } from '@/lib/types';
import { useHabits } from '@/context/OptimizedHabitsContext';

export const useHabitCompletion = () => {
  const { habits, completeHabit: updateHabitInContext } = useHabits();
  const { addXp, addCoins } = useUser();
  const { toast } = useToast();
  
  const completeHabitWithRewards = async (
    habitId: string,
    completionData: Partial<EnhancedCompletion>
  ) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        throw new Error("Habit not found");
      }

      // We are not using the RewardEngine for now, just the basic reward from the habit.
      const rewards = {
        totalXP: habit.xpReward,
        totalCoins: habit.coinReward,
      };
      
      // Update habit with completion in context/firebase
      // The context's `completeHabit` will handle the optimistic update and backend sync.
      if (completionData.date) {
        await updateHabitInContext(habitId, completionData.date);
      } else {
        throw new Error("Completion date is required");
      }

      // Apply rewards to character
      addXp(rewards.totalXP);
      addCoins(rewards.totalCoins);
      
      // Show reward notification
      toast({
          title: "Habit Completed!",
          description: `You earned ${rewards.totalXP} XP and ${rewards.totalCoins} coins.`,
          variant: "success",
      });
      
      return rewards;
    } catch (error) {
      console.error('Failed to complete habit with rewards:', error);
      toast({
          title: "Error",
          description: "Could not complete habit. Please try again.",
          variant: "destructive"
      });
      throw error;
    }
  };
  
  return { completeHabitWithRewards };
};

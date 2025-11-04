// src/context/OptimizedHabitsContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Habit, LifeArea, TaskDifficulty } from '@/lib/types/habits';
import { HabitTemplate, TemplateHabit } from '@/lib/types/templates';
import { OptimizedTemplateService } from '@/lib/services/optimizedTemplateService';
import { onSnapshot, query, orderBy, Firestore } from 'firebase/firestore';
import { habitsCollection, updateHabit as updateHabitInDb } from '@/lib/firebase/firestore/habits';
import { format, isSameDay } from 'date-fns';
import { useUser as useFirebaseUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';

interface OptimizedHabitsContextType {
  habits: Habit[];
  todayProgress: TodayProgress;
  loading: boolean;
  error: string | null;
  
  // Optimized operations
  createHabitsFromTemplate: (template: HabitTemplate) => Promise<TemplateResult>;
  completeHabit: (habitId: string, date: string) => Promise<void>;
  undoHabit: (habitId: string, date: string) => Promise<void>;
  bulkComplete: (habitIds: string[], date: string) => Promise<void>;
}

interface TodayProgress {
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  totalXPEarned: number;
  totalCoinsEarned: number;
  streaksMaintained: number;
}

interface TemplateResult {
  success: boolean;
  message: string;
  habitCount: number;
}

const OptimizedHabitsContext = createContext<OptimizedHabitsContextType | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(OptimizedHabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within OptimizedHabitsProvider');
  }
  return context;
};

export const OptimizedHabitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useFirebaseUser();
  const { db } = useFirestore();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimisticHabits, setOptimisticHabits] = useState<Habit[]>([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Combine real habits with optimistic updates
  const allHabits = React.useMemo(() => {
    const habitsMap = new Map(habits.map(h => [h.id, h]));
    
    // Apply optimistic updates
    optimisticHabits.forEach(oh => {
      habitsMap.set(oh.id, oh);
    });
    
    return Array.from(habitsMap.values());
  }, [habits, optimisticHabits]);

  // Calculate today's progress efficiently
  const todayProgress = React.useMemo((): TodayProgress => {
    const todayHabits = allHabits.filter(h => isHabitDueToday(h) && h.isActive);
    const completedToday = todayHabits.filter(h => {
      const completion = h.completionHistory?.find(c => c.date === today);
      return completion?.completed;
    });

    const totalXP = completedToday.reduce((sum, h) => {
      const completion = h.completionHistory?.find(c => c.date === today);
      return sum + (completion?.xpEarned || 0);
    }, 0);

    const totalCoins = completedToday.reduce((sum, h) => {
      const completion = h.completionHistory?.find(c => c.date === today);
      return sum + (completion?.coinEarned || 0);
    }, 0);

    return {
      totalHabits: todayHabits.length,
      completedHabits: completedToday.length,
      completionRate: todayHabits.length > 0 ? (completedToday.length / todayHabits.length) * 100 : 0,
      totalXPEarned: totalXP,
      totalCoinsEarned: totalCoins,
      streaksMaintained: completedToday.filter(h => (h.streak || 0) > 0).length
    };
  }, [allHabits, today]);

  // Optimized Firebase listener
  useEffect(() => {
    if (!user?.uid || !db) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const habitsQuery = query(
      habitsCollection(db as Firestore, user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      habitsQuery,
      (snapshot) => {
        try {
          const habitsData: Habit[] = [];
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            habitsData.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Habit);
          });
          
          setHabits(habitsData);
          setError(null);
          setLoading(false);
          
          // Clear optimistic updates that are now persisted
          setOptimisticHabits(prev => 
            prev.filter(oh => !habitsData.some(h => h.id === oh.id))
          );
          
        } catch (err) {
          console.error('Error processing habits:', err);
          setError('Failed to load habits');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to habits:', err);
        setError('Connection error');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid, db]);

  // Optimized template creation with immediate UI feedback
  const createHabitsFromTemplate = useCallback(async (template: HabitTemplate): Promise<TemplateResult> => {
    if (!user?.uid || !db) throw new Error('User not authenticated');

    // Show immediate optimistic update
    const tempHabits = template.habits.map((templateHabit, index) => {
      const difficultyMultiplier = getDifficultyMultiplier(template.difficulty);
      const baseXP = Math.round(templateHabit.baseXP * templateHabit.difficultyMultiplier * difficultyMultiplier);
      const baseCoins = Math.round(templateHabit.baseCoins * templateHabit.difficultyMultiplier * difficultyMultiplier);
      return ({
        id: `temp_${Date.now()}_${index}`,
        title: templateHabit.title,
        description: templateHabit.description || '',
        category: templateHabit.category,
        area: templateHabit.area,
        color: getAreaColor(templateHabit.area),
        icon: '🎯',
        
        // Tracking
        trackingType: templateHabit.trackingType,
        frequency: templateHabit.frequency,
        schedule: {
          type: templateHabit.frequency,
          targetValue: templateHabit.targetValue,
          allowPartialCompletion: true,
          timeWindows: []
        },
        
        // Rewards
        xpReward: baseXP,
        coinReward: baseCoins,
        
        // B=MAP Integration
        tinyVersion: templateHabit.tinyVersion,
        triggers: (templateHabit.triggers || []).map(trigger => ({
          type: 'context' as const,
          value: trigger,
          enabled: true
        })),
        barriers: templateHabit.barriers || [],
        
        // Template Integration
        templateId: template.id,
        templateStackOrder: index,
        
        // Reminders (simplified)
        reminders: (templateHabit.reminderSuggestions || []).slice(0, 2).map(suggestion => ({
          id: `rem-${Date.now()}-${Math.random()}`,
          type: suggestion.type,
          trigger: suggestion.value,
          message: suggestion.message,
          enabled: true,
          sticky: false,
          snoozeOptions: [15, 30, 60]
        })),
        
        // Grace Settings (optimized defaults)
        graceSettings: {
          enabled: true,
          graceDays: template.difficulty === 'beginner' ? 2 : 1,
          vacationMode: true,
          sickDayProtection: true,
          weekendGrace: templateHabit.frequency === 'daily',
          comebackBonus: true
        },
        
        // Autonomy Settings
        autonomySettings: {
          allowCustomization: true,
          userDefinedRewards: [],
          skipWithoutPenalty: template.difficulty === 'beginner',
          pauseOption: true
        },
        
        // Progress (initialize empty for speed)
        habitStrength: 0,
        streak: 0,
        longestStreak: 0,
        successRate: 0,
        priority: 3,
        difficulty: mapToDifficulty(template.difficulty),
        
        // State
        isActive: true,
        isPaused: false,
        vacationMode: false,
        
        // Empty arrays for initial creation
        completionHistory: [],
        notes: [],
        missReasons: {},
        bestDaysOfWeek: [],
        analytics: {
          totalCompletions: 0
        },
         createdAt: new Date(),
         updatedAt: new Date()
      }) as Habit;
    });

    // Add to optimistic state immediately
    setOptimisticHabits(prev => [...prev, ...tempHabits]);

    try {
      // Create habits in background
      const result = await OptimizedTemplateService.createHabitsFromTemplate(
        db as Firestore,
        template,
        user.uid
      );

      if (result.success) {
        // Remove temp habits, real ones will come from Firebase listener
        setOptimisticHabits(prev => 
          prev.filter(h => !h.id.startsWith('temp_'))
        );
        
        return {
          success: true,
          message: result.message,
          habitCount: template.habits.length
        };
      } else {
        // Remove optimistic updates on failure
        setOptimisticHabits(prev => 
          prev.filter(h => !tempHabits.some(th => th.id === h.id))
        );
        
        return {
          success: false,
          message: result.message,
          habitCount: 0
        };
      }
    } catch (error) {
      console.error('Template creation failed:', error);
      
      // Remove optimistic updates on error
      setOptimisticHabits(prev => 
        prev.filter(h => !tempHabits.some(th => th.id === h.id))
      );
      
      return {
        success: false,
        message: 'Creation failed. Please try again.',
        habitCount: 0
      };
    }
  }, [user?.uid, db]);

  // Optimized habit completion
  const completeHabit = useCallback(async (habitId: string, date: string) => {
    const habit = allHabits.find(h => h.id === habitId);
    if (!habit || !user?.uid || !db) return;

    // Optimistic update
    const completion = {
      date,
      completed: true,
      completedAt: new Date(),
      xpEarned: habit.xpReward,
      coinEarned: habit.coinReward,
      difficulty: 'normal' as const,
      completionMethod: 'manual' as const
    };

    const optimisticHabit = {
      ...habit,
      completionHistory: [...(habit.completionHistory || []), completion],
      streak: (habit.streak || 0) + 1,
      habitStrength: Math.min(100, (habit.habitStrength || 0) + 2)
    };

    setOptimisticHabits(prev => {
      const filtered = prev.filter(h => h.id !== habitId);
      return [...filtered, optimisticHabit];
    });

    // Background update to Firebase
    try {
      await updateHabitInDb(db as Firestore, user.uid, habitId, {
        completionHistory: optimisticHabit.completionHistory,
        streak: optimisticHabit.streak,
        habitStrength: optimisticHabit.habitStrength
      });
    } catch (error) {
      console.error('Failed to complete habit:', error);
      // Revert optimistic update
      setOptimisticHabits(prev => prev.filter(h => h.id !== habitId));
    }
  }, [allHabits, user?.uid, db]);

  // Optimized undo
  const undoHabit = useCallback(async (habitId: string, date: string) => {
    const habit = allHabits.find(h => h.id === habitId);
    if (!habit || !user?.uid || !db) return;

    // Optimistic update
    const updatedHistory = habit.completionHistory?.filter(c => c.date !== date) || [];
    const optimisticHabit = {
      ...habit,
      completionHistory: updatedHistory,
      streak: Math.max(0, (habit.streak || 0) - 1),
      habitStrength: Math.max(0, (habit.habitStrength || 0) - 2)
    };

    setOptimisticHabits(prev => {
      const filtered = prev.filter(h => h.id !== habitId);
      return [...filtered, optimisticHabit];
    });

    // Background update
    try {
      await updateHabitInDb(db as Firestore, user.uid, habitId, {
        completionHistory: optimisticHabit.completionHistory,
        streak: optimisticHabit.streak,
        habitStrength: optimisticHabit.habitStrength
      });
    } catch (error) {
      console.error('Failed to undo habit:', error);
      setOptimisticHabits(prev => prev.filter(h => h.id !== habitId));
    }
  }, [allHabits, user?.uid, db]);

  // Optimized bulk complete
  const bulkComplete = useCallback(async (habitIds: string[], date: string) => {
    const promises = habitIds.map(habitId => completeHabit(habitId, date));
    await Promise.allSettled(promises); // Don't fail all if one fails
  }, [completeHabit]);

  const contextValue: OptimizedHabitsContextType = {
    habits: allHabits,
    todayProgress,
    loading,
    error,
    createHabitsFromTemplate,
    completeHabit,
    undoHabit,
    bulkComplete
  };

  return (
    <OptimizedHabitsContext.Provider value={contextValue}>
      {children}
    </OptimizedHabitsContext.Provider>
  );
};

// Helper functions
function isHabitDueToday(habit: Habit): boolean {
  const dayOfWeek = new Date().getDay();
  if (!habit.schedule) return true; // default to daily if no schedule
  switch (habit.frequency) {
    case 'daily': return true;
    case 'specific-days': return habit.schedule?.targetDays?.includes(dayOfWeek) || false;
    default: return true;
  }
}

function getDifficultyMultiplier(difficulty: string): number {
    return { beginner: 1.0, intermediate: 1.3, advanced: 1.6 }[difficulty as any] || 1.0;
}
  
function mapToDifficulty(templateDifficulty: string): TaskDifficulty {
    return { beginner: 'Easy', intermediate: 'Medium', advanced: 'Hard' }[templateDifficulty as any] || 'Easy';
}

function getAreaColor(area: string): string {
    const colors: Record<string, string> = {
      'Health': '#10B981',
      'Work': '#3B82F6', 
      'Growth': '#8B5CF6',
      'Wellness': '#F59E0B',
      'Social': '#EF4444'
    };
    return colors[area] || '#6B7280';
}

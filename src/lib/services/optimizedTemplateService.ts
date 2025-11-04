// src/lib/services/optimizedTemplateService.ts
import { Firestore } from 'firebase/firestore';
import { HabitTemplate, TemplateHabit } from '@/lib/types/templates';
import { Habit, LifeArea, TaskDifficulty } from '@/lib/types/habits';
import { createHabitsInBatch } from '@/lib/firebase/firestore/habits';

export class OptimizedTemplateService {
  // Create all habits in a single batch operation
  static async createHabitsFromTemplate(
    db: Firestore, // Accept db instance as a parameter
    template: HabitTemplate,
    userId: string
  ): Promise<{ success: boolean; habitIds: string[]; message: string }> {
    
    try {
      // Pre-calculate everything before Firebase operations
      const habitsToCreate: Omit<Habit, 'id'>[] = template.habits.map((templateHabit, index) => {
          return this.createOptimizedHabitData(templateHabit, template, index, userId);
      });
      
      const habitIds = await createHabitsInBatch(db, userId, habitsToCreate);
      
      return {
        success: true,
        habitIds,
        message: `${template.name} activated! ${habitIds.length} habits ready.`
      };
      
    } catch (error) {
      console.error('Batch habit creation failed:', error);
      return {
        success: false,
        habitIds: [],
        message: 'Failed to create template. Please try again.'
      };
    }
  }
  
  private static createOptimizedHabitData(
    templateHabit: TemplateHabit,
    template: HabitTemplate,
    stackOrder: number,
    userId: string
  ): Omit<Habit, 'id'> {
    const difficultyMultiplier = this.getDifficultyMultiplier(template.difficulty);
    const baseXP = Math.round(templateHabit.baseXP * templateHabit.difficultyMultiplier * difficultyMultiplier);
    const baseCoins = Math.round(templateHabit.baseCoins * templateHabit.difficultyMultiplier * difficultyMultiplier);
    
    // Return complete habit data
    return {
      userId,
      title: templateHabit.title,
      description: templateHabit.description || '',
      category: templateHabit.category,
      area: templateHabit.area,
      color: this.getAreaColor(templateHabit.area),
      icon: '🎯',
      
      // Tracking
      trackingType: templateHabit.trackingType,
      frequency: templateHabit.frequency,
      schedule: {
        type: templateHabit.frequency,
        targetValue: templateHabit.targetValue || null,
        allowPartialCompletion: templateHabit.trackingType === 'duration' || templateHabit.trackingType === 'count',
        timeWindows: this.createTimeWindows(templateHabit)
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
      templateStackOrder: stackOrder,
      
      // Reminders (simplified)
      reminders: (templateHabit.reminderSuggestions || []).slice(0, 2).map(suggestion => ({
        id: this.generateId(),
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
      difficulty: this.mapToDifficulty(template.difficulty),
      
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
       updatedAt: new Date(),
    };
  }
  
  private static createTimeWindows(templateHabit: TemplateHabit) {
    // Create time windows only from time-based reminders
    if (!templateHabit.reminderSuggestions) return [];
    return templateHabit.reminderSuggestions
      .filter(r => r.type === 'time')
      .slice(0, 1) // Limit to 1 window for performance
      .map(r => ({
        start: r.value,
        end: this.addHours(r.value, 2), // 2-hour window
        preferred: true
      }));
  }
  
  private static addHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    const newHour = (h + hours) % 24;
    return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  
  private static getDifficultyMultiplier(difficulty: string): number {
    return { beginner: 1.0, intermediate: 1.3, advanced: 1.6 }[difficulty as any] || 1.0;
  }
  
  private static mapToDifficulty(templateDifficulty: string): TaskDifficulty {
    return { beginner: 'Easy', intermediate: 'Medium', advanced: 'Hard' }[templateDifficulty as any] || 'Easy';
  }
  
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  private static getAreaColor(area: string): string {
    const colors: Record<string, string> = {
      'Health': '#10B981',
      'Work': '#3B82F6', 
      'Growth': '#8B5CF6',
      'Wellness': '#F59E0B',
      'Social': '#EF4444'
    };
    return colors[area] || '#6B7280';
  }
}

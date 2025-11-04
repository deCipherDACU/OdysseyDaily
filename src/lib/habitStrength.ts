
import type { Habit } from './types';

export class HabitStrengthEngine {
  // Calculate habit strength (0-100) that doesn't reset to 0 like streaks
  static calculateHabitStrength(habit: Habit): number {
    const completions = habit.completionHistory || [];
    if (!habit.createdAt) return 0;
    
    const daysSinceCreation = Math.max(1, Math.floor(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ));
    
    // Base strength from overall completion rate
    const totalDays = Math.min(daysSinceCreation, 90); // Cap at 90 days for calculation
    const completionRate = completions.filter(c => c.completed).length / totalDays;
    let strength = completionRate * 60; // Base 60 points from consistency
    
    // Recent momentum (last 7 days)
    const recentCompletions = completions.slice(-7);
    const recentRate = recentCompletions.filter(c => c.completed).length / 7;
    strength += recentRate * 25; // Up to 25 points from recent momentum
    
    // Streak bonus (doesn't dominate the score)
    const streakBonus = Math.min((habit.streaks?.current || 0) * 0.5, 15); // Max 15 points from streak
    strength += streakBonus;
    
    // Decay over time if no completions
    const daysSinceLastCompletion = this.getDaysSinceLastCompletion(completions);
    if (daysSinceLastCompletion > 3) {
      const decayFactor = Math.max(0.7, 1 - (daysSinceLastCompletion - 3) * 0.05);
      strength *= decayFactor;
    }
    
    return Math.max(0, Math.min(100, Math.round(strength)));
  }
  
  static getDaysSinceLastCompletion(completions: any[]): number {
    const lastCompletion = completions
      .filter((c: any) => c.completed)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (!lastCompletion) return Infinity;
    
    return Math.floor(
      (new Date().getTime() - new Date(lastCompletion.date).getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  
  // Calculate comeback bonus for returning after break
  static calculateComebackBonus(habit: Habit): number {
    const daysSinceLastCompletion = this.getDaysSinceLastCompletion(habit.completionHistory || []);
    
    if (daysSinceLastCompletion >= 7 && daysSinceLastCompletion <= 30) {
      return Math.round(10 + (daysSinceLastCompletion - 7) * 0.5); // 10-21.5 bonus XP
    }
    
    if (daysSinceLastCompletion > 30) {
      return 25; // Max comeback bonus for long breaks
    }
    
    return 0;
  }
}

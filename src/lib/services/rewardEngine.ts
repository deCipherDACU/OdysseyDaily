
import { Habit, EnhancedCompletion as HabitCompletion } from '@/lib/types/habits';
import { HabitTemplate } from '@/lib/types/templates';
import { isSameDay } from 'date-fns';

export class RewardEngine {
  // Calculate rewards for habit completion with template bonuses
  static calculateHabitRewards(
    habit: Habit, 
    completion: Partial<HabitCompletion>,
    templateInstance?: any
  ): RewardCalculation {
    
    let baseXP = habit.xpReward;
    let baseCoins = habit.coinReward;
    let bonusXP = 0;
    let bonusCoins = 0;
    let specialRewards: SpecialReward[] = [];
    
    // Streak bonuses
    const streakBonus = this.calculateStreakBonus(habit.streak);
    bonusXP += streakBonus.xp;
    bonusCoins += streakBonus.coins;
    
    // Difficulty completion bonuses
    if (completion.difficulty === 'stretch') {
      bonusXP += Math.round(baseXP * 0.5); // 50% bonus for stretch completion
      bonusCoins += Math.round(baseCoins * 0.3);
      specialRewards.push({
        type: 'achievement',
        value: 'overachiever',
        message: 'Completed stretch version!'
      });
    }
    
    // Comeback bonus (from B=MAP principles)
    if (habit.graceSettings.comebackBonus) {
      const daysSinceLastCompletion = this.getDaysSinceLastCompletion(habit);
      if (daysSinceLastCompletion >= 3) {
        const comebackBonus = Math.min(20, daysSinceLastCompletion * 2);
        bonusXP += comebackBonus;
        specialRewards.push({
          type: 'comeback',
          value: comebackBonus,
          message: `Welcome back! +${comebackBonus} XP comeback bonus`
        });
      }
    }
    
    // Template-specific bonuses
    if (templateInstance) {
      const templateBonuses = this.calculateTemplateBonuses(habit, templateInstance);
      bonusXP += templateBonuses.xp;
      bonusCoins += templateBonuses.coins;
      specialRewards.push(...templateBonuses.specialRewards);
    }
    
    // Time-based bonuses (early completion)
    const timingBonus = this.calculateTimingBonus(habit, completion);
    bonusXP += timingBonus.xp;
    bonusCoins += timingBonus.coins;
    
    // Habit strength progression bonus
    const strengthBonus = this.calculateStrengthBonus(habit);
    bonusXP += strengthBonus;
    
    const totalXP = baseXP + bonusXP;
    const totalCoins = baseCoins + bonusCoins;
    
    return {
      baseXP,
      baseCoins,
      bonusXP,
      bonusCoins,
      totalXP,
      totalCoins,
      specialRewards,
      breakdown: {
        streak: streakBonus,
        difficulty: completion.difficulty === 'stretch' ? { xp: Math.round(baseXP * 0.5), coins: Math.round(baseCoins * 0.3) } : { xp: 0, coins: 0 },
        timing: timingBonus,
        template: templateInstance ? this.calculateTemplateBonuses(habit, templateInstance) : { xp: 0, coins: 0, specialRewards: [] },
        strength: { xp: strengthBonus, coins: 0 }
      }
    };
  }

  private static getDaysSinceLastCompletion(habit: Habit): number {
    const completions = habit.completionHistory || [];
    if (completions.length === 0) return Infinity;

    const lastCompletion = completions
        .filter(c => c.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastCompletion) return Infinity;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = new Date(lastCompletion.date);
    lastDate.setHours(0, 0, 0, 0);

    return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static getTemplateHabitsCompletedToday(templateInstance: any): number {
    // This is a placeholder implementation.
    // A real implementation would need access to all habits and the current date
    // to check which habits from the instance were completed today.
    return templateInstance?.progress?.dailyCompletions?.[new Date().toISOString().split('T')[0]] || 0;
  }
  
  private static calculateStreakBonus(streak: number): { xp: number; coins: number } {
    if (streak < 3) return { xp: 0, coins: 0 };
    
    // Progressive streak bonuses
    const baseBonus = Math.min(streak, 30); // Cap at 30 days
    const xp = Math.round(baseBonus * 0.5);
    const coins = Math.round(baseBonus * 0.3);
    
    return { xp, coins };
  }
  
  private static calculateTemplateBonuses(habit: Habit, templateInstance: any): TemplateBonusResult {
    let xp = 0;
    let coins = 0;
    const specialRewards: SpecialReward[] = [];
    
    // Daily template completion bonus
    if (templateInstance.progress.completedDays > 0) {
      const completionRate = templateInstance.progress.successRate / 100;
      if (completionRate >= 0.8) { // 80%+ success rate
        xp += 5;
        coins += 3;
      }
    }
    
    // Milestone bonuses
    const currentDay = templateInstance.progress.currentDay;
    const milestones = [7, 14, 21, 30, 60, 90];
    
    if (milestones.includes(currentDay) && !templateInstance.progress.milestonesReached.includes(currentDay)) {
      const milestoneBonus = this.getMilestoneReward(currentDay);
      xp += milestoneBonus.xp;
      coins += milestoneBonus.coins;
      
      specialRewards.push({
        type: 'milestone',
        value: currentDay,
        message: `${currentDay}-day milestone reached!`,
        rewards: milestoneBonus
      });
    }
    
    // Stack synergy bonus (completing multiple habits from same template)
    const templateHabitsCompletedToday = this.getTemplateHabitsCompletedToday(templateInstance);
    if (templateHabitsCompletedToday >= 3) {
      xp += 10;
      specialRewards.push({
        type: 'synergy',
        value: 'template_stack',
        message: 'Template synergy bonus!'
      });
    }
    
    return { xp, coins, specialRewards };
  }
  
  private static getMilestoneReward(day: number): { xp: number; coins: number; gems?: number } {
    const rewards = {
      7: { xp: 25, coins: 15 },
      14: { xp: 50, coins: 30 },
      21: { xp: 100, coins: 60, gems: 5 }, // 21-day habit formation
      30: { xp: 150, coins: 100, gems: 10 },
      60: { xp: 300, coins: 200, gems: 20 },
      90: { xp: 500, coins: 350, gems: 35 } // Major transformation
    };
    
    return rewards[day as keyof typeof rewards] || { xp: 0, coins: 0 };
  }
  
  private static calculateTimingBonus(habit: Habit, completion: Partial<HabitCompletion>): { xp: number; coins: number } {
    if (!habit.schedule.timeWindows?.length || !completion.completedAt) {
      return { xp: 0, coins: 0 };
    }
    
    const completionTime = new Date(completion.completedAt);
    const hour = completionTime.getHours();
    
    // Check if completed in preferred time window
    const inPreferredWindow = habit.schedule.timeWindows.some(window => {
      const startHour = parseInt(window.start.split(':')[0]);
      const endHour = parseInt(window.end.split(':')[0]);
      // Assuming window.preferred exists
      return hour >= startHour && hour <= endHour;
    });
    
    if (inPreferredWindow) {
      return { xp: 3, coins: 2 }; // Small bonus for good timing
    }
    
    return { xp: 0, coins: 0 };
  }
  
  private static calculateStrengthBonus(habit: Habit): number {
    // Bonus XP based on habit strength growth
    if (habit.habitStrength >= 80) return 5; // Strong habit bonus
    if (habit.habitStrength >= 60) return 3; // Developing habit bonus
    if (habit.habitStrength >= 40) return 2; // Growing habit bonus
    return 0;
  }
  
  // Character progression integration
  static applyRewardsToCharacter(rewards: RewardCalculation, userId: string): Promise<CharacterUpdate> {
    // This would integrate with your existing character system
    return this.updateCharacterStats({
      userId,
      xpGain: rewards.totalXP,
      coinGain: rewards.totalCoins,
      specialRewards: rewards.specialRewards
    });
  }
  
  private static async updateCharacterStats(update: CharacterUpdateRequest): Promise<CharacterUpdate> {
    // Integration with your existing character system
    // This would call your existing character service
    console.log('Updating character stats:', update);
    return {
      newXP: 0, // Would be calculated
      newLevel: 0, // Would be calculated
      newCoins: 0, // Would be calculated
      unlockedAchievements: [],
      unlockedItems: [],
      skillPointsGained: 0
    };
  }
}

// Types for reward system
interface RewardCalculation {
  baseXP: number;
  baseCoins: number;
  bonusXP: number;
  bonusCoins: number;
  totalXP: number;
  totalCoins: number;
  specialRewards: SpecialReward[];
  breakdown: RewardBreakdown;
}

interface SpecialReward {
  type: 'achievement' | 'milestone' | 'comeback' | 'synergy' | 'item';
  value: string | number;
  message: string;
  rewards?: { xp?: number; coins?: number; gems?: number };
}

interface RewardBreakdown {
  streak: { xp: number; coins: number };
  difficulty: { xp: number; coins: number };
  timing: { xp: number; coins: number };
  template: TemplateBonusResult;
  strength: { xp: number; coins: number };
}

interface TemplateBonusResult {
  xp: number;
  coins: number;
  specialRewards: SpecialReward[];
}

interface CharacterUpdate {
  newXP: number;
  newLevel: number;
  newCoins: number;
  unlockedAchievements: string[];
  unlockedItems: string[];
  skillPointsGained: number;
}

interface CharacterUpdateRequest {
  userId: string;
  xpGain: number;
  coinGain: number;
  specialRewards: SpecialReward[];
}

import { TaskCategory, TaskDifficulty } from '@/lib/types';
import { LifeArea } from '@/lib/types/habits';

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: 'morning' | 'evening' | 'fitness' | 'productivity' | 'wellness' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // "21 days", "60 days", etc.
  
  // Reward Integration
  totalDailyXP: number;
  totalDailyCoins: number;
  bonusRewards: TemplateReward[];
  
  // Template Habits
  habits: TemplateHabit[];
  
  // Progression & Unlocks
  unlockRequirements?: UnlockRequirement[];
  completionRewards: CompletionReward[];
  milestoneRewards: { [day: number]: MilestoneReward };
  
  // Gamification
  achievements: string[]; // Achievement IDs unlocked by this template
  characterBoosts: CharacterBoost[];
  
  tags: string[];
  estimatedTimePerDay: number; // minutes
  successRate: number; // historical success rate %
  popularityScore: number;
}

export interface UnlockRequirement {
    type: 'level' | 'achievement' | 'item';
    value: string | number;
}

export interface MilestoneReward {
    day: number;
    xp: number;
    coins: number;
    gems: number;
    items: string[];
    achievements: string[];
}

export interface TemplateHabit {
  title: string;
  description?: string;
  area: string; // Life area name
  category: TaskCategory;
  
  // Tracking Configuration
  trackingType: 'binary' | 'duration' | 'count' | 'scale';
  frequency: 'daily' | 'weekly' | 'x-per-week' | 'specific-days';
  targetValue?: number;
  unit?: string;
  scaleRange?: { min: number; max: number };
  
  // Rewards (integrated with your existing system)
  baseXP: number;
  baseCoins: number;
  difficultyMultiplier: number; // 1.0 for easy, 1.5 for medium, 2.0 for hard
  
  // B=MAP Integration
  tinyVersion: string; // Minimum viable version
  triggers: string[]; // Suggested cues
  barriers: string[]; // Common obstacles
  
  // Smart Features
  reminderSuggestions: ReminderSuggestion[];
  stackingOrder: number; // Order within template stack
  dependencies?: string[]; // Must complete these habits first
  
  // Character Impact
  skillBoosts: { [skill: string]: number }; // Strength, Intelligence, etc.
  equipmentUnlocks?: string[]; // Equipment IDs
}

export interface TemplateReward {
  type: 'xp' | 'coins' | 'gems' | 'item' | 'achievement' | 'skill-points';
  value: number | string;
  condition: 'daily-complete' | 'weekly-complete' | 'streak' | 'milestone';
  threshold?: number; // For streak/milestone conditions
}

export interface CompletionReward {
  day: number; // Day of template completion
  xp: number;
  coins: number;
  gems: number;
  items: string[]; // Item/equipment IDs
  achievements: string[]; // Achievement IDs
  title?: string; // Special character title
  skillPoints: number;
}

export interface CharacterBoost {
  stat: 'strength' | 'intelligence' | 'agility' | 'endurance' | 'perception';
  boost: number; // Percentage boost while template is active
  permanent: boolean; // Whether boost persists after completion
}

export interface ReminderSuggestion {
  type: 'time' | 'location' | 'after-event' | 'context';
  value: string;
  message: string;
}

    
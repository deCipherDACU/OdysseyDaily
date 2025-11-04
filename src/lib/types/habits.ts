// src/lib/types/habits.ts (Enhanced with user demands)
import { TaskDifficulty, TaskCategory } from "../types";

export interface HabitCategory {
    id: string;
    name: string;
}

export type Trigger = {
  type: 'context' | 'time' | 'location';
  value: string;
  enabled: boolean;
};

export type AutonomySettings = {
  allowCustomization: boolean;
  userDefinedRewards: any[];
  skipWithoutPenalty: boolean;
  pauseOption: boolean;
};

export interface Habit {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  
  // Category Organization (Top User Request)
  category: TaskCategory;
  area: string;
  color: string;
  icon?: string;
  
  // Advanced Habit Types (Missing in most apps)
  trackingType: 'binary' | 'duration' | 'count' | 'scale' | 'negative';
  targetValue?: number;
  unit?: string; // minutes, pages, cups, etc.
  scaleRange?: { min: number; max: number }; // for mood/energy tracking
  
  // Flexible Scheduling (Highly Demanded)
  frequency: 'daily' | 'weekly' | 'monthly' | 'x-per-week' | 'specific-days' | 'interval';
  schedule: FlexibleSchedule;
  
  // Grace Rules (Critical Missing Feature)
  graceSettings: GraceSettings;
  
  // Smart Reminders (Users hate current reminder systems)
  reminders: SmartReminder[];
  
  // Habit Strength (Alternative to harsh streak resets)
  habitStrength: number; // 0-100, doesn't reset to 0
  streak: number;
  longestStreak: number;
  
  // Progress & Analytics
  successRate: number;
  completionHistory: EnhancedCompletion[];
  analytics: HabitAnalytics;
  
  // User Customization
  priority: number; // 1-5
  difficulty: TaskDifficulty;
  notes?: string[];
  xpReward: number;
  coinReward: number;

  // B=MAP Integration
  tinyVersion?: string;
  triggers?: Trigger[];
  barriers?: string[];

  // Autonomy Settings (SDT)
  autonomySettings?: AutonomySettings;
  
  // State
  isActive: boolean;
  isPaused: boolean;
  pauseReason?: string;
  vacationMode: boolean;
  
  createdAt: Date;
  updatedAt: Date;

  // Template Integration
  templateId?: string;
  templateStackOrder?: number;

  // Analytics
  missReasons?: { [date: string]: string };
  bestTimeOfDay?: string;
  bestDaysOfWeek?: number[];
}

export interface HabitAnalytics {
    [key: string]: any;
}

export interface LifeArea {
  id: string;
  name: string;
  color: string;
  icon: string;
  isExpanded: boolean; // For collapse/expand
  sortOrder: number;
}

export interface TimeWindow {
    start: string;
    end: string;
}

export interface FlexibleSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'x-per-week' | 'specific-days' | 'interval';
  targetDays?: number[]; // Days of week
  targetCount?: number; // x times per period
  intervalDays?: number; // Every X days
  timeWindows?: TimeWindow[];
  allowPartialCompletion: boolean;
}

export interface GraceSettings {
  enabled: boolean;
  graceDays: number; // How many missed days before streak resets
  vacationMode: boolean; // Pause streaks during breaks
  sickDayProtection: boolean;
  weekendGrace: boolean; // Different rules for weekends
  comebackBonus: boolean; // Extra rewards for returning after break
}

export interface SmartReminder {
  id: string;
  type: 'time' | 'location' | 'after-event' | 'context' | 'adaptive';
  trigger: string;
  message: string;
  enabled: boolean;
  sticky: boolean; // Stays until acted on
  snoozeOptions: number[]; // Minutes
  escalation?: EscalationRule[];
}

export interface EscalationRule {
  afterMinutes: number;
  message: string;
  action: 'notify' | 'suggest-tiny' | 'offer-skip';
}

export interface EnhancedCompletion {
  date: string;
  completed: boolean;
  value?: number; // For duration/count/scale habits
  partialValue?: number; // For partial completions
  notes?: string;
  mood?: number; // -5 to +5 scale
  energy?: number; // 1-10 scale
  context?: string;
  photo?: string;
  completionMethod: 'manual' | 'widget' | 'auto' | 'batch';
  xpEarned: number;
  coinEarned: number;
  difficulty: 'tiny' | 'normal' | 'stretch';
  completedAt: Date;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: 'morning' | 'evening' | 'fitness' | 'productivity' | 'wellness';
  habits: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // "21 days", "8 weeks", etc.
}

export interface HabitCompletion {
  date: string;
  completed: boolean;
  completedAt: Date;
  xpEarned: number;
  coinEarned: number;
}


export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'foundation' | 'transformation' | 'custom';
    duration: number; // in days
    category: string;
    difficulty: TaskDifficulty;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'completed' | 'failed';
    requirements: {
        type: 'habit' | 'task';
        target: string;
        frequency: number;
        description: string;
    }[];
    rewards: {
        xp: number;
        coins: number;
        gems: number;
        items: any[];
        achievements: string[];
    };
    progress: {
        currentDay: number;
        completedDays: number;
        successRate: number;
        dailyCompletions: { [date: string]: boolean };
        milestoneRewards: { [day: number]: boolean };
    };
    createdAt: Date;
    updatedAt: Date;
}

    
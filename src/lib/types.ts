
import type { ComponentType, ElementType } from 'react';

export type TaskCategory = 'Education' | 'Career' | 'Health' | 'Mental Wellness' | 'Finance' | 'Social' | 'Hobbies' | 'Home' | 'Reward' | 'Commitment' | 'Break';
export type TaskDifficulty = 'Easy' | 'Medium' | 'Hard' | 'N/A';

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  type: 'Daily' | 'Weekly' | 'Monthly' | 'One-time';
  dueDate?: Date;
  completed: boolean;
  xp: number;
  coins: number;
  streak?: number;
  lastCompleted?: Date;
  intention?: string;
  pomodoros?: number;
  pomodorosCompleted?: number;
};

export type Skill = {
  name: string;
  level: number;
  maxLevel: number;
  description: string;
  cost: number;
};

export type SkillTreeData = {
  name: 'Physical' | 'Mental' | 'Life Skills';
  icon: ComponentType<{ className?: string }>;
  description: string;
  skills: Skill[];
};

export type RedeemedReward = {
    rewardId: string;
    timestamps: Date[];
}

export type RecentJournalDeletions = {
    count: number;
    lastDeletion: Date;
}

export type Item = {
  id: string;
  name: string;
  type: 'Weapon' | 'Armor' | 'Helmet' | 'Shield' | 'Collectible';
  bonus: string;
  icon: ComponentType<{ className?: string }>;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export type Equipment = {
  weapon: Item | null;
  armor: Item | null;
  helmet: Item | null;
  shield: Item | null;
}

export type ChatMessage = {
    role: 'user' | 'model';
    content: string;
};

export type NotificationType = 'reminder' | 'motivation' | 'achievement' | 'health_warning' | 'streak_reminder' | 'daily_check_in' | 'generic';

export type Notification = {
    id: string;
    type: NotificationType;
    message: string;
    date: Date;
    read: boolean;
    path?: string;
}

export type NotificationStyle = 'creative' | 'funny' | 'calm' | 'motivational' | 'random';

export type NotificationPreferences = {
    reminder: boolean;
    motivation: boolean;
    achievement: boolean;
    health_warning: boolean;
    streak_reminder: boolean;
    daily_check_in: boolean;
    ai_personalization: boolean;
    style: NotificationStyle;
};

export type Debuff = {
  name: string;
  description: string;
  icon: ElementType;
  duration: number; // in days
  effect: (user: User) => Partial<User>; // Function to apply the effect
};

export type UserPreferences = {
    soundEffects?: boolean;
    backgroundMusic?: boolean;
    theme?: 'light' | 'dark';
}

export type User = {
  uid: string;
  name: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  health: number;
  maxHealth: number;
  debuffs: Debuff[];
  coins: number;
  gems: number;
  skillPoints: number;
  equipment: Equipment;
  inventory: Item[];
  streak: number;
  longestStreak: number;
  tasksCompleted: number;
  memberSince: Date;
  completionRate: number;
  mbti?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  lastLogin: Date;
  skillTrees: SkillTreeData[];
  redeemedRewards: RedeemedReward[];
  recentJournalDeletions?: RecentJournalDeletions;
  customRewards: RewardItem[];
  notifications: Notification[];
  notificationPreferences: NotificationPreferences;
  preferences?: UserPreferences;
  achievements?: Achievement[];
};

export type Achievement = {
  id:string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlocked: boolean;
  unlockedDate?: Date;
  xp?: number;
};

export type AttackPattern = {
  name: string;
  description: string;
  trigger: string;
  icon: ElementType;
};

export type BossPhase = {
  name: string;
  hpThreshold: number;
};

export type Boss = {
  id: string;
  name: string;
  type: 'Aberration' | 'Beast' | 'Construct';
  title: string;
  imageUrl: string;
  maxHp: number;
  currentHp: number;
  timeRemaining: string;
  resistances: { [key in Task['category'] | 'Reward']?: number }; // 1.0 = normal, >1.0 = resist, <1.0 = weak
  attack_pattern: AttackPattern[];
  phases: BossPhase[];
  rewards: {
    xp: number;
    coins: number;
    gems: number;
  };
  lastDefeated?: string;
};

export type RewardItem = {
    id: string;
    title: string;
    description: string;
    coinCost?: number;
    gemCost?: number;
    icon: ComponentType<{ className?: string }>;
    category: 'Entertainment' | 'Relaxation' | 'Treat' | 'Item' | 'Boost' | 'Custom';
    levelRequirement: number;
    redeemLimit?: number;
    redeemPeriod?: 'daily' | 'weekly' | 'monthly';
    item?: Item;
}

export type JournalEntry = {
    id: string;
    date: Date;
    text?: string;
    imageUrl?: string;
    voiceUrl?: string;
};

export type DungeonChallenge = {
    id: string;
    title: string;
    completed: boolean;
};

export type DungeonCrawl = {
    id: string;
    title: string;
    description: string;
    difficulty: number; // 1-5
    challenges: DungeonChallenge[];
    completed: boolean;
    xp: number;
    startTime?: string; // ISO string
    completionTime?: string; // ISO string
    timeTaken?: number; // in seconds
};

export type WeeklyReview = {
    id: string;
    date: Date;
    weekNumber: number;
    year: number;
    wins: string;
    challenges: string;
    learnings: string;
    nextWeekGoals: string;
    mood: 'Great' | 'Good' | 'Okay' | 'Bad' | 'Awful';
};

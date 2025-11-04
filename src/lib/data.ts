

import type { User, Task, Achievement, Boss, RewardItem, Notification, Debuff } from './types';
import { xpForLevel, calculateTaskXP, calculateTaskCoins } from './formulas';
import { 
    BookOpen, Briefcase, Brain, Dumbbell, Shield, Sparkles, Sword, Trophy, Film, Gamepad2, Pizza, 
    Diamond, Zap, Box, Image, Star, Repeat, CalendarCheck, Timer, Wind, Notebook, GitMerge, Bot, 
    Flame, Sun, Moon, ShoppingBag, Heart, FileText, Palette, Coins, Crown, Anchor, Aperture, Eye, Gem, Skull, Activity,
    Rocket, Droplet, Users, Bed, Settings, Calendar as CalendarIcon, Wallet, Smile, Leaf, HomeIcon, Target, Phone, Shirt,
    MountainIcon, Run, Bike, CheckSquare, XSquare, BookCopy, Code, MessageCircle, PiggyBank, Handshake, Sprout, Paintbrush, Music
} from 'lucide-react';
import { defaultArmor, defaultWeapon, availableCollectibles, defaultHelmet, defaultShield } from './inventory';

const MOCK_LEVEL = 20;
const MOCK_XP = 0;

export let mockUser: User = {
  uid: 'user-1',
  name: 'Adventurer',
  avatarUrl: 'https://picsum.photos/seed/avatar-placeholder/200/200',
  level: MOCK_LEVEL,
  xp: MOCK_XP,
  xpToNextLevel: xpForLevel(MOCK_LEVEL + 1),
  health: 100,
  maxHealth: 100,
  debuffs: [],
  coins: 50,
  gems: 5,
  skillPoints: 5,
  equipment: {
    weapon: defaultWeapon,
    armor: defaultArmor,
    helmet: defaultHelmet,
    shield: defaultShield,
  },
  inventory: [],
  streak: 0,
  longestStreak: 0,
  tasksCompleted: 0,
  memberSince: new Date(),
  completionRate: 0,
  mbti: undefined,
  gender: 'prefer-not-to-say',
  lastLogin: new Date(),
  skillTrees: [
    {
      name: 'Physical',
      icon: Dumbbell,
      description: 'Increases physical power and resilience.',
      skills: [
        { name: 'Overpower', level: 0, maxLevel: 5, cost: 1, description: '+5% damage to bosses per level.' },
        { name: 'Toughness', level: 0, maxLevel: 5, cost: 1, description: 'Reduce HP loss from missed daily quests by 10% per level.' },
      ],
    },
    {
      name: 'Mental',
      icon: Brain,
      description: 'Boosts learning, focus, and AI interactions.',
      skills: [
        { name: 'Aptitude', level: 0, maxLevel: 5, cost: 1, description: '+5% XP from Education & Career quests per level.' },
        { name: 'Insight', level: 0, maxLevel: 3, cost: 2, description: 'AI coach provides more detailed suggestions.' },
      ],
    },
    {
        name: 'Life Skills',
        icon: Briefcase,
        description: 'Improves efficiency, luck, and rewards.',
        skills: [
          { name: 'Quickness', level: 0, maxLevel: 5, cost: 1, description: '+2% chance per level to find a rare item.' },
          { name: 'Scavenger', level: 0, maxLevel: 5, cost: 1, description: '+2% chance per level to find extra coins.' },
        ],
      }
  ],
  redeemedRewards: [],
  customRewards: [],
  notifications: [
    { id: '1', type: 'generic', message: 'Welcome to LifeQuest! Your adventure begins now.', date: new Date(), read: false, path: '/dashboard' },
    { id: '2', type: 'reminder', message: 'Don\'t forget to complete your daily quests to maintain your streak!', date: new Date(), read: false, path: '/tasks' },
    { id: '3', type: 'motivation', message: 'A small step today can lead to a giant leap tomorrow. You\'ve got this!', date: new Date(), read: false, path: '/tasks' },
    { id: '4', type: 'motivation', message: 'Keep up the great work!', date: new Date(), read: true, path: '/dashboard' },
  ],
  notificationPreferences: {
    reminder: true,
    motivation: true,
    achievement: true,
    health_warning: true,
    streak_reminder: true,
    daily_check_in: true,
    ai_personalization: true,
    style: 'random',
  },
  preferences: {
    soundEffects: false,
    backgroundMusic: false,
  }
};

export let mockTasks: Task[] = [
  { id: '1', title: 'Complete Psychology reading Ch. 5', description: 'Read and take notes on chapter 5 for PSY-201.', category: 'Education', difficulty: 'Medium', type: 'One-time', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), completed: false, xp: calculateTaskXP('Medium'), coins: calculateTaskCoins('Medium', MOCK_LEVEL) },
  { id: '2', title: 'Morning workout', description: '30-minute cardio session.', category: 'Health', difficulty: 'Easy', type: 'Daily', completed: false, xp: calculateTaskXP('Easy'), coins: calculateTaskCoins('Easy', MOCK_LEVEL), streak: 3, lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000)},
  { id: '3', title: 'Work on marketing presentation', description: 'Finish slides 5-10 for the quarterly review.', category: 'Career', difficulty: 'Hard', type: 'One-time', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), completed: false, xp: calculateTaskXP('Hard'), coins: calculateTaskCoins('Hard', MOCK_LEVEL) },
  { id: '4', title: 'Meditate for 10 minutes', category: 'Mental Wellness', difficulty: 'Easy', type: 'Daily', completed: true, xp: calculateTaskXP('Easy'), coins: calculateTaskCoins('Easy', MOCK_LEVEL), streak: 12, lastCompleted: new Date() },
  { id: '5', title: 'Review monthly budget', category: 'Finance', difficulty: 'Medium', type: 'Monthly', completed: false, xp: calculateTaskXP('Medium'), coins: calculateTaskCoins('Medium', MOCK_LEVEL) },
  { id: '6', title: 'Call a friend', category: 'Social', difficulty: 'Easy', type: 'Weekly', completed: false, xp: calculateTaskXP('Easy'), coins: calculateTaskCoins('Easy', MOCK_LEVEL) },
  { id: '7', title: 'Practice guitar for 30 mins', category: 'Hobbies', difficulty: 'Easy', type: 'Daily', completed: true, xp: calculateTaskXP('Easy'), coins: calculateTaskCoins('Easy', MOCK_LEVEL), streak: 2, lastCompleted: new Date() },
  { id: '8', title: 'Clean the kitchen', category: 'Home', difficulty: 'Medium', type: 'Weekly', completed: false, xp: calculateTaskXP('Medium'), coins: calculateTaskCoins('Medium', MOCK_LEVEL) },
  { id: '9', title: 'Study for calculus midterm', description: 'Review lecture notes and practice problems.', category: 'Education', difficulty: 'Hard', type: 'One-time', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), completed: false, xp: calculateTaskXP('Hard'), coins: calculateTaskCoins('Hard', MOCK_LEVEL) },
  { id: '10', title: 'Drink 8 glasses of water', category: 'Health', difficulty: 'Easy', type: 'Daily', completed: true, xp: calculateTaskXP('Easy'), coins: calculateTaskCoins('Easy', MOCK_LEVEL), lastCompleted: new Date() },
];

export let mockAchievements: Achievement[] = [
    // Quest Completion
    { id: 'q1', title: 'First Step', description: 'Complete your first quest', icon: Sword, rarity: 'Common', unlocked: true, unlockedDate: new Date(), xp: 10 },
    { id: 'q2', title: 'Quest Apprentice', description: 'Complete 10 quests', icon: Sword, rarity: 'Common', unlocked: true, unlockedDate: new Date(), xp: 50 },
    { id: 'q3', title: 'Quest Journeyman', description: 'Complete 25 quests', icon: Sword, rarity: 'Common', unlocked: false, xp: 100 },
    { id: 'q4', title: 'Quest Adept', description: 'Complete 50 quests', icon: Shield, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'q5', title: 'Centurion', description: 'Complete 100 quests', icon: Shield, rarity: 'Rare', unlocked: false, xp: 200 },
    { id: 'q6', title: 'Quest Master', description: 'Complete 250 quests', icon: Shield, rarity: 'Epic', unlocked: false, xp: 500 },
    { id: 'q7', title: 'Quest Grandmaster', description: 'Complete 500 quests', icon: Trophy, rarity: 'Epic', unlocked: false, xp: 1000 },
    { id: 'q8', title: 'Millennium', description: 'Complete 1,000 quests', icon: Trophy, rarity: 'Legendary', unlocked: false, xp: 2000 },
    { id: 'q9', title: 'Tenacious', description: 'Complete a Hard quest', icon: Zap, rarity: 'Common', unlocked: true, unlockedDate: new Date(), xp: 25 },
    { id: 'q10', title: 'Unstoppable', description: 'Complete 10 Hard quests', icon: Zap, rarity: 'Rare', unlocked: false, xp: 100 },

    // Leveling
    { id: 'l1', title: 'Novice', description: 'Reach level 5', icon: Sparkles, rarity: 'Common', unlocked: true, unlockedDate: new Date(), xp: 50 },
    { id: 'l2', title: 'Adept', description: 'Reach level 10', icon: Sparkles, rarity: 'Common', unlocked: true, unlockedDate: new Date(), xp: 100 },
    { id: 'l3', title: 'Expert', description: 'Reach level 25', icon: Star, rarity: 'Rare', unlocked: false, xp: 250 },
    { id: 'l4', title: 'Master', description: 'Reach level 50', icon: Star, rarity: 'Epic', unlocked: false, xp: 500 },
    { id: 'l5', title: 'Grandmaster', description: 'Reach level 75', icon: Trophy, rarity: 'Epic', unlocked: false, xp: 1000 },
    { id: 'l6', title: 'Legend', description: 'Reach level 99', icon: Trophy, rarity: 'Legendary', unlocked: false, xp: 2500 },

    // Streaks
    { id: 's1', title: 'Getting Started', description: 'Maintain a 3-day streak', icon: Flame, rarity: 'Common', unlocked: true, unlockedDate: new Date(), xp: 25 },
    { id: 's2', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: Flame, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 's3', title: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: Flame, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 's4', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: Sun, rarity: 'Rare', unlocked: false, xp: 250 },
    { id: 's5', title: 'Seasoned Pro', description: 'Maintain a 60-day streak', icon: Sun, rarity: 'Epic', unlocked: false, xp: 500 },
    { id: 's6', title: 'True Dedication', description: 'Maintain a 90-day streak', icon: Sun, rarity: 'Epic', unlocked: false, xp: 1000 },
    { id: 's7', title: 'The Centenarian', description: 'Maintain a 100-day streak', icon: Diamond, rarity: 'Legendary', unlocked: false, xp: 2000 },
    { id: 's8', title: 'Year of Power', description: 'Maintain a 365-day streak', icon: Diamond, rarity: 'Legendary', unlocked: false, xp: 5000 },

    // Pomodoro Achievements
    { id: 'first_session', title: 'First Focus', description: 'Complete your first pomodoro session', icon: Timer, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'marathon', title: 'Focus Marathon', description: 'Complete 8 sessions in one day', icon: Timer, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'streak_master', title: 'Streak Master', description: '30 consecutive days with at least 1 session', icon: Timer, rarity: 'Epic', unlocked: false, xp: 500 },


    // Category Specific
    { id: 'c1', title: 'Scholar', description: 'Complete 10 Education quests', icon: BookOpen, rarity: 'Common', unlocked: true, unlockedDate: new Date(), xp: 50 },
    { id: 'c2', title: 'Bookworm', description: 'Complete 50 Education quests', icon: BookOpen, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'c3', title: 'Career Climber', description: 'Complete 10 Career quests', icon: Briefcase, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'c4', title: 'Professional', description: 'Complete 50 Career quests', icon: Briefcase, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'c5', title: 'Healthy Habit', description: 'Complete 10 Health quests', icon: Dumbbell, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'c6', title: 'Fitness Fanatic', description: 'Complete 50 Health quests', icon: Dumbbell, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'c7', title: 'Mindful Moment', description: 'Complete 10 Mental Wellness quests', icon: Brain, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'c8', title: 'Zen Master', description: 'Complete 50 Mental Wellness quests', icon: Brain, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'c9', title: 'Hobbyist', description: 'Complete 10 Hobbies quests', icon: Gamepad2, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'c10', title: 'Artisan', description: 'Complete 50 Hobbies quests', icon: Gamepad2, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'c11', title: 'Homebody', description: 'Complete 10 Home quests', icon: Box, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'c12', title: 'Homemaker', description: 'Complete 50 Home quests', icon: Box, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'c13', title: 'Social Butterfly', description: 'Complete 10 Social quests', icon: Wind, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'c14', title: 'Networker', description: 'Complete 50 Social quests', icon: Wind, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'c15', title: 'Financier', description: 'Complete 10 Finance quests', icon: Diamond, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'c16', title: 'Treasurer', description: 'Complete 50 Finance quests', icon: Diamond, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'c17', title: 'Well-Rounded', description: 'Complete 10 quests in every category', icon: Star, rarity: 'Epic', unlocked: false, xp: 500 },

    // Boss Fights
    { id: 'b1', title: 'First Victory', description: 'Defeat your first boss', icon: Sword, rarity: 'Common', unlocked: true, unlockedDate: new Date(), xp: 100 },
    { id: 'b2', title: 'Boss Slayer', description: 'Defeat 5 weekly bosses', icon: Sword, rarity: 'Rare', unlocked: false, xp: 250 },
    { id: 'b3', title: 'Boss Hunter', description: 'Defeat 10 weekly bosses', icon: Sword, rarity: 'Epic', unlocked: false, xp: 500 },
    { id: 'b4', title: 'Legendary Hunter', description: 'Defeat 25 weekly bosses', icon: Trophy, rarity: 'Legendary', unlocked: false, xp: 1000 },
    { id: 'b5', title: 'Critical Hit', description: 'Exploit a boss\'s weakness', icon: Zap, rarity: 'Common', unlocked: false, xp: 50 },

    // Notes Feature Achievements
    { id: 'scribe', title: 'Scribe', description: 'Create your first note', icon: Notebook, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'archivist', title: 'Archivist', description: 'Create 10 notes', icon: Notebook, rarity: 'Common', unlocked: false, xp: 75 },
    { id: 'loremaster', title: 'Loremaster', description: 'Create 50 notes', icon: BookOpen, rarity: 'Rare', unlocked: false, xp: 200 },
    { id: 'chronicler', title: 'Chronicler of Ages', description: 'Create 100 notes', icon: BookOpen, rarity: 'Epic', unlocked: false, xp: 500 },
    { id: 'organizer', title: 'Organizer', description: 'Use 5 different tags', icon: Brain, rarity: 'Common', unlocked: false, xp: 30 },
    { id: 'categorizer', title: 'Categorizer', description: 'Use 5 different categories for your notes', icon: Brain, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'pinner', title: 'Pinner', description: 'Pin your first important note', icon: Zap, rarity: 'Common', unlocked: false, xp: 20 },

    // Feature Engagement
    { id: 'f1', title: 'Chronicler', description: 'Write your first journal entry', icon: Notebook, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'f2', title: 'Diarist', description: 'Write 10 journal entries', icon: Notebook, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'f3', title: 'Historian', description: 'Write 50 journal entries', icon: Notebook, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'f4', title: 'Time Bender', description: 'Use the Pomodoro timer for the first time', icon: Timer, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'f5', title: 'Focused', description: 'Complete 10 Pomodoro sessions', icon: Timer, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'f6', title: 'In The Zone', description: 'Complete 50 Pomodoro sessions', icon: Timer, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'f7', title: 'Just Breathe', description: 'Complete a breathing exercise', icon: Wind, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'f8', title: 'Inner Peace', description: 'Complete 25 breathing exercises', icon: Wind, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'f9', title: 'Introspective', description: 'Complete your first weekly review', icon: CalendarCheck, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'f10', title: 'Reflective', description: 'Complete 4 weekly reviews', icon: CalendarCheck, rarity: 'Rare', unlocked: false, xp: 150 },
    { id: 'f11', title: 'Special Quest Delver', description: 'Complete your first Special Quest', icon: GitMerge, rarity: 'Common', unlocked: false, xp: 100 },
    { id: 'f12', title: 'Special Quest Master', description: 'Complete 10 Special Quests', icon: GitMerge, rarity: 'Rare', unlocked: false, xp: 250 },
    { id: 'f13', title: 'AI Consultant', description: 'Chat with the AI coach for the first time', icon: Bot, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'f14', title: 'Student of the Machine', description: 'Get AI task recommendations', icon: Bot, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'f15', title: 'Skill Up', description: 'Spend your first skill point', icon: Zap, rarity: 'Common', unlocked: false, xp: 10 },
    { id: 'f16', title: 'Specialized', description: 'Reach level 5 in any skill', icon: Star, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'f17', title: 'Jack of All Trades', description: 'Put at least one point in every skill tree', icon: Star, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'f18', title: 'First Special Quest', description: 'Generate your first Special Quest', icon: GitMerge, rarity: 'Common', unlocked: false, xp: 50 },

    // Shop & Economy
    { id: 'e1', title: 'Window Shopper', description: 'Visit the rewards shop', icon: ShoppingBag, rarity: 'Common', unlocked: false, xp: 10 },
    { id: 'e2', title: 'Treat Yourself', description: 'Redeem your first reward', icon: Pizza, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'e3', title: 'Spender', description: 'Redeem 10 rewards', icon: Pizza, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'e4', title: 'Big Spender', description: 'Spend 10,000 coins', icon: Coins, rarity: 'Rare', unlocked: false, xp: 200 },
    { id: 'e5', title: 'High Roller', description: 'Spend 100,000 coins', icon: Coins, rarity: 'Epic', unlocked: false, xp: 500 },
    { id: 'e6', title: 'Gem Collector', description: 'Acquire 100 gems', icon: Diamond, rarity: 'Rare', unlocked: false, xp: 200 },
    { id: 'e7', title: 'Personal Touch', description: 'Create your first custom reward', icon: Star, rarity: 'Common', unlocked: false, xp: 25 },

    // Character & Customization
    { id: 'p1', title: 'New Look', description: 'Change your avatar', icon: Palette, rarity: 'Common', unlocked: false, xp: 10 },
    { id: 'p2', title: 'Identity', description: 'Set your MBTI type', icon: Brain, rarity: 'Common', unlocked: false, xp: 10 },
    { id: 'p3', title: 'New Gear', description: 'Equip a new weapon or armor', icon: Shield, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'p4', title: 'Well-Equipped', description: 'Equip a weapon and armor', icon: Shield, rarity: 'Rare', unlocked: false, xp: 100 },

    // Miscellaneous / Fun
    { id: 'm1', title: 'Night Owl', description: 'Complete a quest after midnight', icon: Moon, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'm2', title: 'Early Bird', description: 'Complete a quest before 7 AM', icon: Sun, rarity: 'Common', unlocked: false, xp: 25 },
    { id: 'm3', title: 'Oops!', description: 'Uncheck a completed task', icon: Repeat, rarity: 'Common', unlocked: false, xp: 10 },
    { id: 'm4', title: 'Perfect Week', description: 'Complete all your quests for 7 days straight', icon: Trophy, rarity: 'Epic', unlocked: false, xp: 500 },
    { id: 'm5', title: 'Completionist', description: 'Unlock all other achievements', icon: Diamond, rarity: 'Legendary', unlocked: false, xp: 5000 },
    { id: 'm6', title: 'Back from the Brink', description: 'Recover from 1 HP', icon: Heart, rarity: 'Epic', unlocked: false, xp: 250 },
    { id: 'm7', title: 'Hoarder', description: 'Accumulate 10,000 coins without spending any', icon: Box, rarity: 'Epic', unlocked: false, xp: 250 },
    { id: 'm8', title: 'Boss Rematcher', description: 'Fight the same boss twice', icon: Repeat, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'm9', title: 'Task Juggler', description: 'Complete 5 tasks in one day', icon: Zap, rarity: 'Common', unlocked: false, xp: 50 },
    { id: 'm10', title: 'Productivity Powerhouse', description: 'Complete 10 tasks in one day', icon: Zap, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'm11', title: 'Marathoner', description: 'Log 5 hours of focus time in a single day', icon: Timer, rarity: 'Epic', unlocked: false, xp: 250 },
    { id: 'm12', title: 'Collector', description: 'Own 10 different rewards in your inventory', icon: ShoppingBag, rarity: 'Rare', unlocked: false, xp: 100 },
    { id: 'm13', title: 'The Phoenix', description: 'Recover from a broken streak', icon: Flame, rarity: 'Rare', unlocked: false, xp: 100 },
];

export const mockBosses: Boss[] = [
    {
        id: 'boss-1',
        name: 'The Procrastination Hydra',
        type: 'Aberration',
        title: 'Weekly Boss',
        imageUrl: '/character1.png',
        maxHp: 2500,
        currentHp: 2500,
        timeRemaining: '3 days 11 hours',
        resistances: {
            'Education': 1.5, // Resists
            'Career': 1.2,
            'Health': 0.8, // Weak to
            'Mental Wellness': 0.8,
            'Finance': 1.0,
            'Social': 1.0,
            'Hobbies': 1.0,
            'Home': 1.0,
            'Reward': 1.0,
        },
        attack_pattern: [
            {
                name: "Distraction Swarm",
                description: "If any 'Hard' quest is not completed on time, you take 10 damage.",
                trigger: "On Hard quest missed",
                icon: Skull,
            },
            {
                name: "Lethargy Poison",
                description: "If 3 or more 'Daily' quests are missed, you are afflicted with Poison, taking 5 damage per day.",
                trigger: "On 3+ dailies missed",
                icon: Activity,
            }
        ],
        phases: [
            { name: "Phase 1: Annoyance", hpThreshold: 1500 },
            { name: "Phase 2: Desperation", hpThreshold: 500 },
            { name: "Phase 3: Final Stand", hpThreshold: 0 },
        ],
        rewards: {
            xp: 500,
            coins: 100,
            gems: 0,
        }
    },
    {
        id: 'boss-2',
        name: 'The Gluttonous Gold Golem',
        type: 'Construct',
        title: 'Weekly Boss',
        imageUrl: '/character6.png',
        maxHp: 3000,
        currentHp: 3000,
        timeRemaining: '4 days 2 hours',
        resistances: {
            'Finance': 2.0, // Resists heavily
            'Career': 1.5,
            'Social': 0.7, // Weak to
            'Hobbies': 0.7,
            'Health': 1.0,
            'Education': 1.0,
            'Home': 1.0,
            'Mental Wellness': 1.0,
            'Reward': 1.0,
        },
        attack_pattern: [
            {
                name: "Coin Drain",
                description: "If any 'Finance' quest is failed, you lose 25 coins.",
                trigger: "On Finance quest missed",
                icon: Skull,
            },
            {
                name: "Avarice Aura",
                description: "Increases the cost of all shop rewards by 20% while this boss is active.",
                trigger: "Passive",
                icon: Activity,
            }
        ],
        phases: [
            { name: "Phase 1: Hoarding", hpThreshold: 2000 },
            { name: "Phase 2: Fortifying", hpThreshold: 800 },
            { name: "Phase 3: Golden Rage", hpThreshold: 0 },
        ],
        rewards: {
            xp: 700,
            coins: 500,
            gems: 5,
        }
    },
    {
        id: 'boss-3',
        name: 'The Anxiety Shadow',
        type: 'Beast',
        title: 'Weekly Boss',
        imageUrl: '/character1.png',
        maxHp: 2000,
        currentHp: 2000,
        timeRemaining: '2 days 5 hours',
        resistances: {
            'Mental Wellness': 0.5, // Very weak to
            'Social': 0.8, // Weak to
            'Health': 0.9,
            'Career': 1.5, // Resists
            'Education': 1.5,
            'Finance': 1.0,
            'Hobbies': 1.0,
            'Home': 1.0,
            'Reward': 1.0,
        },
        attack_pattern: [
            {
                name: "Whispers of Doubt",
                description: "If you don't complete a 'Mental Wellness' task for a day, you lose 10 health.",
                trigger: "On no Mental Wellness quest completed",
                icon: Skull,
            },
            {
                name: "Overwhelm",
                description: "If more than 5 tasks are active at once, all tasks feel 1 level harder (no XP/coin change).",
                trigger: "On 5+ active quests",
                icon: Activity,
            }
        ],
        phases: [
            { name: "Lingering Dread", hpThreshold: 1200 },
            { name: "Paralyzing Fear", hpThreshold: 400 },
            { name: "Catharsis", hpThreshold: 0 },
        ],
        rewards: {
            xp: 600,
            coins: 50,
            gems: 10,
        }
    },
];

const collectibleRewards: RewardItem[] = availableCollectibles.map(item => ({
    id: `reward-item-${item.id}`,
    title: item.name,
    description: item.bonus,
    coinCost: (item.rarity === 'Common' ? 500 : item.rarity === 'Rare' ? 1500 : item.rarity === 'Epic' ? 5000 : 15000) + Math.floor(Math.random() * 100),
    icon: item.icon,
    category: 'Item',
    levelRequirement: item.rarity === 'Common' ? 1 : item.rarity === 'Rare' ? 10 : item.rarity === 'Epic' ? 25 : 50,
    item: item,
}));


export const mockRewards: RewardItem[] = [
    { id: 'reward-1', title: 'Watch a Movie', description: 'Relax and watch one movie.', coinCost: 200, icon: Film, category: 'Entertainment', levelRequirement: 5, redeemLimit: 1, redeemPeriod: 'weekly' },
    { id: 'reward-2', title: 'Gaming Session', description: 'Play video games for one hour.', coinCost: 150, icon: Gamepad2, category: 'Entertainment', levelRequirement: 1, redeemLimit: 2, redeemPeriod: 'daily' },
    { id: 'reward-3', title: 'Order Takeout', description: 'Get your favorite food delivered.', coinCost: 300, icon: Pizza, category: 'Treat', levelRequirement: 10, redeemLimit: 2, redeemPeriod: 'weekly' },
    { id: 'reward-4', title: 'Sleep In', description: 'Skip your morning alarm, one time.', coinCost: 400, icon: Film, category: 'Relaxation', levelRequirement: 15, redeemLimit: 1, redeemPeriod: 'monthly' },
    { id: 'reward-5', title: 'Social Media Hour', description: 'One hour of guilt-free scrolling.', coinCost: 100, icon: Gamepad2, category: 'Entertainment', levelRequirement: 1, redeemLimit: 3, redeemPeriod: 'daily' },
    { id: 'reward-6', title: 'Your Favorite Snack', description: 'Indulge in a tasty treat.', coinCost: 50, icon: Pizza, category: 'Treat', levelRequirement: 1 },
    { id: 'gem-reward-1', title: 'Rare Avatar Frame', description: 'An exclusive frame for your avatar.', gemCost: 25, icon: Image, category: 'Item', levelRequirement: 10 },
    { id: 'gem-reward-2', title: 'Boss Fight Bonus', description: '+25% damage against the next boss.', gemCost: 50, icon: Zap, category: 'Boost', levelRequirement: 20, redeemLimit: 1, redeemPeriod: 'weekly' },
    { id: 'gem-reward-3', title: 'Common Loot Box', description: 'A chance to get common items or currency.', gemCost: 10, icon: Box, category: 'Item', levelRequirement: 5 },
    { id: 'coin-reward-1', title: 'Legendary Loot Box', description: 'Guaranteed rare item, with a chance for legendary!', coinCost: 1000, icon: Box, category: 'Item', levelRequirement: 25, redeemLimit: 1, redeemPeriod: 'weekly' },
    { id: 'gem-reward-4', title: 'Character Rename Token', description: 'Change your adventurer\'s name.', gemCost: 100, icon: Star, category: 'Item', levelRequirement: 1 },
    ...collectibleRewards
];

export const weeklyChartData = [
  { day: 'Mon', tasks: 3, xp: 90 },
  { day: 'Tue', tasks: 4, xp: 150 },
  { day: 'Wed', tasks: 2, xp: 70 },
  { day: 'Thu', tasks: 5, xp: 200 },
  { day: 'Fri', tasks: 4, xp: 160 },
  { day: 'Sat', tasks: 1, xp: 30 },
  { day: 'Sun', tasks: 2, xp: 60 },
];

export const streakDays = Array.from({ length: 35 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (34 - i));
    const level = Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
    return {
      date: date.toISOString().split('T')[0],
      level: level,
    };
});

export const habitTrackerSystem = {
    "habits": {
      "schema": {
        "id": "string",
        "userId": "string",
        "title": "string",
        "description": "string",
        "icon": "Component",
        "color": "string",
        "category": "enum",
        "frequency": "object",
        "difficulty": "enum",
        "rewards": "object",
        "tracking": "object",
        "reminders": "array",
        "streaks": "object",
        "metadata": "object",
        "isActive": "boolean",
        "isPaused": "boolean",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      "categories": [
        {
          "id": "health",
          "name": "Health & Fitness",
          "icon": Dumbbell,
          "color": "#EF4444",
          "subcategories": [
            {
              "id": "exercise",
              "name": "Exercise",
              "icon": Run,
              "templates": [
                {
                  "id": "morning_run",
                  "title": "Morning Run",
                  "description": "Run for 30 minutes",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": Run,
                  "defaultReminders": ["07:00"],
                  "stackableBefore": ["shower", "breakfast"],
                  "stackableAfter": ["wake_up", "meditation"]
                },
                {
                  "id": "workout",
                  "title": "Gym Workout",
                  "description": "Complete workout routine",
                  "suggestedFrequency": "custom",
                  "frequencyDays": [1, 3, 5],
                  "difficulty": "Hard",
                  "icon": Dumbbell
                },
                {
                  "id": "yoga",
                  "title": "Yoga Practice",
                  "description": "20 minutes of yoga",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Sprout
                },
                {
                  "id": "stretching",
                  "title": "Stretching",
                  "description": "10-minute stretch routine",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Rocket
                }
              ]
            },
            {
              "id": "nutrition",
              "name": "Nutrition",
              "icon": Leaf,
              "templates": [
                {
                  "id": "drink_water",
                  "title": "Drink 8 Glasses of Water",
                  "description": "Stay hydrated throughout the day",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Droplet,
                  "trackableMetric": {
                    "type": "counter",
                    "unit": "glasses",
                    "target": 8,
                    "min": 0,
                    "max": 20
                  }
                },
                {
                  "id": "healthy_breakfast",
                  "title": "Eat Healthy Breakfast",
                  "description": "Start the day with nutrition",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Sun
                },
                {
                  "id": "no_junk_food",
                  "title": "Avoid Junk Food",
                  "description": "No processed or fast food",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": XSquare,
                  "isNegativeHabit": true
                },
                {
                  "id": "vitamins",
                  "title": "Take Vitamins",
                  "description": "Daily vitamin supplement",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Shield
                }
              ]
            },
            {
              "id": "sleep",
              "name": "Sleep",
              "icon": Bed,
              "templates": [
                {
                  "id": "sleep_before_11",
                  "title": "Sleep Before 11 PM",
                  "description": "Get to bed early",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": Moon,
                  "trackableMetric": {
                    "type": "time",
                    "targetTime": "23:00"
                  }
                },
                {
                  "id": "8_hours_sleep",
                  "title": "Sleep 8 Hours",
                  "description": "Get quality rest",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": Bed,
                  "trackableMetric": {
                    "type": "duration",
                    "unit": "hours",
                    "target": 8
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "mindfulness",
          "name": "Mindfulness & Mental Health",
          "icon": Brain,
          "color": "#8B5CF6",
          "subcategories": [
            {
              "id": "meditation",
              "name": "Meditation",
              "icon": Smile,
              "templates": [
                {
                  "id": "morning_meditation",
                  "title": "Morning Meditation",
                  "description": "10 minutes of mindfulness",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Smile,
                  "trackableMetric": {
                    "type": "duration",
                    "unit": "minutes",
                    "target": 10
                  },
                  "integrations": {
                    "soundscape": "meditation_zen",
                    "linkedQuest": true
                  }
                },
                {
                  "id": "breathing_exercise",
                  "title": "Breathing Exercise",
                  "description": "5 minutes of deep breathing",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Wind,
                  "integrations": {
                    "breathingExercise": "box_breathing"
                  }
                }
              ]
            },
            {
              "id": "journaling",
              "name": "Journaling",
              "icon": BookCopy,
              "templates": [
                {
                  "id": "morning_journal",
                  "title": "Morning Pages",
                  "description": "Write 3 pages first thing",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": BookOpen,
                  "integrations": {
                    "journalEntry": true
                  }
                },
                {
                  "id": "gratitude",
                  "title": "Gratitude Journal",
                  "description": "Write 3 things you're grateful for",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Heart
                },
                {
                  "id": "evening_reflection",
                  "title": "Evening Reflection",
                  "description": "Reflect on the day",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Moon
                }
              ]
            },
            {
              "id": "mental_health",
              "name": "Mental Health",
              "icon": Heart,
              "templates": [
                {
                  "id": "no_social_media",
                  "title": "Social Media Free Hour",
                  "description": "1 hour without social media",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": XSquare,
                  "isNegativeHabit": true
                },
                {
                  "id": "digital_sunset",
                  "title": "Digital Sunset",
                  "description": "No screens 1 hour before bed",
                  "suggestedFrequency": "daily",
                  "difficulty": "Hard",
                  "icon": Moon
                },
                {
                  "id": "affirmations",
                  "title": "Daily Affirmations",
                  "description": "Recite positive affirmations",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Sparkles
                }
              ]
            }
          ]
        },
        {
          "id": "productivity",
          "name": "Productivity & Learning",
          "icon": BookOpen,
          "color": "#F59E0B",
          "subcategories": [
            {
              "id": "learning",
              "name": "Learning",
              "icon": BookCopy,
              "templates": [
                {
                  "id": "read_30min",
                  "title": "Read for 30 Minutes",
                  "description": "Daily reading habit",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": BookOpen,
                  "trackableMetric": {
                    "type": "duration",
                    "unit": "minutes",
                    "target": 30
                  }
                },
                {
                  "id": "learn_language",
                  "title": "Language Practice",
                  "description": "Practice new language",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": MessageCircle
                },
                {
                  "id": "online_course",
                  "title": "Online Course Module",
                  "description": "Complete one lesson",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": Code
                }
              ]
            },
            {
              "id": "work",
              "name": "Work Habits",
              "icon": Briefcase,
              "templates": [
                {
                  "id": "deep_work",
                  "title": "Deep Work Session",
                  "description": "2 hours of focused work",
                  "suggestedFrequency": "weekdays",
                  "difficulty": "Hard",
                  "icon": Target,
                  "integrations": {
                    "pomodoro": true,
                    "soundscape": "deep_work"
                  }
                },
                {
                  "id": "inbox_zero",
                  "title": "Inbox Zero",
                  "description": "Clear email inbox",
                  "suggestedFrequency": "weekdays",
                  "difficulty": "Medium",
                  "icon": CheckSquare
                },
                {
                  "id": "plan_tomorrow",
                  "title": "Plan Tomorrow",
                  "description": "Set up tomorrow's tasks",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": CalendarIcon
                }
              ]
            },
            {
              "id": "creativity",
              "name": "Creative Practices",
              "icon": Paintbrush,
              "templates": [
                {
                  "id": "creative_time",
                  "title": "Creative Hour",
                  "description": "Work on creative project",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": Paintbrush
                },
                {
                  "id": "write",
                  "title": "Writing Practice",
                  "description": "Write 500 words",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": BookCopy,
                  "trackableMetric": {
                    "type": "counter",
                    "unit": "words",
                    "target": 500
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "social",
          "name": "Social & Relationships",
          "icon": Handshake,
          "color": "#EC4899",
          "subcategories": [
            {
              "id": "relationships",
              "name": "Relationships",
              "icon": Users,
              "templates": [
                {
                  "id": "call_family",
                  "title": "Call Family",
                  "description": "Stay connected with loved ones",
                  "suggestedFrequency": "weekly",
                  "difficulty": "Easy",
                  "icon": Phone
                },
                {
                  "id": "quality_time",
                  "title": "Quality Time with Partner",
                  "description": "Dedicated time together",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Heart
                },
                {
                  "id": "reach_out",
                  "title": "Reach Out to Friend",
                  "description": "Message or call a friend",
                  "suggestedFrequency": "custom",
                  "frequencyDays": [0, 3, 6],
                  "difficulty": "Easy",
                  "icon": Handshake
                }
              ]
            },
            {
              "id": "kindness",
              "name": "Acts of Kindness",
              "icon": Sparkles,
              "templates": [
                {
                  "id": "compliment",
                  "title": "Give a Genuine Compliment",
                  "description": "Make someone's day",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": MessageCircle
                },
                {
                  "id": "help_someone",
                  "title": "Help Someone",
                  "description": "Do something helpful",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Handshake
                }
              ]
            }
          ]
        },
        {
          "id": "lifestyle",
          "name": "Lifestyle & Home",
          "icon": HomeIcon,
          "color": "#10B981",
          "subcategories": [
            {
              "id": "morning_routine",
              "name": "Morning Routine",
              "icon": Sun,
              "templates": [
                {
                  "id": "make_bed",
                  "title": "Make Your Bed",
                  "description": "Start the day with a win",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Bed,
                  "stackableAfter": ["wake_up"]
                },
                {
                  "id": "morning_routine_complete",
                  "title": "Complete Morning Routine",
                  "description": "Full morning ritual",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": Sun,
                  "isRoutine": true,
                  "routineSteps": ["wake_up", "make_bed", "meditation", "exercise", "shower", "breakfast"]
                }
              ]
            },
            {
              "id": "cleaning",
              "name": "Cleaning & Organization",
              "icon": HomeIcon,
              "templates": [
                {
                  "id": "tidy_space",
                  "title": "Tidy Workspace",
                  "description": "10-minute cleanup",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Briefcase
                },
                {
                  "id": "deep_clean",
                  "title": "Deep Clean Room",
                  "description": "Thorough cleaning",
                  "suggestedFrequency": "weekly",
                  "difficulty": "Medium",
                  "icon": HomeIcon
                },
                {
                  "id": "laundry",
                  "title": "Do Laundry",
                  "description": "Wash and fold clothes",
                  "suggestedFrequency": "weekly",
                  "difficulty": "Easy",
                  "icon": Shirt
                }
              ]
            },
            {
              "id": "hobbies",
              "name": "Hobbies & Fun",
              "icon": Gamepad2,
              "templates": [
                {
                  "id": "hobby_time",
                  "title": "Hobby Time",
                  "description": "Engage in favorite hobby",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": Target
                },
                {
                  "id": "music_practice",
                  "title": "Music Practice",
                  "description": "Practice instrument",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": Music
                }
              ]
            }
          ]
        },
        {
          "id": "finance",
          "name": "Finance & Career",
          "icon": Wallet,
          "color": "#6366F1",
          "subcategories": [
            {
              "id": "money",
              "name": "Financial Habits",
              "icon": PiggyBank,
              "templates": [
                {
                  "id": "track_expenses",
                  "title": "Track Daily Expenses",
                  "description": "Log all spending",
                  "suggestedFrequency": "daily",
                  "difficulty": "Easy",
                  "icon": BookCopy
                },
                {
                  "id": "save_money",
                  "title": "Save $10",
                  "description": "Daily savings goal",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": PiggyBank,
                  "trackableMetric": {
                    "type": "currency",
                    "unit": "USD",
                    "target": 10
                  }
                },
                {
                  "id": "review_budget",
                  "title": "Review Budget",
                  "description": "Check financial status",
                  "suggestedFrequency": "weekly",
                  "difficulty": "Easy",
                  "icon": Wallet
                }
              ]
            },
            {
              "id": "career",
              "name": "Career Development",
              "icon": Briefcase,
              "templates": [
                {
                  "id": "networking",
                  "title": "Professional Networking",
                  "description": "Connect with colleagues",
                  "suggestedFrequency": "weekly",
                  "difficulty": "Medium",
                  "icon": Handshake
                },
                {
                  "id": "skill_development",
                  "title": "Skill Development",
                  "description": "Learn job-related skill",
                  "suggestedFrequency": "daily",
                  "difficulty": "Medium",
                  "icon": Target
                }
              ]
            }
          ]
        },
        {
          "id": "custom",
          "name": "Custom Habits",
          "icon": Settings,
          "color": "#6B7280",
          "subcategories": []
        }
      ]
    },
    "frequencyTypes": [
      {
        "id": "daily",
        "name": "Every Day",
        "icon": "📅",
        "description": "Complete this habit every single day",
        "resetTime": "00:00",
        "config": {
          "type": "daily",
          "daysOfWeek": [0, 1, 2, 3, 4, 5, 6]
        }
      },
      {
        "id": "weekdays",
        "name": "Weekdays Only",
        "icon": "💼",
        "description": "Monday through Friday",
        "config": {
          "type": "custom",
          "daysOfWeek": [1, 2, 3, 4, 5]
        }
      },
      {
        "id": "weekends",
        "name": "Weekends Only",
        "icon": "🎉",
        "description": "Saturday and Sunday",
        "config": {
          "type": "custom",
          "daysOfWeek": [0, 6]
        }
      },
      {
        "id": "weekly",
        "name": "Once a Week",
        "icon": "📆",
        "description": "Complete once per week",
        "config": {
          "type": "weekly",
          "timesPerWeek": 1
        }
      },
      {
        "id": "custom_days",
        "name": "Specific Days",
        "icon": "🗓️",
        "description": "Choose which days of the week",
        "config": {
          "type": "custom",
          "daysOfWeek": []
        }
      },
      {
        "id": "x_times_week",
        "name": "X Times per Week",
        "icon": "🔢",
        "description": "Flexible frequency per week",
        "config": {
          "type": "flexible",
          "timesPerWeek": 3,
          "minPerWeek": null,
          "maxPerWeek": null
        }
      },
      {
        "id": "every_x_days",
        "name": "Every X Days",
        "icon": "🔄",
        "description": "Repeat every certain number of days",
        "config": {
          "type": "interval",
          "dayInterval": 2
        }
      },
      {
        "id": "monthly",
        "name": "Monthly",
        "icon": "📅",
        "description": "Once per month",
        "config": {
          "type": "monthly",
          "dayOfMonth": 1
        }
      }
    ],
    "difficultyLevels": [
      {
        "id": "easy",
        "name": "Easy",
        "icon": "🟢",
        "color": "#10B981",
        "xpMultiplier": 1.0,
        "description": "Simple habits that take minimal effort",
        "estimatedTime": "< 5 minutes",
        "failurePenalty": {
          "hp": 5,
          "coins": 0
        },
        "completionReward": {
          "xp": 10,
          "coins": 5
        }
      },
      {
        "id": "medium",
        "name": "Medium",
        "icon": "🟡",
        "color": "#F59E0B",
        "xpMultiplier": 1.5,
        "description": "Moderate habits requiring consistent effort",
        "estimatedTime": "5-30 minutes",
        "failurePenalty": {
          "hp": 10,
          "coins": 5
        },
        "completionReward": {
          "xp": 25,
          "coins": 15
        }
      },
      {
        "id": "hard",
        "name": "Hard",
        "icon": "🔴",
        "color": "#EF4444",
        "xpMultiplier": 2.0,
        "description": "Challenging habits requiring dedication",
        "estimatedTime": "30+ minutes",
        "failurePenalty": {
          "hp": 15,
          "coins": 10
        },
        "completionReward": {
          "xp": 50,
          "coins": 30
        }
      }
    ],
    "streakSystem": {
      "types": [
        {
          "id": "current_streak",
          "name": "Current Streak",
          "description": "Consecutive days with habit completion",
          "icon": "🔥"
        },
        {
          "id": "longest_streak",
          "name": "Longest Streak",
          "description": "Personal best consecutive days",
          "icon": "🏆"
        },
        {
          "id": "total_completions",
          "name": "Total Completions",
          "description": "All-time completion count",
          "icon": "✅"
        },
        {
          "id": "perfect_weeks",
          "name": "Perfect Weeks",
          "description": "Weeks with 100% completion",
          "icon": "⭐"
        }
      ],
      "milestones": [
        {
          "days": 3,
          "name": "Getting Started",
          "icon": "🌱",
          "reward": {
            "xp": 50,
            "coins": 25,
            "badge": "habit_starter"
          }
        },
        {
          "days": 7,
          "name": "One Week Warrior",
          "icon": "⚔️",
          "reward": {
            "xp": 100,
            "coins": 50,
            "badge": "week_warrior"
          }
        },
        {
          "days": 14,
          "name": "Two Week Champion",
          "icon": "🛡️",
          "reward": {
            "xp": 200,
            "coins": 100,
            "badge": "fortnight_champion"
          }
        },
        {
          "days": 21,
          "name": "Habit Former",
          "icon": "🧬",
          "reward": {
            "xp": 300,
            "coins": 150,
            "gems": 1,
            "badge": "habit_former",
            "note": "Research shows 21 days to form a habit!"
          }
        },
        {
          "days": 30,
          "name": "Month Master",
          "icon": "👑",
          "reward": {
            "xp": 500,
            "coins": 250,
            "gems": 2,
            "badge": "month_master",
            "item": "streak_protector"
          }
        },
        {
          "days": 66,
          "name": "Habit Automator",
          "icon": "🤖",
          "reward": {
            "xp": 1000,
            "coins": 500,
            "gems": 5,
            "badge": "habit_automator",
            "note": "Average time to automate a habit!"
          }
        },
        {
          "days": 100,
          "name": "Century Club",
          "icon": "💯",
          "reward": {
            "xp": 2000,
            "coins": 1000,
            "gems": 10,
            "badge": "century_club",
            "title": "The Consistent"
          }
        },
        {
          "days": 365,
          "name": "Year Legend",
          "icon": "🌟",
          "reward": {
            "xp": 10000,
            "coins": 5000,
            "gems": 50,
            "badge": "year_legend",
            "title": "Master of Discipline",
            "item": "legendary_habit_crown"
          }
        }
      ],
      "streakProtection": {
        "enabled": true,
        "types": [
          {
            "id": "freeze",
            "name": "Streak Freeze",
            "description": "Protect your streak for 1 day",
            "icon": "🧊",
            "cost": {
              "coins": 100
            },
            "maxPerMonth": 2,
            "unlockLevel": 5
          },
          {
            "id": "recovery",
            "name": "Streak Recovery",
            "description": "Restore a broken streak within 24 hours",
            "icon": "⏮️",
            "cost": {
              "gems": 3
            },
            "timeWindow": 86400,
            "unlockLevel": 10
          },
          {
            "id": "vacation_mode",
            "name": "Vacation Mode",
            "description": "Pause all habits for up to 7 days",
            "icon": "🏖️",
            "cost": {
              "gems": 5
            },
            "maxDuration": 7,
            "unlockLevel": 15
          }
        ]
      },
      "bonuses": {
        "weekStreak": {
          "multiplier": 1.2,
          "message": "🔥 Week streak bonus! +20% XP"
        },
        "monthStreak": {
          "multiplier": 1.5,
          "message": "💎 Month streak bonus! +50% XP"
        },
        "perfectWeek": {
          "bonus": {
            "xp": 200,
            "coins": 100
          },
          "message": "⭐ Perfect week! Bonus rewards unlocked!"
        }
      }
    },
    "habitStacking": {
      "enabled": true,
      "description": "Chain habits together for powerful routines",
      "chains": {
        "schema": {
          "id": "string",
          "name": "string",
          "description": "string",
          "icon": "Component",
          "habits": "array",
          "order": "array",
          "totalEstimatedTime": "number",
          "bonusXP": "number"
        },
        "templates": [
          {
            "id": "morning_powerup",
            "name": "Morning Power-Up",
            "description": "Ultimate morning routine for winners",
            "icon": Sun,
            "habits": [
              {
                "habitId": "wake_up_early",
                "order": 1,
                "triggerPhrase": "After I wake up"
              },
              {
                "habitId": "make_bed",
                "order": 2,
                "triggerPhrase": "After I make my bed"
              },
              {
                "habitId": "drink_water",
                "order": 3,
                "triggerPhrase": "After I drink water"
              },
              {
                "habitId": "meditation",
                "order": 4,
                "triggerPhrase": "After I meditate"
              },
              {
                "habitId": "exercise",
                "order": 5,
                "triggerPhrase": "After I exercise"
              }
            ],
            "bonusXP": 100,
            "bonusMessage": "Complete chain bonus!"
          },
          {
            "id": "evening_winddown",
            "name": "Evening Wind-Down",
            "description": "Peaceful transition to sleep",
            "icon": Moon,
            "habits": [
              {
                "habitId": "digital_sunset",
                "order": 1,
                "triggerPhrase": "After I put away devices"
              },
              {
                "habitId": "evening_reflection",
                "order": 2,
                "triggerPhrase": "After I journal"
              },
              {
                "habitId": "skincare",
                "order": 3,
                "triggerPhrase": "After I complete skincare"
              },
              {
                "habitId": "reading",
                "order": 4,
                "triggerPhrase": "After I read"
              },
              {
                "habitId": "sleep_before_11",
                "order": 5,
                "triggerPhrase": "I will sleep"
              }
            ],
            "bonusXP": 75
          },
          {
            "id": "productivity_flow",
            "name": "Productivity Flow",
            "description": "Deep work preparation",
            "icon": Target,
            "habits": [
              {
                "habitId": "plan_day",
                "order": 1,
                "triggerPhrase": "After I plan my day"
              },
              {
                "habitId": "tidy_workspace",
                "order": 2,
                "triggerPhrase": "After I tidy my workspace"
              },
              {
                "habitId": "focus_music",
                "order": 3,
                "triggerPhrase": "After I start focus music"
              },
              {
                "habitId": "deep_work",
                "order": 4,
                "triggerPhrase": "I will begin deep work"
              }
            ],
            "bonusXP": 50
          }
        ]
      },
      "aiSuggestions": {
        "enabled": true,
        "analyzeAfterDays": 7,
        "suggestStacksBasedOn": [
          "completionTimePatterns",
          "successRateCorrelations",
          "categoryGroupings",
          "researchBasedPairings"
        ]
      }
    },
    "trackingModes": [
      {
        "id": "binary",
        "name": "Yes/No (Did it or didn't)",
        "icon": "✓",
        "description": "Simple completion tracking",
        "ui": "checkbox"
      },
      {
        "id": "counter",
        "name": "Counter",
        "icon": "#️⃣",
        "description": "Track quantity (e.g., glasses of water, pages read)",
        "ui": "number_input",
        "config": {
          "unit": "string",
          "target": "number",
          "min": 0,
          "max": null
        }
      },
      {
        "id": "duration",
        "name": "Duration",
        "icon": "⏱️",
        "description": "Track time spent (e.g., meditation minutes)",
        "ui": "time_picker",
        "config": {
          "unit": "minutes",
          "target": "number"
        }
      },
      {
        "id": "time",
        "name": "Target Time",
        "icon": "🕐",
        "description": "Complete by specific time (e.g., sleep by 11pm)",
        "ui": "time_input",
        "config": {
          "targetTime": "string"
        }
      },
      {
        "id": "rating",
        "name": "Quality Rating",
        "icon": "⭐",
        "description": "Rate quality/intensity (1-5 stars)",
        "ui": "star_rating",
        "config": {
          "min": 1,
          "max": 5,
          "minToCount": 3
        }
      },
      {
        "id": "mood",
        "name": "Mood Tracker",
        "icon": "😊",
        "description": "Track emotional state",
        "ui": "emoji_selector",
        "config": {
          "options": ["😞", "😐", "🙂", "😊", "🤩"]
        }
      }
    ],
    "reminders": {
      "types": [
        {
          "id": "time_based",
          "name": "Specific Time",
          "description": "Get reminded at exact time",
          "config": {
            "time": "string",
            "daysOfWeek": "array"
          }
        },
        {
          "id": "location_based",
          "name": "Location Trigger",
          "description": "Remind when arriving/leaving location",
          "requiresPermission": "location",
          "config": {
            "latitude": "number",
            "longitude": "number",
            "radius": 100,
            "trigger": "arrive|leave"
          }
        },
        {
          "id": "habit_trigger",
          "name": "After Another Habit",
          "description": "Remind after completing another habit",
          "config": {
            "triggerHabitId": "string",
            "delayMinutes": 0
          }
        },
        {
          "id": "smart_time",
          "name": "Smart Timing (AI)",
          "description": "AI suggests optimal time based on patterns",
          "usesAI": true
        }
      ],
      "notificationStyles": [
        {
          "id": "gentle",
          "name": "Gentle Reminder",
          "tone": "soft",
          "examples": [
            "Hey! Just a friendly reminder about {habit} 🌟",
            "Whenever you're ready: {habit} ✨"
          ]
        },
        {
          "id": "motivational",
          "name": "Motivational",
          "tone": "energetic",
          "examples": [
            "Let's crush {habit} today! 💪",
            "You've got this! Time for {habit} 🔥"
          ]
        },
        {
          "id": "accountability",
          "name": "Accountability",
          "tone": "firm",
          "examples": [
            "Your {streakDays}-day streak is counting on you for {habit}!",
            "Don't forget to complete {habit} today."
          ]
        },
        {
          "id": "gamified",
          "name": "Gamified",
          "tone": "playful",
          "examples": [
            "A new quest awaits: {habit}! Accept? 📜",
            "Boss Battle: Defeat procrastination by completing {habit}!"
          ]
        },
        {
          "id": "minimalist",
          "name": "Minimalist",
          "tone": "concise",
          "examples": [
            "Reminder: {habit}",
            "{habit}"
          ]
        }
      ]
    }
  }
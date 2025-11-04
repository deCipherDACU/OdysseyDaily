

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { mockUser as initialUser, mockTasks as initialTasks, mockBosses, mockAchievements } from '@/lib/data';
import type { User, RewardItem, Task, Boss, DungeonCrawl, JournalEntry, WeeklyReview, ChatMessage, Item, Equipment, Notification, Debuff, Achievement, Note } from '@/lib/types';
import { xpForLevel, calculateTaskXP, calculateTaskCoins } from '@/lib/formulas';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, startOfWeek, startOfMonth, isWithinInterval, subHours, isSameDay, getWeek, getYear, subDays, differenceInDays, differenceInSeconds } from 'date-fns';
import { useUser as useFirebaseUser } from '@/firebase/auth/use-user';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

type UserContextType = {
  user: User | null;
  tasks: Task[];
  boss: Boss | null;
  dungeons: DungeonCrawl[];
  journalEntries: JournalEntry[];
  weeklyReviews: WeeklyReview[];
  notes: Note[] | null;
  loading: boolean;
  setUser: (user: User | ((prevUser: User | null) => User | null)) => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => boolean;
  addGems: (amount: number) => boolean;
  redeemReward: (reward: RewardItem) => void;
  getRedeemedCount: (reward: RewardItem) => number;
  addTask: (task: Omit<Task, 'id' | 'completed'>, silent?: boolean) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  deleteJournalEntry: (entryId: string) => void;
  incrementJournalDeletionCount: () => void;
  levelUpSkill: (treeName: string, skillName: string) => void;
  setBoss: (boss: Boss | ((prevBoss: Boss | null) => Boss | null)) => void;
  dealBossDamage: (task: Task) => void;
  addDungeon: (dungeon: Omit<DungeonCrawl, 'id' | 'completed'>) => void;
  updateDungeon: (updatedDungeon: DungeonCrawl) => void;
  toggleChallengeCompleted: (dungeonId: string, challengeId: string) => void;
  startDungeon: (dungeonId: string) => void;
  completeDungeon: (dungeonId: string) => { timeTaken: number; baseXp: number; bonusXp: number } | null;
  addWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'date' | 'weekNumber' | 'year'>) => void;
  addCustomReward: (reward: Omit<RewardItem, 'id' | 'levelRequirement' | 'category' | 'icon'>) => void;
  deleteCustomReward: (rewardId: string) => void;
  equipItem: (item: Item) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => void;
  updateNote: (updatedNote: Partial<Note> & { id: string }) => void;
  deleteNote: (noteId: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, loading: authLoading } = useFirebaseUser();
  const { firestore } = useFirestore();
  const [user, setUserState] = useState<User | null>(null);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [boss, setBossState] = useState<Boss | null>(null);
  const [dungeons, setDungeonsState] = useState<DungeonCrawl[]>([]);
  const [journalEntries, setJournalEntriesState] = useState<JournalEntry[]>([]);
  const [weeklyReviews, setWeeklyReviewsState] = useState<WeeklyReview[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();

  const notesCollectionRef = useMemoFirebase(
    () => (firestore && firebaseUser ? collection(firestore, `users/${firebaseUser.uid}/notes`) : null),
    [firestore, firebaseUser]
  );
  const { data: notes, isLoading: notesLoading } = useCollection<Note>(notesCollectionRef);

  const saveData = useCallback((data: { user?: User, tasks?: Task[], boss?: Boss, dungeons?: DungeonCrawl[], journalEntries?: JournalEntry[], weeklyReviews?: WeeklyReview[] }) => {
    const localDataKey = firebaseUser ? `lifequest-data-${firebaseUser.uid}` : 'lifequest-data-guest';
    try {
      const currentDataRaw = localStorage.getItem(localDataKey);
      const currentData = currentDataRaw ? JSON.parse(currentDataRaw) : {};
      const newData = { ...currentData, ...data };
      localStorage.setItem(localDataKey, JSON.stringify(newData));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [firebaseUser]);
  
  const setUser = useCallback((userOrFn: User | ((prevUser: User | null) => User | null)) => {
    setUserState(currentUser => {
        const newUser = typeof userOrFn === 'function' ? userOrFn(currentUser) : userOrFn;
        if (newUser) saveData({ user: newUser });
        return newUser;
    });
  }, [saveData]);
  
  const checkAndUnlockAchievements = useCallback((currentUser: User, currentNotes: Note[] | null): number => {
    const newlyUnlocked: Achievement[] = [];
    const userAchievements = currentUser.achievements || [];
    let xpGained = 0;

    const noteCount = currentNotes?.length ?? 0;

    const achievementChecks: { [key: string]: () => boolean } = {
        'scribe': () => noteCount >= 1,
        'archivist': () => noteCount >= 10,
        'loremaster': () => noteCount >= 50,
        'chronicler': () => noteCount >= 100,
        'organizer': () => new Set(currentNotes?.flatMap(n => n.tags || [])).size >= 5,
        'categorizer': () => new Set(currentNotes?.map(n => n.category)).size >= 5,
        'pinner': () => currentNotes?.some(n => n.isPinned) ?? false,
    };

    mockAchievements.forEach(achievement => {
        if (!userAchievements.find(ua => ua.id === achievement.id)?.unlocked) {
            if (achievementChecks[achievement.id] && achievementChecks[achievement.id]()) {
                newlyUnlocked.push({ ...achievement, unlocked: true, unlockedDate: new Date() });
            }
        }
    });

    if (newlyUnlocked.length > 0) {
        setUser(u => {
            if (!u) return null;
            const updatedAchievements = [...(u.achievements || mockAchievements.map(a => ({...a, unlocked: false})))];
            
            newlyUnlocked.forEach(unlockedAch => {
                const index = updatedAchievements.findIndex(a => a.id === unlockedAch.id);
                if (index !== -1) {
                    updatedAchievements[index] = { ...updatedAchievements[index], ...unlockedAch };
                }
                xpGained += unlockedAch.xp || 0;

                setTimeout(() => {
                    toast({
                        title: 'Achievement Unlocked!',
                        description: `You've unlocked "${unlockedAch.title}"`,
                        variant: 'success',
                    });
                }, 500);
            });

            return { ...u, achievements: updatedAchievements };
        });
    }

    return xpGained;
  }, [toast, setUser]);

  useEffect(() => {
    if (authLoading) return;

    if (!isDataLoaded) {
        const loggedInUser = firebaseUser;
        const localDataKey = loggedInUser ? `lifequest-data-${loggedInUser.uid}` : 'lifequest-data-guest';
        
        try {
            const savedDataRaw = localStorage.getItem(localDataKey);
            let savedData;
            if (savedDataRaw) {
                savedData = JSON.parse(savedDataRaw);
            }

            const userToLoad = savedData?.user || {
                ...initialUser,
                uid: loggedInUser?.uid || 'guest-user',
                name: loggedInUser?.displayName || initialUser.name,
                avatarUrl: loggedInUser?.photoURL || initialUser.avatarUrl,
                achievements: mockAchievements.map(a => ({ ...a, unlocked: false })),
            };
            
            setUserState(userToLoad);
            setTasksState(savedData?.tasks || initialTasks);
            setDungeonsState(savedData?.dungeons || []);
            setJournalEntriesState(savedData?.journalEntries || []);
            setWeeklyReviewsState(savedData?.weeklyReviews || []);
            
            const currentWeek = getWeek(new Date()).toString();
            let bossToLoad = savedData?.boss;
            if (!bossToLoad || bossToLoad.lastDefeated === currentWeek) {
                const weekIndex = getWeek(new Date()) % mockBosses.length;
                bossToLoad = { ...mockBosses[weekIndex], currentHp: mockBosses[weekIndex].maxHp };
            }
            setBossState(bossToLoad);
        } catch (error) {
            console.error("Failed to load user data from localStorage", error);
            setUserState(initialUser);
            setTasksState(initialTasks);
        } finally {
            setIsDataLoaded(true);
        }
    }
  }, [firebaseUser, authLoading, isDataLoaded]);

  const setTasks = useCallback((tasksOrFn: Task[] | ((prevTasks: Task[]) => Task[])) => {
    setTasksState(prevTasks => {
        const newTasks = typeof tasksOrFn === 'function' ? tasksOrFn(prevTasks) : tasksOrFn;
        saveData({ tasks: newTasks });
        return newTasks;
    });
  }, [saveData]);

  const setBoss = useCallback((bossOrFn: Boss | ((prevBoss: Boss | null) => Boss | null)) => {
    setBossState(currentBoss => {
        const newBoss = typeof bossOrFn === 'function' ? bossOrFn(currentBoss) : bossOrFn;
        if (newBoss) saveData({ boss: newBoss });
        return newBoss;
    });
  }, [saveData]);

  const setDungeons = useCallback((dungeonsOrFn: DungeonCrawl[] | ((prevDungeons: DungeonCrawl[]) => DungeonCrawl[])) => {
    setDungeonsState(prevDungeons => {
        const newDungeons = typeof dungeonsOrFn === 'function' ? dungeonsOrFn(prevDungeons) : dungeonsOrFn;
        saveData({ dungeons: newDungeons });
        return newDungeons;
    });
  }, [saveData]);

  const setJournalEntries = useCallback((entriesOrFn: JournalEntry[] | ((prevEntries: JournalEntry[]) => JournalEntry[])) => {
    setJournalEntriesState(prevEntries => {
        const newEntries = typeof entriesOrFn === 'function' ? entriesOrFn(prevEntries) : entriesOrFn;
        saveData({ journalEntries: newEntries });
        return newEntries;
    });
  }, [saveData]);

  const setWeeklyReviews = useCallback((reviewsOrFn: WeeklyReview[] | ((prevReviews: WeeklyReview[]) => WeeklyReview[])) => {
    setWeeklyReviewsState(prevReviews => {
        const newReviews = typeof reviewsOrFn === 'function' ? reviewsOrFn(prevReviews) : reviewsOrFn;
        saveData({ weeklyReviews: newReviews });
        return newReviews;
    });
    }, [saveData]);
  
  const addXp = useCallback((amount: number) => {
    setUser(currentUser => {
      if (!currentUser) return currentUser;
  
      let newXp = currentUser.xp + amount;
      let newLevel = currentUser.level;
      let newXpToNextLevel = currentUser.xpToNextLevel;
      let newSkillPoints = currentUser.skillPoints;
  
      if (amount > 0) { // Gaining XP
        while (newLevel < 99 && newXp >= newXpToNextLevel) {
          const xpOver = newXp - newXpToNextLevel;
          newLevel++;
          newSkillPoints += 3; // Grant stat points on level up
          newXp = xpOver;
          newXpToNextLevel = xpForLevel(newLevel + 1);
          setTimeout(() => {
            toast({
              title: "Level Up!",
              description: `Congratulations! You've reached level ${newLevel} and earned 3 stat points!`,
              variant: "levelUp",
            });
          }, 0);
        }
        if (newLevel >= 99) newXp = 0;
      } else { // Losing XP
         while (newXp < 0 && newLevel > 0) {
            const xpForPrevLevel = xpForLevel(newLevel);
            newXp += xpForPrevLevel;
            newLevel--;
            newSkillPoints = Math.max(0, newSkillPoints - 3);
            newXpToNextLevel = xpForPrevLevel;
          }
      }
      return {
        ...currentUser,
        xp: Math.max(0, newXp),
        level: newLevel,
        xpToNextLevel: newXpToNextLevel,
        skillPoints: newSkillPoints,
      };
    });
  }, [toast, setUser]);
  
  const addCoins = useCallback((amount: number): boolean => {
    let success = false;
    setUser(currentUser => {
        if (!currentUser) return currentUser;
        
        if (amount < 0 && currentUser.coins + amount < 0) {
            setTimeout(() => toast({
                title: "Not enough coins!",
                description: "You don't have enough coins for this action.",
                variant: "destructive",
            }), 0);
            success = false;
            return currentUser;
        }

        success = true;
        return { ...currentUser, coins: currentUser.coins + amount };
    });
    return success;
  }, [toast, setUser]);

  const addGems = useCallback((amount: number): boolean => {
    let success = false;
     setUser(currentUser => {
        if (!currentUser) { success = false; return currentUser; };
        if (currentUser.gems + amount < 0) {
            setTimeout(() => toast({ title: "Not enough gems!", variant: "destructive" }), 0);
            success = false;
            return currentUser;
        }
        success = true;
        return { ...currentUser, gems: currentUser.gems + amount };
    });
    return success;
  }, [toast, setUser]);

  const handleNewDay = useCallback((currentUser: User, currentTasks: Task[]) => {
    let healthPenalty = 0;
    
    let activeDebuffs: Debuff[] = [];
    let debuffDamage = 0;
    (currentUser.debuffs || []).forEach(debuff => {
        if (debuff.duration > 1) {
            activeDebuffs.push({ ...debuff, duration: debuff.duration - 1 });
        }
        if (debuff.effect) {
            const effect = debuff.effect(currentUser);
            if (effect.health) {
                debuffDamage += (currentUser.health - effect.health);
            }
        }
    });
    healthPenalty += debuffDamage;

    const updatedTasks = currentTasks.map(task => {
        if (task.type === 'Daily' && !task.completed) {
            healthPenalty += 10;
            return { ...task, streak: 0 };
        }
        if (task.type === 'Daily' && task.completed) {
            return { ...task, completed: false };
        }
        return task;
    });
    setTasks(updatedTasks);

    let newHealth = currentUser.health - healthPenalty;
    const dailyTasksYesterday = currentTasks.filter(t => t.type === 'Daily');
    const allDailiesCompleted = dailyTasksYesterday.every(t => t.completed);

    let newStreak = (allDailiesCompleted && dailyTasksYesterday.length > 0) ? currentUser.streak + 1 : 0;

    let newUser: User = {
        ...currentUser,
        health: newHealth,
        debuffs: activeDebuffs,
        lastLogin: new Date(),
        streak: newStreak,
        longestStreak: Math.max(currentUser.longestStreak, newStreak),
    };
    
    if (newHealth <= 0) {
        const xpPenalty = 100;
        const coinPenalty = 50;
        newUser.xp = Math.max(0, newUser.xp - xpPenalty);
        newUser.coins = Math.max(0, newUser.coins - coinPenalty);
        newUser.health = newUser.maxHealth; // Restore health after penalty
        newUser.debuffs = []; // Clear debuffs on "death"
        setTimeout(() => toast({
            title: "Exhausted!",
            description: `You entered the Penalty Zone! You lost ${xpPenalty} XP and ${coinPenalty} Coins, but are now fully rested.`,
            variant: 'destructive'
        }), 0);
    }

    if (healthPenalty > 0) {
        setTimeout(() => toast({
            title: "Daily Reset",
            description: `You took ${healthPenalty} damage from missed quests and debuffs.`,
            variant: 'destructive'
        }), 0);
    }
    
    setUser(newUser);

  }, [toast, setUser, setTasks]);

  useEffect(() => {
    if (user && isDataLoaded && !isSameDay(new Date(user.lastLogin), new Date())) {
      handleNewDay(user, tasks);
    }
  }, [user, tasks, handleNewDay, isDataLoaded]);


  const getRedeemedCount = useCallback((reward: RewardItem) => {
    if (!user || !reward.redeemLimit || !reward.redeemPeriod) return 0;
    const redeemed = user.redeemedRewards.find(r => r.rewardId === reward.id);
    if (!redeemed) return 0;
    
    const now = new Date();
    let periodStart: Date;
    switch(reward.redeemPeriod) {
        case 'daily': periodStart = startOfDay(now); break;
        case 'weekly': periodStart = startOfWeek(now); break;
        case 'monthly': periodStart = startOfMonth(now); break;
        default: return 0;
    }
    return redeemed.timestamps.filter(ts => new Date(ts) >= periodStart).length;
  }, [user]);

  const redeemReward = useCallback((reward: RewardItem) => {
    if (!user) return;
    const redeemedCount = getRedeemedCount(reward);
    if (reward.redeemLimit && redeemedCount >= reward.redeemLimit) {
        setTimeout(() => toast({ title: 'Redemption Limit Reached', variant: 'destructive' }), 0);
        return;
    }
    if ((reward.gemCost && user.gems < reward.gemCost) || (reward.coinCost && user.coins < reward.coinCost)) {
        setTimeout(() => toast({ title: `Not enough ${reward.gemCost ? 'gems' : 'coins'}!`, variant: 'destructive' }), 0);
        return;
    }
    
    setUser(currentUser => {
       if (!currentUser) return null;
       const updatedUser = { ...currentUser };
       if (reward.gemCost) updatedUser.gems -= reward.gemCost;
       else if (reward.coinCost) updatedUser.coins -= reward.coinCost;
       
       if (reward.item) {
        updatedUser.inventory = [...updatedUser.inventory, reward.item];
       }

       const newRedeemedRewards = [...currentUser.redeemedRewards];
       const redeemedIndex = newRedeemedRewards.findIndex(r => r.rewardId === reward.id);
       if (redeemedIndex > -1) newRedeemedRewards[redeemedIndex].timestamps.push(new Date());
       else newRedeemedRewards.push({ rewardId: reward.id, timestamps: [new Date()] });
       updatedUser.redeemedRewards = newRedeemedRewards;
       
       return updatedUser;
    });

    if (reward.item) {
        setTimeout(() => toast({ title: 'Item Purchased!', description: `${reward.title} has been added to your inventory.`, variant: "newItem" }), 0);
    } else {
        setTimeout(() => toast({ title: 'Reward Redeemed!', variant: "success" }), 0);
    }
  }, [user, getRedeemedCount, toast, setUser]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'completed'>, silent = false) => {
    setTasks((currentTasks) => {
      const newTask: Task = { ...taskData, id: `${Date.now()}-${Math.random()}`, completed: false };
      if (!silent) setTimeout(() => toast({ title: 'Quest Added!', description: `"${newTask.title}" added to your log.`, variant: "success" }), 0);
      return [newTask, ...currentTasks];
    });
  }, [toast, setTasks]);

  const dealBossDamage = useCallback((task: Task) => {
    setBoss(currentBoss => {
      if (!currentBoss || currentBoss.currentHp <= 0) return currentBoss;
      
      const resistance = (currentBoss.resistances && currentBoss.resistances[task.category]) || 1.0;
      
      let baseDamage = 0;
      switch(task.difficulty) {
          case 'Easy': baseDamage = 25; break;
          case 'Medium': baseDamage = 50; break;
          case 'Hard': baseDamage = 100; break;
          default: baseDamage = 0;
      }
      
      const isWeakness = resistance < 1.0;
      const isResistance = resistance > 1.0;
      
      const damage = Math.floor(baseDamage / resistance);

      if (damage <= 0) return currentBoss;

      const newHp = Math.max(0, currentBoss.currentHp - damage);

      setTimeout(() => {
        if (isWeakness) {
            toast({ title: "Critical Hit!", description: `Dealt ${damage} bonus damage!`, variant: "success" });
        } else if (isResistance) {
            toast({ title: "Resisted!", description: `Dealt only ${damage} damage.`, variant: "destructive" });
        } else {
            toast({ title: "Boss Damaged!", description: `Dealt ${damage} damage.`, variant: "default" });
        }
      }, 100);

      if (newHp === 0) {
        setTimeout(() => {
          toast({ title: "Boss Defeated!", description: `You earned ${currentBoss.rewards.xp} XP and ${currentBoss.rewards.coins} Coins!`, variant: "levelUp" });
          addXp(currentBoss.rewards.xp);
          addCoins(currentBoss.rewards.coins);
          addGems(currentBoss.rewards.gems);
        }, 500);
        return { ...currentBoss, currentHp: 0, lastDefeated: getWeek(new Date()).toString() };
      } else {
        return { ...currentBoss, currentHp: newHp };
      }
    });
}, [toast, addXp, addCoins, addGems, setBoss]);

const updateTask = useCallback((updatedTask: Task) => {
  setTasks(currentTasks => {
    const oldTask = currentTasks.find(t => t.id === updatedTask.id);
    const newTasks = currentTasks.map(task => task.id === updatedTask.id ? updatedTask : task);
    
    if (oldTask && !oldTask.completed && updatedTask.completed) {
      if (user) {
        setUser(u => u ? ({ ...u, tasksCompleted: u.tasksCompleted + 1 }) : null);
      }
      dealBossDamage(updatedTask);

      if (updatedTask.type === 'Daily' || updatedTask.type === 'Weekly' || updatedTask.type === 'Monthly') {
        const today = new Date();
        const lastCompleted = updatedTask.lastCompleted ? new Date(updatedTask.lastCompleted) : null;
        let newStreak = updatedTask.streak || 0;

        if (lastCompleted) {
          const daysDifference = differenceInDays(today, lastCompleted);
          if (daysDifference === 1) {
            newStreak++;
          } else if (daysDifference > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        updatedTask.streak = newStreak;
        updatedTask.lastCompleted = today;
      }
    }
    
    return newTasks;
  });
}, [user, setUser, dealBossDamage, setTasks]);


  const deleteTask = useCallback((taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
    setTimeout(() => toast({ title: 'Quest Deleted', variant: "destructive" }), 0);
  }, [toast, setTasks]);

    const incrementJournalDeletionCount = useCallback(() => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const now = new Date();
            const lastDeletion = currentUser.recentJournalDeletions?.lastDeletion;
            let currentCount = currentUser.recentJournalDeletions?.count || 0;
            if (lastDeletion && !isWithinInterval(new Date(lastDeletion), {start: subHours(now, 1), end: now})) currentCount = 0;
            return { ...currentUser, recentJournalDeletions: { count: currentCount + 1, lastDeletion: now } };
        })
    }, [setUser]);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'date'>) => {
    const newEntry: JournalEntry = {
        id: `${Date.now()}-${Math.random()}`,
        date: new Date(),
        ...entry,
    };
    addXp(25);
    addCoins(5);
    setJournalEntries(prev => [newEntry, ...prev]);
    setTimeout(() => toast({ title: "Journal entry saved!", description: "You earned 25 XP and 5 Coins.", variant: "success" }), 0);
  }, [addXp, addCoins, setJournalEntries, toast]);

  const deleteJournalEntry = useCallback((entryId: string) => {
     const entryToDelete = journalEntries.find(entry => entry.id === entryId);
      if (!entryToDelete) return;

      const isRecent = isWithinInterval(new Date(entryToDelete.date), {
          start: subHours(new Date(), 1),
          end: new Date()
      });

      if (isRecent && user) {
          const deletionCount = user.recentJournalDeletions?.count || 0;
          const penaltyMultiplier = Math.pow(2, deletionCount);
          const xpPenalty = 25 * penaltyMultiplier;
          const coinPenalty = 5 * penaltyMultiplier;

          addXp(-xpPenalty);
          addCoins(-coinPenalty);
          incrementJournalDeletionCount();

          setTimeout(() => toast({
              title: "Journal Penalty Applied",
              description: `Entry deleted within an hour. You lost ${xpPenalty} XP and ${coinPenalty} coins.`,
              variant: 'destructive',
          }), 0);
      }
      setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
  }, [journalEntries, user, addXp, addCoins, incrementJournalDeletionCount, setJournalEntries, toast]);

  const levelUpSkill = useCallback((treeName: string, skillName: string) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const tree = currentUser.skillTrees.find(t => t.name === treeName);
        const skill = tree?.skills.find(s => s.name === skillName);
        if (!tree || !skill || currentUser.skillPoints < skill.cost || skill.level >= skill.maxLevel) {
            setTimeout(() => toast({ title: "Cannot upgrade stat!", variant: "destructive" }), 0);
            return currentUser;
        }
        const updatedSkillTrees = currentUser.skillTrees.map(t => t.name === treeName ? { ...t, skills: t.skills.map(s => s.name === skillName ? { ...s, level: s.level + 1 } : s) } : t);
        setTimeout(() => toast({ title: "Stat Upgraded!", variant: "success" }), 0);
        return { ...currentUser, skillPoints: currentUser.skillPoints - skill.cost, skillTrees: updatedSkillTrees };
    });
}, [toast, setUser]);

const addDungeon = useCallback((dungeonData: Omit<DungeonCrawl, 'id' | 'completed'>) => {
    setDungeons(currentDungeons => {
        const newDungeon: DungeonCrawl = {
            ...dungeonData,
            id: `${Date.now()}-${Math.random()}`,
            completed: false,
        };
        setTimeout(() => toast({ title: "Special Quest Started!", description: `You have entered "${newDungeon.title}".`, variant: "questComplete" }), 0);
        return [newDungeon, ...currentDungeons];
    });
}, [toast, setDungeons]);

const updateDungeon = useCallback((updatedDungeon: DungeonCrawl) => {
    setDungeons(currentDungeons =>
        currentDungeons.map(d => d.id === updatedDungeon.id ? updatedDungeon : d)
    );
}, [setDungeons]);

const toggleChallengeCompleted = useCallback((dungeonId: string, challengeId: string) => {
    setDungeons(currentDungeons => {
        return currentDungeons.map(dungeon => {
            if (dungeon.id === dungeonId) {
                const newChallenges = dungeon.challenges.map(challenge => {
                    if (challenge.id === challengeId) {
                        return { ...challenge, completed: !challenge.completed };
                    }
                    return challenge;
                });
                return { ...dungeon, challenges: newChallenges };
            }
            return dungeon;
        });
    });
}, [setDungeons]);

const startDungeon = useCallback((dungeonId: string) => {
    updateDungeon({
        ...dungeons.find(d => d.id === dungeonId)!,
        startTime: new Date().toISOString()
    });
}, [dungeons, updateDungeon]);

const completeDungeon = useCallback((dungeonId: string): { timeTaken: number; baseXp: number; bonusXp: number } | null => {
    const dungeon = dungeons.find(d => d.id === dungeonId);
    if (!dungeon || dungeon.completed || !dungeon.startTime) return null;

    if (!dungeon.challenges.every(c => c.completed)) {
        setTimeout(() => toast({ title: "Challenges remain!", description: "Complete all challenges to conquer the quest.", variant: "destructive" }), 0);
        return null;
    }
    
    const completionTime = new Date();
    const timeTaken = differenceInSeconds(completionTime, new Date(dungeon.startTime));
    const targetTime = dungeon.challenges.length * 30 * 60; // 30 mins per challenge
    const bonusXp = Math.max(0, Math.round(dungeon.xp * (1 - (timeTaken / targetTime))));

    addXp(dungeon.xp + bonusXp);

    updateDungeon({ ...dungeon, completed: true, completionTime: completionTime.toISOString(), timeTaken });
    return { timeTaken, baseXp: dungeon.xp, bonusXp };

}, [dungeons, addXp, updateDungeon, toast]);


const addWeeklyReview = useCallback((reviewData: Omit<WeeklyReview, 'id' | 'date' | 'weekNumber' | 'year'>) => {
    const now = new Date();
    const newReview: WeeklyReview = {
        ...reviewData,
        id: now.toISOString(),
        date: now,
        weekNumber: getWeek(now),
        year: getYear(now),
    };
    addXp(150);
    setWeeklyReviews(prev => [newReview, ...prev]);
    setTimeout(() => toast({ title: 'Weekly Review Complete!', description: 'You earned 150 XP for your reflection.', variant: "success" }), 0);
}, [addXp, setWeeklyReviews, toast]);

const addCustomReward = useCallback((rewardData: Omit<RewardItem, 'id'| 'levelRequirement' | 'category' | 'icon'>) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const newReward: RewardItem = {
            ...rewardData,
            id: `custom-${Date.now()}`,
            levelRequirement: 0,
            category: 'Custom',
            icon: Star,
        };
        const updatedCustomRewards = [...(currentUser.customRewards || []), newReward];
        return { ...currentUser, customRewards: updatedCustomRewards };
    });
    setTimeout(() => toast({ title: "Custom reward added!", variant: "success" }), 0);
}, [setUser, toast]);

const deleteCustomReward = useCallback((rewardId: string) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const updatedCustomRewards = (currentUser.customRewards || []).filter(r => r.id !== rewardId);
        return { ...currentUser, customRewards: updatedCustomRewards };
    });
    setTimeout(() => toast({ title: "Custom reward deleted.", variant: 'destructive' }), 0);
}, [setUser, toast]);

const equipItem = useCallback((itemToEquip: Item) => {
    setUser(currentUser => {
        if (!currentUser) return null;

        const newEquipment: Equipment = { ...currentUser.equipment };
        const itemType = itemToEquip.type.toLowerCase() as keyof Equipment;

        if (itemType === 'weapon' || itemType === 'armor' || itemType === 'helmet' || itemType === 'shield') {
            newEquipment[itemType] = itemToEquip;
            setTimeout(() => toast({ title: "Item Equipped!", description: `${itemToEquip.name} has been equipped.`, variant: "newItem"}), 0);
            return { ...currentUser, equipment: newEquipment };
        }
        
        return currentUser;
    });
}, [setUser, toast]);

const addNotification = useCallback((notification: Omit<Notification, 'id'|'date'|'read'>) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const newNotification: Notification = {
            id: `${Date.now()}-${Math.random()}`,
            date: new Date(),
            read: false,
            ...notification,
        };
        const updatedNotifications = [newNotification, ...(currentUser.notifications || [])].slice(0, 100);
        return { ...currentUser, notifications: updatedNotifications };
    })
}, [setUser]);

const markNotificationAsRead = useCallback((notificationId: string) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const updatedNotifications = currentUser.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
        );
        return { ...currentUser, notifications: updatedNotifications };
    });
}, [setUser]);

const markAllNotificationsAsRead = useCallback(() => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const updatedNotifications = currentUser.notifications.map(n => ({...n, read: true}));
        return { ...currentUser, notifications: updatedNotifications };
    })
}, [setUser]);

const deleteNotification = useCallback((notificationId: string) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const updatedNotifications = currentUser.notifications.filter(n => n.id !== notificationId);
        return { ...currentUser, notifications: updatedNotifications };
    });
}, [setUser]);

const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => {
    if (!notesCollectionRef) return;
    const now = new Date();
    const newNote: Omit<Note, 'id'> = {
        ...noteData,
        createdAt: now,
        updatedAt: now,
        wordCount: noteData.content.split(/\s+/).length,
    };
    addDocumentNonBlocking(notesCollectionRef, newNote);
    const xpFromAchievements = user ? checkAndUnlockAchievements(user, notes) : 0;
    addXp(10 + xpFromAchievements);
    toast({ title: "Note Created!", description: "You earned +10 XP!", variant: "success" });
}, [notesCollectionRef, toast, addXp, user, notes, checkAndUnlockAchievements]);


const updateNote = useCallback((updatedNote: Partial<Note> & { id: string }) => {
    if (!notesCollectionRef) return;
    const noteRef = doc(notesCollectionRef, updatedNote.id);
    const updateData = { ...updatedNote, updatedAt: new Date() };
    delete updateData.id;
    updateDocumentNonBlocking(noteRef, updateData);
}, [notesCollectionRef]);

const deleteNote = useCallback((noteId: string) => {
    if (!notesCollectionRef) return;
    const noteRef = doc(notesCollectionRef, noteId);
    deleteDocumentNonBlocking(noteRef);
    toast({ title: "Note Deleted", variant: "destructive" });
}, [notesCollectionRef, toast]);


const contextValue = useMemo(() => ({
    user, 
    tasks,
    boss,
    dungeons,
    journalEntries,
    weeklyReviews,
    notes,
    loading: authLoading || !isDataLoaded || notesLoading,
    setUser,
    setBoss,
    dealBossDamage,
    addXp, 
    addCoins, 
    redeemReward, 
    getRedeemedCount, 
    addGems,
    addTask,
    updateTask,
    deleteTask,
    addJournalEntry,
    deleteJournalEntry,
    incrementJournalDeletionCount,
    levelUpSkill,
    addDungeon,
    updateDungeon,
    toggleChallengeCompleted,
    startDungeon,
    completeDungeon,
    addWeeklyReview,
    addCustomReward,
    deleteCustomReward,
    equipItem,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    addNote,
    updateNote,
    deleteNote,
  }), [user, tasks, boss, dungeons, journalEntries, weeklyReviews, notes, authLoading, isDataLoaded, notesLoading, setUser, setBoss, dealBossDamage, addXp, addCoins, redeemReward, getRedeemedCount, addGems, addTask, updateTask, deleteTask, addJournalEntry, deleteJournalEntry, incrementJournalDeletionCount, levelUpSkill, addDungeon, updateDungeon, toggleChallengeCompleted, startDungeon, completeDungeon, addWeeklyReview, addCustomReward, deleteCustomReward, equipItem, addNotification, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, addNote, updateNote, deleteNote]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

'use client';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { Habit, Challenge, HabitCompletion } from '../types/habits';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const habitsCollection = (db: Firestore, userId: string) => 
  collection(db, 'users', userId, 'habits');

export const challengesCollection = (db: Firestore, userId: string) => 
  collection(db, 'users', userId, 'challenges');

// Habit CRUD operations
export const createHabit = (db: Firestore, userId: string, habit: Omit<Habit, 'id'>) => {
  const habitsCol = habitsCollection(db, userId);
  const data = {
    ...habit,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  addDoc(habitsCol, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: habitsCol.path,
        operation: 'create',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
};

export const updateHabit = (db: Firestore, userId: string, habitId: string, updates: Partial<Habit>) => {
  const habitDoc = doc(habitsCollection(db, userId), habitId);
  const data = {
    ...updates,
    updatedAt: new Date(),
  };
  updateDoc(habitDoc, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: habitDoc.path,
        operation: 'update',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
};

export const completeHabit = async (
  db: Firestore,
  userId: string, 
  habitId: string, 
  date: string
) => {
  const habitDoc = doc(habitsCollection(db, userId), habitId);
  
  try {
    const habitSnap = await getDoc(habitDoc);
    if (!habitSnap.exists()) {
        throw new Error("Habit not found");
    }
    const habit = habitSnap.data() as Habit;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const hasYesterdayCompletion = habit.completionHistory?.some(
      c => c.date === yesterdayStr && c.completed
    );
    
    const newStreak = hasYesterdayCompletion ? (habit.streak || 0) + 1 : 1;
    const newLongestStreak = Math.max(habit.longestStreak || 0, newStreak);
    
    const completion: HabitCompletion = {
      date,
      completed: true,
      completedAt: new Date(),
      xpEarned: habit.xpReward,
      coinEarned: habit.coinReward,
    };

    const completionHistory = habit.completionHistory ? [...habit.completionHistory, completion] : [completion];
    
    const data = {
      streak: newStreak,
      longestStreak: newLongestStreak,
      completionHistory: completionHistory,
      updatedAt: new Date(),
    };

    updateDoc(habitDoc, data).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: habitDoc.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    return { newStreak, xpEarned: habit.xpReward, coinEarned: habit.coinReward };

  } catch(e) {
     const permissionError = new FirestorePermissionError({
        path: habitDoc.path,
        operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    return { newStreak: 0, xpEarned: 0, coinEarned: 0 };
  }
};

// Challenge CRUD operations
export const createChallenge = (db: Firestore, userId: string, challenge: Omit<Challenge, 'id'>) => {
  const challengesCol = challengesCollection(db, userId);
  const data = {
    ...challenge,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  addDoc(challengesCol, data).catch(async (serverError) => {
     const permissionError = new FirestorePermissionError({
        path: challengesCol.path,
        operation: 'create',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
};

export const updateChallengeProgress = async (
  db: Firestore,
  userId: string, 
  challengeId: string, 
  date: string, 
  completed: boolean
) => {
  const challengeDoc = doc(challengesCollection(db, userId), challengeId);
  try {
    const challengeSnap = await getDoc(challengeDoc);
    if (!challengeSnap.exists()) {
        throw new Error("Challenge not found");
    }
    const challenge = challengeSnap.data() as Challenge;
    
    const updatedProgress = {
      ...challenge.progress,
      dailyCompletions: {
        ...challenge.progress.dailyCompletions,
        [date]: completed
      }
    };
    
    const completedDays = Object.values(updatedProgress.dailyCompletions).filter(Boolean).length;
    const currentDay = challenge.startDate ? Math.ceil((new Date().getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1;
    const successRate = (completedDays / currentDay) * 100;
    
    updatedProgress.currentDay = currentDay;
    updatedProgress.completedDays = completedDays;
    updatedProgress.successRate = successRate;
    
    const data = {
        progress: updatedProgress,
        updatedAt: new Date(),
    };

    updateDoc(challengeDoc, data).catch(async (serverError) => {
         const permissionError = new FirestorePermissionError({
            path: challengeDoc.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    
    return updatedProgress;
  } catch (e) {
    const permissionError = new FirestorePermissionError({
        path: challengeDoc.path,
        operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
  }
};

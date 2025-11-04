
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
  Firestore,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { Habit, Challenge, EnhancedCompletion } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { isSameDay } from 'date-fns';

type BulkUpdatePayload = {
    habitId: string;
    date: string;
    completed: boolean;
    notes?: string;
    completionMethod: 'batch';
}


export const habitsCollection = (db: Firestore, userId: string) => 
  collection(db, 'users', userId, 'habits');

export const challengesCollection = (db: Firestore, userId: string) => 
  collection(db, 'users', userId, 'challenges');

// Habit CRUD operations
export const createHabit = (db: Firestore, userId: string, habit: Omit<Habit, 'id'>) => {
  const habitsCol = habitsCollection(db, userId);
  const data: Partial<Habit> & { createdAt: Date, updatedAt: Date } = {
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
  date: string,
  details?: Partial<EnhancedCompletion>
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
    
    const lastCompletion = habit.completionHistory
        ?.filter(c => c.completed)
        .sort((a,b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

    let newStreak = habit.streaks.current || 0;
    if(lastCompletion && isSameDay(new Date(lastCompletion.completedAt), yesterday)) {
        newStreak++;
    } else {
        newStreak = 1;
    }

    const newLongestStreak = Math.max(habit.streaks.longest || 0, newStreak);
    
    const completion: EnhancedCompletion = {
      date,
      completed: true,
      completedAt: new Date(),
      xpEarned: habit.xpReward,
      coinEarned: habit.coinReward,
      difficulty: 'normal',
      completionMethod: 'manual',
      ...details
    };

    const completionHistory = habit.completionHistory ? [...habit.completionHistory, completion] : [completion];
    
    const data = {
      streaks: { ...habit.streaks, current: newStreak, longest: newLongestStreak },
      completionHistory: completionHistory,
      updatedAt: new Date(),
      habitStrength: Math.min(100, (habit.habitStrength || 0) + 5), // Increase strength
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

export const undoHabitCompletion = async (db: Firestore, userId: string, habitId: string, date: string) => {
    const habitDoc = doc(habitsCollection(db, userId), habitId);
    try {
        const habitSnap = await getDoc(habitDoc);
        if (!habitSnap.exists()) throw new Error("Habit not found");

        const habit = habitSnap.data() as Habit;
        const completionToRemove = habit.completionHistory?.find(c => isSameDay(new Date(c.date), new Date(date)));

        if (!completionToRemove) return null;

        const newCompletionHistory = habit.completionHistory.filter(c => !isSameDay(new Date(c.date), new Date(date)));
        
        // This is a simplified undo. A real implementation would need to recalculate streak.
        const data = {
            completionHistory: newCompletionHistory,
            habitStrength: Math.max(0, (habit.habitStrength || 0) - 10), // Decrease strength
            streaks: { ...habit.streaks, current: Math.max(0, (habit.streaks.current || 0) -1) },
        };

        updateDoc(habitDoc, data).catch(err => {
             const permissionError = new FirestorePermissionError({
                path: habitDoc.path,
                operation: 'update',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        return { xpLost: completionToRemove.xpEarned, coinLost: completionToRemove.coinEarned };
    } catch(e) {
        const permissionError = new FirestorePermissionError({
            path: habitDoc.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        return null;
    }
}

export const bulkUpdateCompletions = async (db: Firestore, userId: string, updates: BulkUpdatePayload[]) => {
    const batch = writeBatch(db);

    for (const update of updates) {
        const { habitId, date, completed, notes, completionMethod } = update;
        const habitRef = doc(db, 'users', userId, 'habits', habitId);

        // Fetch the habit to access its properties
        const habitSnap = await getDoc(habitRef);
        if (!habitSnap.exists()) continue;

        const habit = habitSnap.data() as Habit;
        const newCompletionHistory = habit.completionHistory.filter(c => c.date !== date);
        
        if (completed) {
            newCompletionHistory.push({
                date,
                completed: true,
                completedAt: new Date(),
                xpEarned: habit.xpReward,
                coinEarned: habit.coinReward,
                notes,
                completionMethod,
                difficulty: 'normal',
            });
        }
        
        // Note: Recalculating streak and habit strength accurately in a bulk operation is complex.
        // This is a simplified update. A more robust solution might involve a Cloud Function.
        batch.update(habitRef, {
            completionHistory: newCompletionHistory,
            updatedAt: new Date(),
        });
    }

    batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `users/${userId}/habits`,
            operation: 'write',
            requestResourceData: { bulkUpdateCount: updates.length },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
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

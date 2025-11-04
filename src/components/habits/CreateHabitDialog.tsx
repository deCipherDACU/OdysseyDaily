
'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCategory, TaskDifficulty, Habit } from '@/lib/types';
import { calculateTaskCoins, calculateTaskXP } from '@/lib/formulas';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { createHabit } from '@/lib/firebase/firestore/habits';

const habitSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
});

const taskCategories: TaskCategory[] = ['Education', 'Career', 'Health', 'Mental Wellness', 'Finance', 'Social', 'Hobbies', 'Home'];


interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateHabitDialog: React.FC<CreateHabitDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useUser();
  const { db } = useFirestore();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<z.infer<typeof habitSchema>>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      difficulty: 'Easy',
      frequency: 'daily',
      category: 'Hobbies'
    }
  });

  const handleCreate = async (data: z.infer<typeof habitSchema>) => {
    if (!user || !db) return;

    const newHabit: Omit<Habit, 'id'> = {
      userId: user.uid,
      title: data.title,
      description: data.description,
      category: data.category as TaskCategory,
      difficulty: data.difficulty as TaskDifficulty,
      frequency: data.frequency as 'daily' | 'weekly' | 'monthly',
      xpReward: calculateTaskXP(data.difficulty as TaskDifficulty),
      coinReward: calculateTaskCoins(data.difficulty as TaskDifficulty, 1),
      streak: 0,
      completionHistory: [],
    };
    
    await createHabit(db, user.uid, newHabit);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Create New Habit</DialogTitle>
          <DialogDescription>Add a new recurring task to build a streak.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register('description')} />
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {taskCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Controller
                        name="difficulty"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>
             <div className="space-y-2">
                <Label>Frequency</Label>
                <Controller
                    name="frequency"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Create Habit</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

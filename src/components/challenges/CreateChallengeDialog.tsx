
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskDifficulty } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { createChallenge } from '@/lib/firebase/firestore/habits';

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const challengeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  duration: z.coerce.number().min(7, "Duration must be at least 7 days"),
  category: z.string().min(1, "Please select a category"),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});


export const CreateChallengeDialog: React.FC<CreateChallengeDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useUser();
  const { db } = useFirestore();
  const { toast } = useToast();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<z.infer<typeof challengeSchema>>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      duration: 21,
      difficulty: 'Medium',
      category: 'Health'
    }
  });

  const handleCreate = async (data: z.infer<typeof challengeSchema>) => {
    if (!user || !db) return;
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + data.duration);

    await createChallenge(db, user.uid, {
      ...data,
      startDate,
      endDate,
      status: 'active',
      rewards: { xp: 100 * data.duration, coins: 10 * data.duration, gems: 0, items: [], achievements: [] },
      requirements: [],
      progress: {
        currentDay: 1,
        completedDays: 0,
        successRate: 0,
        dailyCompletions: {},
        milestoneRewards: {}
      }
    });

    toast({
      title: "Challenge Started!",
      description: `Your ${data.duration}-day "${data.title}" challenge has begun.`
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Start a New Challenge</DialogTitle>
          <DialogDescription>
            Define a long-term goal to conquer.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input id="duration" type="number" {...register('duration')} />
              {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
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
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Career">Career</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Mental Wellness">Mental Wellness</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                          </SelectContent>
                      </Select>
                  )}
              />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Start Challenge</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};



'use client';

import { Task } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { MoreVertical, CalendarCheck2, Repeat, Target, Trash2, Edit, Timer } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { format, isSameDay, subDays } from "date-fns";
import { useUser } from "@/context/UserContext";
import { Progress } from "../ui/progress";
import { useToast } from "@/hooks/use-toast";
import React from 'react';

function TaskItemComponent({ task }: { task: Task }) {
    const { addXp, addCoins, updateTask, user, deleteTask } = useUser();
    const { toast } = useToast();

    const handleCheckedChange = (checked: boolean | 'indeterminate') => {
        const newCompletedState = !!checked;
        
        if (!user) return;

        // If the task is already in the desired state, do nothing.
        if (task.completed === newCompletedState) return;

        const xpAmount = task.xp;
        const coinAmount = task.coins;
        
        if (newCompletedState) {
            addXp(xpAmount);
            addCoins(coinAmount);
            // This toast is redundant because dealBossDamage also shows a toast.
            // toast({
            //     title: "Quest Complete!",
            //     description: `You earned ${xpAmount} XP and ${coinAmount} Coins.`,
            // });
        } else {
             addXp(-xpAmount);
             addCoins(-coinAmount);
             toast({
                title: "Quest Undone",
                description: `You lost ${xpAmount} XP and ${coinAmount} Coins.`,
                variant: 'destructive'
            });
        }
        
        updateTask({ 
            ...task, 
            completed: newCompletedState, 
        });

        if(window.navigator.vibrate) {
            window.navigator.vibrate(100);
        }
    };

    const isRecurring = task.type === 'Daily' || task.type === 'Weekly' || task.type === 'Monthly';
    const streak = task.streak || 0;
    const habitStages = [
        { days: 21, name: 'Habit Forming', icon: Repeat },
        { days: 66, name: 'Automaticity', icon: CalendarCheck2 },
        { days: 90, name: 'Lifestyle', icon: Target },
    ];

    const currentStage = habitStages.slice().reverse().find(stage => streak >= stage.days);
    const nextStage = habitStages.find(stage => streak < stage.days);
    const progressToNextStage = nextStage ? (streak / nextStage.days) * 100 : 100;
    
    const difficultyColor = {
        'Easy': 'bg-green-500/20 text-green-300 border-green-500/40',
        'Medium': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        'Hard': 'bg-red-500/20 text-red-300 border-red-500/40',
        'N/A': 'bg-gray-500/20 text-gray-300 border-gray-500/40',
    };

    const hasPomodoros = task.pomodoros && task.pomodoros > 0;
    const pomodoroProgress = hasPomodoros ? ((task.pomodorosCompleted || 0) / task.pomodoros) * 100 : 0;
    const isCompletedByPomodoro = hasPomodoros && (task.pomodorosCompleted || 0) >= task.pomodoros;


    return (
        <div className={cn(
            "flex items-start gap-4 p-4 rounded-lg border-l-4 transition-all backdrop-blur-sm",
            task.completed 
                ? "bg-black/20 border-accent" 
                : "bg-black/20 border-transparent hover:bg-secondary/20 hover:border-secondary"
        )}>
            <Checkbox 
                id={`task-${task.id}`} 
                checked={task.completed} 
                onCheckedChange={handleCheckedChange}
                className="h-6 w-6 mt-1" 
                disabled={hasPomodoros && !isCompletedByPomodoro && !task.completed}
            />
            <div className="flex-1 grid gap-1">
                <label
                    htmlFor={`task-${task.id}`}
                    className={cn(
                        "font-semibold font-headline cursor-pointer",
                        task.completed && "line-through text-muted-foreground"
                    )}
                >
                    {task.title}
                </label>
                {task.description && <p className={cn("text-sm text-muted-foreground", task.completed && "line-through")}>{task.description}</p>}
                 {task.intention && <p className={cn("text-sm text-accent italic", task.completed && "line-through")}>{task.intention}</p>}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant="outline">{task.category}</Badge>
                    <Badge
                        className={cn(difficultyColor[task.difficulty])}
                    >
                        {task.difficulty}
                    </Badge>
                     <Badge variant="secondary">{task.type}</Badge>
                    {task.dueDate && <Badge variant="outline">Due: {format(new Date(task.dueDate), 'P')}</Badge>}
                </div>
                {isRecurring && streak > 0 && (
                     <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                                {currentStage ? <currentStage.icon className="h-4 w-4 text-green-500" /> : <Repeat className="h-4 w-4" />}
                                {currentStage ? `${currentStage.name} (Day ${streak})` : `Streak: ${streak} days`}
                            </span>
                            {nextStage && <span>Next: {nextStage.name} ({nextStage.days} days)</span>}
                        </div>
                        <Progress value={progressToNextStage} className="h-1" />
                    </div>
                )}
                 {hasPomodoros && (
                     <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                               <Timer className="h-4 w-4" />
                               Focus Sessions
                            </span>
                           <span>{task.pomodorosCompleted || 0} / {task.pomodoros}</span>
                        </div>
                        <Progress value={pomodoroProgress} className="h-1" />
                    </div>
                )}
            </div>
            <div className="flex-col items-end gap-2 text-sm font-semibold text-right hidden sm:flex">
                <div className="flex items-center gap-1 text-primary">
                    +{task.xp} XP
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                    +{task.coins} Coins
                </div>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-transparent hover:bg-white/10">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(task.id)}>
                         <Trash2 className="mr-2 h-4 w-4" />
                         Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export const TaskItem = React.memo(TaskItemComponent);

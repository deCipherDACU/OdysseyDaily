
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2, 
  Circle, 
  RotateCcw, 
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { format, isToday as isTodayFns, isSameDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Habit } from '@/lib/types';
import { useHabits } from '@/context/OptimizedHabitsContext';

const isHabitDueToday = (habit: Habit): boolean => {
    const today = new Date();
    const todayDay = today.getDay(); // Sunday - 0, Monday - 1, etc.

    if (!habit.schedule) return true; // Assume daily if no schedule

    switch (habit.schedule.type) {
        case 'daily':
            return true;
        case 'specific-days':
            return habit.schedule.targetDays?.includes(todayDay) ?? false;
        case 'x-per-week':
            // This is more complex to determine "due" on a specific day.
            // For simplicity, we'll show it every day until the target is met for the week.
            const weekStart = startOfWeek(today);
            const weekEnd = endOfWeek(today);
            const completionsThisWeek = (habit.completionHistory || []).filter(c => 
                c.completed && isWithinInterval(new Date(c.completedAt), { start: weekStart, end: weekEnd })
            ).length;
            return completionsThisWeek < (habit.schedule.targetCount || 0);
        case 'interval':
            if (!habit.createdAt) return false;
            const dayDiff = Math.floor((today.getTime() - new Date(habit.createdAt).getTime()) / (1000 * 3600 * 24));
            return dayDiff % (habit.schedule.intervalDays || 1) === 0;
        case 'weekly':
             // Simplified: show weekly tasks every day of the week
            return true;
        case 'monthly':
             return new Date().getDate() === (habit.schedule.targetDays?.[0] || 1);
        default:
            return true;
    }
};

export const MinimalistTodayView: React.FC = () => {
  const { habits, bulkComplete, undoHabit: undoHabitCompletion, completeHabit } = useHabits();
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const getTodayCompletion = (habit: Habit) => {
    return habit.completionHistory?.find((c: any) => isSameDay(new Date(c.date), new Date(today)));
  };

  const currentCompletions = useMemo(() => {
    const completions = new Map<string, any>();
    habits.forEach(habit => {
      const completion = getTodayCompletion(habit);
      if (completion) {
        completions.set(habit.id, completion);
      }
    });
    return completions;
  }, [habits, today]);


  const habitsByArea = useMemo(() => {
    const todayHabits = habits.filter(h => isHabitDueToday(h) && h.isActive && !h.vacationMode && h.area);
    
    const grouped = todayHabits.reduce((acc, habit) => {
      const areaName = habit.area;
      if (!acc[areaName]) {
        acc[areaName] = {
          area: { name: areaName, color: '#FFFFFF' }, // Simplified
          habits: [],
          completed: 0,
          total: 0
        };
      }
      acc[areaName].habits.push(habit);
      acc[areaName].total++;
      if (getTodayCompletion(habit)?.completed) {
        acc[areaName].completed++;
      }
      return acc;
    }, {} as Record<string, any>);
    
    Object.values(grouped).forEach((group: any) => {
      group.habits.sort((a: any, b: any) => {
        const aCompleted = !!getTodayCompletion(a)?.completed;
        const bCompleted = !!getTodayCompletion(b)?.completed;
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        return (b.priority || 0) - (a.priority || 0);
      });
    });
    
    return grouped;
  }, [habits, today]);

  const handleQuickComplete = async (habitId: string, value?: number) => {
    try {
      await completeHabit(habitId, today);
    } catch (error) {
      console.error('Failed to complete habit:', error);
    }
  };
  
  const handleUndo = async (habitId: string) => {
    try {
      await undoHabitCompletion(habitId, today);
    } catch(error) {
      console.error('Failed to undo habit completion:', error)
    }
  }

  const handleBulkComplete = async () => {
    if (selectedHabits.size === 0) return;
    
    try {
      await bulkComplete(Array.from(selectedHabits), today);
      setSelectedHabits(new Set());
      setBulkMode(false);
    } catch (error) {
      console.error('Failed to bulk complete:', error);
    }
  };

  const toggleAreaExpanded = (areaName: string) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(areaName)) {
      newExpanded.delete(areaName);
    } else {
      newExpanded.add(areaName);
    }
    setExpandedAreas(newExpanded);
  };

  const totalHabits = Object.values(habitsByArea).reduce((sum: number, group: any) => sum + group.total, 0);
  const completedHabits = Object.values(habitsByArea).reduce((sum: number, group: any) => sum + group.completed, 0);
  const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Today</h1>
          <p className="text-muted-foreground">
            {completedHabits}/{totalHabits} completed ({completionRate}%)
          </p>
        </div>
        
        {bulkMode && (
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleBulkComplete}
              disabled={selectedHabits.size === 0}
              size="sm"
            >
              Complete {selectedHabits.size}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setBulkMode(false)}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
        
        {!bulkMode && totalHabits > 3 && (
          <Button 
            variant="outline" 
            onClick={() => setBulkMode(true)}
            size="sm"
          >
            Bulk Edit
          </Button>
        )}
      </div>

      <div className="flex justify-center">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15"
              fill="none" stroke="currentColor" strokeWidth="3"
              className="text-muted stroke-current opacity-20"
            />
            <circle
              cx="18" cy="18" r="15"
              fill="none" strokeWidth="3"
              strokeDasharray={`${completionRate}, 100`}
              className="text-primary stroke-current transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(habitsByArea).map(([areaName, group]: [string, any]) => {
          const isExpanded = expandedAreas.has(areaName);
          const areaProgress = group.total > 0 ? (group.completed / group.total) * 100 : 0;
          
          return (
            <Card key={areaName} className="overflow-hidden">
              <Collapsible 
                open={isExpanded} 
                onOpenChange={() => toggleAreaExpanded(areaName)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.area.color }}
                      />
                      <span className="font-medium">{areaName}</span>
                      <Badge variant="outline" className="text-xs">
                        {group.completed}/{group.total}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${areaProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {Math.round(areaProgress)}%
                      </span>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-2">
                    {group.habits.map((habit: Habit) => {
                      const completion = getTodayCompletion(habit);
                      const isCompleted = !!completion?.completed;
                      const isSelected = selectedHabits.has(habit.id);
                      
                      return (
                        <div 
                          key={habit.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            isCompleted ? 'bg-green-500/10 border border-green-500/20' : 'hover:bg-muted/30'
                          }`}
                        >
                          {bulkMode && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedHabits);
                                if (checked) {
                                  newSelected.add(habit.id);
                                } else {
                                  newSelected.delete(habit.id);
                                }
                                setSelectedHabits(newSelected);
                              }}
                            />
                          )}
                          
                          <Button
                            variant={isCompleted ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleQuickComplete(habit.id)}
                            disabled={isCompleted}
                            className="flex-shrink-0 w-8 h-8 p-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium truncate ${
                                isCompleted ? 'line-through opacity-60' : ''
                              }`}>
                                {habit.title}
                              </span>
                              
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <div className="flex items-center space-x-1">
                                  <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 transition-all"
                                      style={{ width: `${habit.habitStrength}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {habit.habitStrength}
                                  </span>
                                </div>
                                
                                {(habit.streak || 0) > 0 && (
                                  <Badge variant="secondary" className="text-xs px-1">
                                    {habit.streak}🔥
                                  </Badge>
                                )}
                                
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {habit.xpReward}
                                </Badge>
                              </div>
                            </div>
                            
                            {habit.trackingType === 'duration' && completion?.value && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {completion.value} / {habit.targetValue} {habit.unit}
                              </div>
                            )}
                            
                            {habit.trackingType === 'scale' && completion?.value && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Mood: {completion.value}/10
                              </div>
                            )}
                          </div>
                          
                          {isCompleted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUndo(habit.id)}
                              className="w-8 h-8 p-0 opacity-60 hover:opacity-100"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {totalHabits === 0 && (
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h3 className="font-medium mb-2">All caught up!</h3>
          <p className="text-sm text-muted-foreground">
            No habits due today. Enjoy your free time! 🎉
          </p>
        </Card>
      )}
    </div>
  );
};

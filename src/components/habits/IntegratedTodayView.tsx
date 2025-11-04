
'use client';

import React, { useState, useMemo, FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2, 
  Circle, 
  RotateCcw, 
  Zap, 
  Coins,
  Flame,
  Trophy,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '@/lib/types';
import { useHabits } from '@/context/OptimizedHabitsContext';
import Link from 'next/link';

// Re-defining this type locally to avoid import issues if original location changes.
interface HabitTemplateProgress {
  templateId: string;
  progress: {
    currentDay: number;
    totalDays: number;
    completedToday: number;
    totalToday: number;
  };
}

export const IntegratedTodayView: FC = () => {
  const { 
    habits, 
    todayProgress, 
    completeHabit, 
    undoHabit,
    bulkComplete,
  } = useHabits();

  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set(['Health', 'Work']));
  const [bulkMode, setBulkMode] = useState(false);
  const [completingHabits, setCompletingHabits] = useState<Set<string>>(new Set());
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const getTodayCompletion = (habit: Habit) => {
    return habit.completionHistory?.find((c) => c.date === today);
  };

  const habitsByArea = useMemo(() => {
    const todayHabits = habits.filter(h => isHabitDueToday(h) && h.isActive && !h.vacationMode);
    
    const grouped: Record<string, {
        area: { name: string; color: string; };
        habits: Habit[];
        completed: number;
        total: number;
        totalXP: number;
        earnedXP: number;
        templates: Set<string>;
    }> = {};
    
    todayHabits.forEach(habit => {
      const areaName = habit.area || 'Other';
      if (!grouped[areaName]) {
        grouped[areaName] = {
          area: { name: areaName, color: getAreaColor(areaName) },
          habits: [],
          completed: 0,
          total: 0,
          totalXP: 0,
          earnedXP: 0,
          templates: new Set()
        };
      }
      
      const group = grouped[areaName];
      group.habits.push(habit);
      group.total++;
      group.totalXP += habit.xpReward;
      
      const completion = getTodayCompletion(habit);
      if (completion?.completed) {
        group.completed++;
        group.earnedXP += completion.xpEarned;
      }
      
      if (habit.templateId) {
        group.templates.add(habit.templateId);
      }
    });
    
    Object.values(grouped).forEach(group => {
      group.habits.sort((a, b) => {
        const aCompleted = !!getTodayCompletion(a)?.completed;
        const bCompleted = !!getTodayCompletion(b)?.completed;
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        if (a.templateStackOrder !== b.templateStackOrder) return (a.templateStackOrder || 999) - (b.templateStackOrder || 999);
        return (b.priority || 0) - (a.priority || 0);
      });
    });
    
    return grouped;
  }, [habits, today]);

  const handleQuickComplete = async (habitId: string) => {
    setCompletingHabits(prev => new Set([...prev, habitId]));
    try {
      await completeHabit(habitId, today);
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setCompletingHabits(prev => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  const handleUndo = async (habitId: string) => {
    try {
      await undoHabit(habitId, today);
    } catch (error) {
      console.error('Failed to undo habit:', error);
    }
  };

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
    if (newExpanded.has(areaName)) newExpanded.delete(areaName);
    else newExpanded.add(areaName);
    setExpandedAreas(newExpanded);
  };

  // Placeholder for activeTemplates, as this logic was removed from context
  const activeTemplates: HabitTemplateProgress[] = [];
  const getTemplateName = (id: string) => `Template ${id}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Today's Quest
          </h1>
          <p className="text-muted-foreground mt-2">
            {format(new Date(), 'EEEE, MMMM do')}
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-8">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="14"
                fill="none" stroke="currentColor" strokeWidth="2"
                className="text-muted stroke-current opacity-20"
              />
              <motion.circle
                cx="18" cy="18" r="14"
                fill="none" strokeWidth="2"
                className="text-primary stroke-current"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ 
                  strokeDasharray: `${todayProgress.completionRate}, 100`,
                  rotate: todayProgress.completionRate > 0 ? 360 : 0
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">
                {Math.round(todayProgress.completionRate)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {todayProgress.completedHabits}/{todayProgress.totalHabits}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <motion.div 
              className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-lg font-bold text-yellow-400">
                    {todayProgress.totalXPEarned}
                  </div>
                  <div className="text-xs text-yellow-500/80">XP Earned</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Coins className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-lg font-bold text-blue-400">
                    {todayProgress.totalCoinsEarned}
                  </div>
                  <div className="text-xs text-blue-500/80">Coins</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-lg font-bold text-orange-400">
                    {todayProgress.streaksMaintained}
                  </div>
                  <div className="text-xs text-orange-500/80">Streaks</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-lg font-bold text-purple-400">
                    {activeTemplates.length}
                  </div>
                  <div className="text-xs text-purple-500/80">Templates</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {activeTemplates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Templates</h3>
            <div className="grid gap-2">
              {activeTemplates.map(template => {
                const progress = (template.progress.completedToday / template.progress.totalToday) * 100;
                return (
                  <div key={template.templateId} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {getTemplateName(template.templateId)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Day {template.progress.currentDay}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={progress} className="flex-1 h-2" />
                      <span className="text-xs font-medium w-12">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {todayProgress.totalHabits > 3 && (
          <div className="flex items-center justify-center space-x-2">
            {bulkMode && selectedHabits.size > 0 && (
              <Button onClick={handleBulkComplete} className="bg-green-600 hover:bg-green-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete {selectedHabits.size} Habits
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setBulkMode(!bulkMode)}
              className={bulkMode ? "border-primary text-primary" : ""}
            >
              {bulkMode ? 'Exit Bulk Mode' : 'Bulk Complete'}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(habitsByArea).map(([areaName, group]) => {
          const isExpanded = expandedAreas.has(areaName);
          const areaProgress = group.total > 0 ? (group.completed / group.total) * 100 : 0;
          
          return (
            <Card key={areaName} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Collapsible 
                open={isExpanded} 
                onOpenChange={() => toggleAreaExpanded(areaName)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: group.area?.color || '#6B7280' }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{areaName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {group.completed}/{group.total} completed • {group.earnedXP}/{group.totalXP} XP
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {group.templates.size > 0 && (
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-purple-500" />
                          <span className="text-xs text-purple-500/80">{group.templates.size}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${areaProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">
                          {Math.round(areaProgress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <AnimatePresence>
                      {group.habits.map((habit, index) => {
                        const completion = getTodayCompletion(habit);
                        const isCompleted = !!completion?.completed;
                        const isCompleting = completingHabits.has(habit.id);
                        const isSelected = selectedHabits.has(habit.id);
                        
                        return (
                          <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20' 
                                : 'bg-card hover:bg-muted/30 border border-border'
                            } ${isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
                          >
                            {bulkMode && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selectedHabits);
                                  if (checked) newSelected.add(habit.id);
                                  else newSelected.delete(habit.id);
                                  setSelectedHabits(newSelected);
                                }}
                                disabled={isCompleted}
                              />
                            )}
                            
                            <div className="flex items-center space-x-2">
                              {!isCompleted ? (
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => handleQuickComplete(habit.id)}
                                  disabled={isCompleting}
                                  className="w-12 h-12 p-0 rounded-full border-2 hover:border-primary hover:bg-primary hover:text-white transition-all"
                                >
                                  {isCompleting ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ repeat: Infinity, duration: 1 }}
                                    >
                                      <Circle className="w-5 h-5" />
                                    </motion.div>
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </Button>
                              ) : (
                                <div className="relative">
                                  <Button
                                    variant="default"
                                    size="lg"
                                    disabled
                                    className="w-12 h-12 p-0 rounded-full bg-green-500 hover:bg-green-500"
                                  >
                                    <CheckCircle2 className="w-5 h-5" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUndo(habit.id)}
                                    className="absolute -top-1 -right-1 w-6 h-6 p-0 rounded-full bg-background border shadow-sm hover:bg-red-500/20"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-semibold ${isCompleted ? 'line-through opacity-60' : ''}`}>
                                  {habit.title}
                                </h4>
                                
                                <div className="flex items-center space-x-2">
                                  {habit.templateId && (
                                    <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                                      Template
                                    </Badge>
                                  )}
                                  
                                  {(habit.streak || 0) > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Flame className="w-3 h-3 mr-1" />
                                      {habit.streak}
                                    </Badge>
                                  )}
                                  
                                  <div className="flex items-center space-x-1">
                                    <Badge variant="outline" className="text-xs">
                                      <Zap className="w-3 h-3 mr-1" />
                                      {isCompleted && completion ? completion.xpEarned : habit.xpReward}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Coins className="w-3 h-3 mr-1" />
                                      {isCompleted && completion ? completion.coinEarned : habit.coinReward}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground w-16">Strength</span>
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${habit.habitStrength || 0}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-8">
                                  {habit.habitStrength || 0}
                                </span>
                              </div>

                              {habit.trackingType === 'duration' && completion?.value && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">Progress:</span>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500"
                                      style={{ width: `${Math.min(((completion.value || 0) / (habit.targetValue || 1)) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium">
                                    {completion.value}/{habit.targetValue} {habit.unit}
                                  </span>
                                </div>
                              )}

                              {!isCompleted && habit.tinyVersion && (
                                <p className="text-xs text-muted-foreground italic">
                                  💡 Tiny version: {habit.tinyVersion}
                                </p>
                              )}

                              {completion?.notes && (
                                <p className="text-xs text-green-700 bg-green-500/10 p-2 rounded italic">
                                  "{completion.notes}"
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {todayProgress.completionRate === 100 && todayProgress.totalHabits > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">Perfect Day Achieved!</h3>
          <p className="text-muted-foreground">
            You've completed all your habits for today. Amazing work!
          </p>
        </motion.div>
      )}

      {todayProgress.totalHabits === 0 && (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-6" />
          <h3 className="text-xl font-semibold mb-3">All caught up!</h3>
          <p className="text-muted-foreground mb-6">
            No habits due today. Time to relax or explore new templates! 🎯
          </p>
          <Link href="/habits?tab=templates" passHref>
            <Button variant="outline">
              Browse Templates
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

// Helper functions
function isHabitDueToday(habit: Habit): boolean {
  const dayOfWeek = new Date().getDay();
  
  if (!habit.schedule) return true;

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'specific-days':
      return habit.schedule?.targetDays?.includes(dayOfWeek) || false;
    case 'weekly':
      return true; // Simplified for now
    default:
      return true;
  }
}

function getAreaColor(area: string): string {
    const colors: Record<string, string> = {
      'Health': '#10B981',
      'Work': '#3B82F6', 
      'Career': '#3B82F6',
      'Growth': '#8B5CF6',
      'Mental Wellness': '#F59E0B',
      'Social': '#EF4444',
      'Education': '#8B5CF6',
      'Finance': '#10B981',
      'Hobbies': '#EC4899',
      'Home': '#6366F1'
    };
    return colors[area] || '#6B7280';
}

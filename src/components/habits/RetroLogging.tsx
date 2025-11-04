
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon,
  CheckSquare,
  RotateCcw,
  Save,
  X
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { useHabits } from '@/context/OptimizedHabitsContext';

export const RetroLogging: React.FC = () => {
  const { habits, bulkComplete } = useHabits();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [completionStates, setCompletionStates] = useState<Map<string, boolean>>(new Map());
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get last 7 days for quick selection
  const quickDates = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    }).reverse();
  }, []);
  
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Filter habits that were active on selected date
  const availableHabits = useMemo(() => {
    return habits.filter(habit => {
        if (!habit.createdAt) return false;
        const createdDate = new Date(habit.createdAt);
        return createdDate <= selectedDate && habit.isActive;
    });
  }, [habits, selectedDate]);
  
  // Get current completion states for selected date
  const currentCompletions = useMemo(() => {
    const states = new Map<string, boolean>();
    availableHabits.forEach(habit => {
      const completion = habit.completionHistory?.find(c => c.date === selectedDateStr);
      states.set(habit.id, !!completion?.completed);
    });
    return states;
  }, [availableHabits, selectedDateStr]);
  
  // Initialize completion states when date changes
  React.useEffect(() => {
    setCompletionStates(new Map(currentCompletions));
    setSelectedHabits(new Set());
    setNotes('');
  }, [selectedDate, currentCompletions]);
  
  const handleHabitToggle = (habitId: string) => {
    const newStates = new Map(completionStates);
    newStates.set(habitId, !newStates.get(habitId));
    setCompletionStates(newStates);
    
    // Auto-select changed habits
    const newSelected = new Set(selectedHabits);
    const original = currentCompletions.get(habitId);
    const current = newStates.get(habitId);
    
    if (original !== current) {
      newSelected.add(habitId);
    } else {
      newSelected.delete(habitId);
    }
    setSelectedHabits(newSelected);
  };
  
  const handleBulkSave = async () => {
    if (selectedHabits.size === 0) return;
    
    setIsLoading(true);
    try {
      const updates = Array.from(selectedHabits).filter(habitId => completionStates.get(habitId));
      
      await bulkComplete(updates, selectedDateStr);
      
      setSelectedHabits(new Set());
      setNotes('');
    } catch (error) {
      console.error('Failed to save bulk updates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedHabits.size === availableHabits.length) {
      setSelectedHabits(new Set());
    } else {
      setSelectedHabits(new Set(availableHabits.map(h => h.id)));
    }
  };
  
  const handleBulkComplete = (completed: boolean) => {
    const newStates = new Map(completionStates);
    selectedHabits.forEach(habitId => {
      newStates.set(habitId, completed);
    });
    setCompletionStates(newStates);
  };
  
  const changedHabits = availableHabits.filter(habit => 
    currentCompletions.get(habit.id) !== completionStates.get(habit.id)
  );
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catch Up on Missed Days</h2>
        <Badge variant="outline">
          {changedHabits.length} changes pending
        </Badge>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Select Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick date buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Select</p>
              <div className="grid grid-cols-1 gap-1">
                {quickDates.map(date => (
                  <Button
                    key={date.toISOString()}
                    variant={isSameDay(date, selectedDate) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDate(date)}
                    className="justify-start"
                  >
                    {format(date, 'EEE, MMM dd')}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Calendar */}
            <div>
              <p className="text-sm font-medium mb-2">Or pick any date</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                className="rounded-md border"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Habit Selection */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Habits for {format(selectedDate, 'MMM dd, yyyy')}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedHabits.size === availableHabits.length ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedHabits.size > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkComplete(true)}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkComplete(false)}
                    >
                      Mark Incomplete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Habits list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableHabits.map(habit => {
                const isCompleted = completionStates.get(habit.id) || false;
                const wasChanged = currentCompletions.get(habit.id) !== isCompleted;
                const isSelected = selectedHabits.has(habit.id);
                
                return (
                  <div 
                    key={habit.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      wasChanged ? 'border-blue-300 bg-blue-500/10' : 'border-border'
                    } ${isSelected ? 'bg-muted/50' : ''}`}
                  >
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
                    
                    <Button
                      variant={isCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleHabitToggle(habit.id)}
                      className="flex-shrink-0"
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isCompleted ? 'line-through opacity-60' : ''}`}>
                          {habit.title}
                        </span>
                        <div className="flex items-center space-x-2">
                          {wasChanged && (
                            <Badge variant="secondary" className="text-xs">
                              Changed
                            </Badge>
                          )}
                           {habit.area && (
                            <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ backgroundColor: habit.color, color: 'white' }}
                            >
                                {habit.area}
                            </Badge>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Notes section */}
            {selectedHabits.size > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Notes for {format(selectedDate, 'MMM dd')} (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What happened on this day? Any context for these changes..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedHabits.size} habits selected • {changedHabits.length} changes
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompletionStates(new Map(currentCompletions));
                    setSelectedHabits(new Set());
                    setNotes('');
                  }}
                  disabled={changedHabits.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <Button
                  onClick={handleBulkSave}
                  disabled={selectedHabits.size === 0 || isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

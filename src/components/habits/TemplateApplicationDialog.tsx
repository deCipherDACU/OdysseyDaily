
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Zap, 
  Coins, 
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { HabitTemplate } from '@/lib/types/templates';
import { motion } from 'framer-motion';
import { useHabits } from '@/context/OptimizedHabitsContext';
import { useUser } from '@/firebase';

interface TemplateApplicationDialogProps {
  template: HabitTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateApplicationDialog: React.FC<TemplateApplicationDialogProps> = ({
  template,
  open,
  onOpenChange,
}) => {
  const { createHabitsFromTemplate } = useHabits();
  const { user: firebaseUser, isUserLoading } = useUser();
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [applicationResult, setApplicationResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  React.useEffect(() => {
    if (template) {
      // Select all habits by default
      setSelectedHabits(new Set(template.habits.map(h => h.title)));
      setApplicationResult(null);
      setShowSuccess(false);
    }
  }, [template]);

  const handleApplyTemplate = async () => {
    if (!template || !firebaseUser) return;

    setIsApplying(true);
    try {
      // Filter habits based on selection
      const filteredTemplate = {
        ...template,
        habits: template.habits.filter(h => selectedHabits.has(h.title))
      };

      const result = await createHabitsFromTemplate(filteredTemplate);
      
      setApplicationResult(result);
      setShowSuccess(result.success);
      
      if (result.success) {
        // Auto-close after showing success for 2 seconds
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      setApplicationResult({
        success: false,
        message: 'Failed to create template. Please try again.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (!template) return null;

  const selectedHabitsArray = template.habits.filter(h => selectedHabits.has(h.title));
  const totalSelectedXP = selectedHabitsArray.reduce((sum, h) => sum + Math.round(h.baseXP * h.difficultyMultiplier), 0);
  const totalSelectedCoins = selectedHabitsArray.reduce((sum, h) => sum + Math.round(h.baseCoins * h.difficultyMultiplier), 0);
  const totalTimeEstimate = selectedHabitsArray.reduce((sum, h) => {
    if (h.trackingType === 'duration' && h.targetValue) return sum + h.targetValue;
    return sum + 5; // Default 5 minutes for non-duration habits
  }, 0);

  const isReadyToApply = !isApplying && !!firebaseUser && !isUserLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {!showSuccess ? (
              <>
                <span>Apply Template: {template.name}</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {template.difficulty}
                </Badge>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span>Template Applied Successfully!</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {!showSuccess ? (
          <div className="space-y-6">
            {/* Template Overview */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-card p-3 rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-primary">{template.duration}</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
                <div className="bg-card p-3 rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-green-400">{template.successRate}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="bg-card p-3 rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-accent">{template.habits.length}</div>
                  <div className="text-xs text-muted-foreground">Habits</div>
                </div>
              </div>
            </div>

            {/* Habit Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Select Habits to Include</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedHabits.size === template.habits.length) {
                      setSelectedHabits(new Set());
                    } else {
                      setSelectedHabits(new Set(template.habits.map(h => h.title)));
                    }
                  }}
                >
                  {selectedHabits.size === template.habits.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {template.habits.map((habit, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      selectedHabits.has(habit.title) 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <Checkbox
                      checked={selectedHabits.has(habit.title)}
                      onCheckedChange={(checked) => {
                        const newSelected = new Set(selectedHabits);
                        if (checked) {
                          newSelected.add(habit.title);
                        } else {
                          newSelected.delete(habit.title);
                        }
                        setSelectedHabits(newSelected);
                      }}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{habit.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {Math.round(habit.baseXP * habit.difficultyMultiplier)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Coins className="w-3 h-3 mr-1" />
                            {Math.round(habit.baseCoins * habit.difficultyMultiplier)}
                          </Badge>
                        </div>
                      </div>
                      
                      {habit.tinyVersion && (
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 Tiny version: {habit.tinyVersion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Summary */}
            {selectedHabits.size > 0 && (
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border">
                <h4 className="font-medium mb-3">Your Daily Rewards</h4>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-lg font-bold">{totalSelectedXP}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">XP per day</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Coins className="w-4 h-4 text-blue-400" />
                      <span className="text-lg font-bold">{totalSelectedCoins}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Coins per day</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-lg font-bold">{totalTimeEstimate}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Minutes per day</div>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Rewards Preview */}
            {template.completionRewards[0] && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">🏆 Completion Rewards ({template.duration})</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rewards:</span>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        {template.completionRewards[0].xp}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Coins className="w-3 h-3" />
                        {template.completionRewards[0].coins}
                      </span>
                      {template.completionRewards[0].gems > 0 && (
                        <span className="flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          {template.completionRewards[0].gems}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Special:</span>
                    <div className="mt-1">
                      {template.completionRewards[0].title && (
                        <div className="text-purple-400 font-medium">
                          "{template.completionRewards[0].title}" Title
                        </div>
                      )}
                      {template.completionRewards[0].skillPoints > 0 && (
                        <div className="text-blue-400">
                          +{template.completionRewards[0].skillPoints} Skill Points
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Success State */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-semibold text-green-400">
              {template.name} Activated!
            </h3>
            <p className="text-muted-foreground">
              {selectedHabits.size} habits have been added to your daily routine.
              Check your Today view to start completing them!
            </p>
            
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <p className="text-sm text-green-300">
                🚀 Your habits are now available in the Today tracker with progress tracking enabled!
              </p>
            </div>
          </motion.div>
        )}

        <DialogFooter>
          {!showSuccess ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isApplying}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyTemplate}
                disabled={!isReadyToApply || selectedHabits.size === 0}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                {isApplying ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="mr-2"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {isApplying ? 'Creating Habits...' : `Start Template (${selectedHabits.size} habits)`}
              </Button>
            </div>
          ) : (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Go to Today View
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

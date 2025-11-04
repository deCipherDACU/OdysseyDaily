
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sunrise,
  Moon,
  Dumbbell,
  Brain,
  Heart,
  Coffee,
  Book,
  Target,
  Users,
  Clock
} from 'lucide-react';
import { useHabits } from '@/context/OptimizedHabitsContext';
import { useToast } from '@/hooks/use-toast';
import { TemplateApplicationDialog } from './TemplateApplicationDialog';
import { HabitTemplate } from '@/lib/types/templates';

const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'morning-energizer',
    name: '🌅 Morning Energizer',
    description: 'Start your day with energy and focus',
    category: 'morning',
    difficulty: 'beginner',
    duration: '21 days',
    habits: [
      {
        title: 'Wake up at 6:30 AM',
        area: 'Health',
        category: 'Health',
        trackingType: 'binary',
        frequency: 'daily',
        baseXP: 15,
        baseCoins: 5,
        difficultyMultiplier: 1,
        tinyVersion: 'Set alarm for 6:30',
        triggers: ['alarm'],
        barriers: ['snoozing'],
        reminderSuggestions: [{type: 'time', value: '06:30', message: 'Time to wake up!'}],
        stackingOrder: 1,
        skillBoosts: {}
      },
      {
        title: '5-minute morning stretch',
        area: 'Health', 
        category: 'Health',
        trackingType: 'duration',
        frequency: 'daily',
        targetValue: 5,
        unit: 'minutes',
        baseXP: 20,
        baseCoins: 7,
        difficultyMultiplier: 1,
        tinyVersion: '1 minute stretch',
        triggers: ['after waking up'],
        barriers: ['no space'],
        reminderSuggestions: [],
        stackingOrder: 2,
        skillBoosts: {}
      },
      {
        title: 'Drink glass of water',
        area: 'Health',
        category: 'Health',
        trackingType: 'binary', 
        frequency: 'daily',
        baseXP: 10,
        baseCoins: 3,
        difficultyMultiplier: 1,
        tinyVersion: 'One sip of water',
        triggers: ['entering kitchen'],
        barriers: ['forgetting'],
        reminderSuggestions: [],
        stackingOrder: 0,
        skillBoosts: {}
      },
      {
        title: '2-minute meditation',
        area: 'Mental Wellness',
        category: 'Mental Wellness',
        trackingType: 'duration',
        frequency: 'daily',
        targetValue: 2,
        unit: 'minutes', 
        baseXP: 25,
        baseCoins: 10,
        difficultyMultiplier: 1.2,
        tinyVersion: '10 deep breaths',
        triggers: ['after stretching'],
        barriers: ['distractions'],
        reminderSuggestions: [],
        stackingOrder: 3,
        skillBoosts: {}
      }
    ],
    totalDailyXP: 70,
    totalDailyCoins: 25,
    bonusRewards: [],
    completionRewards: [{day: 21, xp: 500, coins: 200, gems: 10, items:[], achievements: [], skillPoints: 1}],
    milestoneRewards: {
        7: { day: 7, xp: 100, coins: 50, gems: 0, items:[], achievements:[] },
    },
    achievements: [],
    characterBoosts: [],
    tags: ['morning', 'energy', 'wellness'],
    estimatedTimePerDay: 15,
    successRate: 85,
    popularityScore: 92
  },
  {
    id: 'productivity-master',
    name: '⚡ Productivity Master',
    description: 'Build focus and get things done',
    category: 'productivity',
    difficulty: 'intermediate',
    duration: '60 days',
    habits: [
      {
        title: 'Review daily priorities',
        area: 'Career',
        category: 'Career',
        trackingType: 'binary',
        frequency: 'daily',
        baseXP: 15,
        baseCoins: 5,
        difficultyMultiplier: 1.0,
        tinyVersion: 'Write down one priority',
        triggers: ['opening laptop'],
        barriers: ['feeling overwhelmed'],
        reminderSuggestions: [],
        stackingOrder: 0,
        skillBoosts: {}
      },
      {
        title: 'Deep work session',
        area: 'Career',
        category: 'Career',
        trackingType: 'duration',
        frequency: 'daily',
        targetValue: 90,
        unit: 'minutes',
        baseXP: 50,
        baseCoins: 20,
        difficultyMultiplier: 1.5,
        tinyVersion: '25 minutes focus',
        triggers: ['after coffee'],
        barriers: ['interruptions'],
        reminderSuggestions: [],
        stackingOrder: 1,
        skillBoosts: {}
      },
      {
        title: 'Learn something new',
        area: 'Education',
        category: 'Education',
        trackingType: 'duration',
        frequency: 'daily',
        targetValue: 20,
        unit: 'minutes',
        baseXP: 30,
        baseCoins: 10,
        difficultyMultiplier: 1.2,
        tinyVersion: 'Read one article',
        triggers: ['lunch break'],
        barriers: ['no motivation'],
        reminderSuggestions: [],
        stackingOrder: 2,
        skillBoosts: {}
      },
      {
        title: 'Inbox zero',
        area: 'Career',
        category: 'Career',
        trackingType: 'binary',
        frequency: 'daily',
        baseXP: 20,
        baseCoins: 5,
        difficultyMultiplier: 1.0,
        tinyVersion: 'Archive 10 emails',
        triggers: ['end of workday'],
        barriers: ['too many emails'],
        reminderSuggestions: [],
        stackingOrder: 3,
        skillBoosts: {}
      }
    ],
    totalDailyXP: 115,
    totalDailyCoins: 40,
    bonusRewards: [],
    completionRewards: [{day: 60, xp: 1000, coins: 500, gems: 20, items: [], achievements:[], skillPoints: 3}],
    milestoneRewards: {
        14: {day: 14, xp: 200, coins: 100, gems: 0, items:[], achievements:[]},
        30: {day: 30, xp: 500, coins: 250, gems: 10, items:[], achievements:[]}
    },
    achievements: [],
    characterBoosts: [],
    tags: ['productivity', 'focus', 'learning'],
    estimatedTimePerDay: 120,
    successRate: 78,
    popularityScore: 88,
  },
  {
    id: 'fitness-foundation',
    name: '💪 Fitness Foundation', 
    description: 'Build sustainable fitness habits',
    category: 'fitness',
    difficulty: 'beginner',
    duration: '30 days',
    habits: [
      {
        title: '10,000 steps',
        area: 'Health',
        category: 'Health',
        trackingType: 'count',
        frequency: 'daily',
        targetValue: 10000,
        unit: 'steps',
        baseXP: 30,
        baseCoins: 10,
        difficultyMultiplier: 1.0,
        tinyVersion: '1000 steps',
        triggers: ['leaving home'],
        barriers: ['bad weather'],
        reminderSuggestions: [],
        stackingOrder: 0,
        skillBoosts: {}
      },
      {
        title: 'Bodyweight workout',
        area: 'Health',
        category: 'Health',
        trackingType: 'duration',
        frequency: 'daily',
        targetValue: 15,
        unit: 'minutes',
        baseXP: 40,
        baseCoins: 15,
        difficultyMultiplier: 1.2,
        tinyVersion: '5 push-ups',
        triggers: ['before shower'],
        barriers: ['feeling tired'],
        reminderSuggestions: [],
        stackingOrder: 1,
        skillBoosts: {}
      },
      {
        title: 'Track meals',
        area: 'Health',
        category: 'Health',
        trackingType: 'binary',
        frequency: 'daily',
        baseXP: 15,
        baseCoins: 5,
        difficultyMultiplier: 1.0,
        tinyVersion: 'Photo of one meal',
        triggers: ['before eating'],
        barriers: ['forgetting'],
        reminderSuggestions: [],
        stackingOrder: 2,
        skillBoosts: {}
      }
    ],
    totalDailyXP: 85,
    totalDailyCoins: 30,
    bonusRewards: [],
    completionRewards: [{day: 30, xp: 750, coins: 300, gems: 15, items:[], achievements: [], skillPoints: 2}],
    milestoneRewards: {
      10: {day: 10, xp: 150, coins: 75, gems: 0, items:[], achievements:[]},
    },
    achievements: [],
    characterBoosts: [],
    tags: ['fitness', 'health', 'movement'],
    estimatedTimePerDay: 45,
    successRate: 82,
    popularityScore: 90
  }
];

export const TemplateLibrary: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  
  const getCategoryIcon = (category: string) => {
    const icons = {
      morning: Sunrise,
      evening: Moon,
      fitness: Dumbbell,
      productivity: Brain,
      wellness: Heart,
    };
    return icons[category as keyof typeof icons] || Target;
  };
  
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-300 border-green-500/40',
      intermediate: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      advanced: 'bg-red-500/20 text-red-300 border-red-500/40',
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Habit Templates</h2>
          <p className="text-muted-foreground">
            Pre-built habit stacks to get you started quickly
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {HABIT_TEMPLATES.map(template => {
          const Icon = getCategoryIcon(template.category);
          
          return (
            <Card 
              key={template.id}
              className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="w-8 h-8 text-primary" />
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-grow">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{template.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{template.totalDailyXP} XP/day</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Includes:</p>
                  <ul className="text-xs space-y-1">
                    {template.habits.slice(0, 3).map((habit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span>{habit.title}</span>
                      </li>
                    ))}
                    {template.habits.length > 3 && (
                      <li className="text-muted-foreground">
                        +{template.habits.length - 3} more habits
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
               <div className="p-4 pt-0">
                 <Button 
                    className="w-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(template);
                    }}
                  >
                    View & Apply
                  </Button>
                </div>
            </Card>
          );
        })}
      </div>
      
      {/* Custom template builder */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Create Custom Template</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Build your own habit stack from scratch
          </p>
          <Button variant="outline">
            Start Custom Template
          </Button>
        </CardContent>
      </Card>
      <TemplateApplicationDialog
        template={selectedTemplate}
        open={!!selectedTemplate}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedTemplate(null);
          }
        }}
      />
    </div>
  );
};

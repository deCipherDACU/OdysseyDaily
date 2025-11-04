
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Wand2 } from 'lucide-react';
import { aiTaskRecommendations, type AiTaskRecommendationsOutput } from '@/ai/flows/ai-task-recommendations';
import { Badge } from '../ui/badge';
import { useUser } from '@/context/UserContext';
import { calculateTaskCoins, calculateTaskXP } from '@/lib/formulas';
import type { Task } from '@/lib/types';
import { LiquidGlass } from '../ui/LiquidGlass';
import { LiquidGlassButton } from '../ui/LiquidGlassButton';

export function AiRecommendations() {
  const [recommendations, setRecommendations] = useState<AiTaskRecommendationsOutput>([]);
  const [loading, setLoading] = useState(true); // Start loading by default
  const { user, addTask } = useUser();

  const handleGetRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await aiTaskRecommendations({ 
        mbti: user.mbti,
        existingTasks: [], // Simplified for now
        skillLevels: {
            physical: user.skillTrees.find(t => t.name === 'Physical')?.skills.reduce((acc, s) => acc + s.level, 0) || 0,
            mental: user.skillTrees.find(t => t.name === 'Mental')?.skills.reduce((acc, s) => acc + s.level, 0) || 0,
            life: user.skillTrees.find(t => t.name === 'Life Skills')?.skills.reduce((acc, s) => acc + s.level, 0) || 0,
        }
      });
      setRecommendations(result);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetRecommendations();
  }, []);

  const handleAddQuest = (rec: AiTaskRecommendationsOutput[0]) => {
    if (!user) return;
    const newTask: Omit<Task, 'id' | 'completed'> = {
        title: rec.title,
        description: rec.description,
        category: rec.category as Task['category'],
        difficulty: rec.difficulty,
        type: 'One-time',
        xp: calculateTaskXP(rec.difficulty),
        coins: calculateTaskCoins(rec.difficulty, user.level),
    };
    addTask(newTask);
    setRecommendations(prev => prev.filter(r => r.title !== rec.title));
  }

  return (
    <LiquidGlass variant='heavy' className="p-6 col-span-1 lg:col-span-2">
      <div className="flex flex-row items-start justify-between">
        <div>
          <h3 className="font-headline flex items-center gap-2 font-semibold text-white">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Side Quests
          </h3>
          <p className="text-sm text-muted-foreground">Optional tasks based on your character & progress.</p>
        </div>
        <LiquidGlassButton onClick={handleGetRecommendations} disabled={loading} variant="glass" size="sm" glow>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Regenerate
        </LiquidGlassButton>
      </div>
      <div className="mt-4">
        {loading && (
           <div className="space-y-4">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 animate-pulse">
                    <div className="space-y-2">
                        <div className="h-4 bg-white/10 rounded w-32"></div>
                        <div className="h-3 bg-white/10 rounded w-48"></div>
                    </div>
                    <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                </div>
             ))}
           </div>
        )}
        {!loading && recommendations.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>No new recommendations right now. Check back later!</p>
          </div>
        )}
        {!loading && recommendations.length > 0 && (
          <div className="space-y-2">
            {recommendations.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/10 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-semibold font-headline text-white">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                   <div className="flex gap-2 pt-1">
                        <Badge variant="outline">{task.category}</Badge>
                        <Badge variant="secondary">{task.difficulty}</Badge>
                    </div>
                </div>
                <LiquidGlassButton variant="glass" size="sm" glow onClick={() => handleAddQuest(task)}>
                  <Plus className="h-5 w-5" />
                </LiquidGlassButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </LiquidGlass>
  );
}

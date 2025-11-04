
'use client';

import PageHeader from "@/components/shared/PageHeader";
import { ArrowRight, BookOpen, CheckCircle2, Coins, Shield, Sparkles, Star, Sword, Trophy, Heart, Zap, Flame } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import WeeklyOverviewChart from "@/components/dashboard/WeeklyOverviewChart";
import StreakTracker from "@/components/dashboard/StreakTracker";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidGlassCard } from "@/components/ui/LiquidGlassCard";
import { LiquidGlassButton } from "@/components/ui/LiquidGlassButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircularProgress } from "@/components/ui/circular-progress";
import { AiRecommendations } from "@/components/dashboard/AiRecommendations";

export default function DashboardPage() {
  const { user, tasks, boss, loading } = useUser();

  if (loading || !user || !boss) {
    return (
        <>
            <PageHeader
                title="Welcome Back!"
                description="Loading your progress summary..."
            />
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <div className="grid gap-6 mt-4 grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-64" />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        </>
    );
  }

  const upcomingTasks = tasks.filter(t => !t.completed).slice(0, 3);
  
  const displayLevel = user.level >= 99 ? '99+' : user.level;
  const levelProgress = user ? (user.xp / user.xpToNextLevel) * 100 : 0;
  const hpPercentage = (user.health / user.maxHealth) * 100;

  const dailyTasks = tasks.filter(t => t.type === 'Daily');
  const completedDailyTasks = dailyTasks.filter(t => t.completed).length;
  const dailyProgress = dailyTasks.length > 0 ? (completedDailyTasks / dailyTasks.length) * 100 : 0;

  return (
    <>
      <PageHeader
        title={`Welcome Back, ${user.name.split(' ')[0]}!`}
        description="Here's your progress summary. Let's make today productive!"
      />

        <div className="grid gap-4 md:grid-cols-3 mb-6">
            <LiquidGlassCard className="flex items-center gap-4 p-4">
                <CircularProgress value={levelProgress} size={64} strokeWidth={6} />
                <div>
                    <p className="text-muted-foreground font-semibold">Level</p>
                    <p className="text-3xl font-bold font-headline">{displayLevel}</p>
                    <p className="text-xs text-muted-foreground">{user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP</p>
                </div>
            </LiquidGlassCard>
             <LiquidGlassCard className="flex items-center gap-4 p-4">
                <Heart className="h-10 w-10 text-green-400"/>
                <div>
                    <p className="text-muted-foreground font-semibold">Health</p>
                    <p className="text-3xl font-bold font-headline">{user.health} / {user.maxHealth}</p>
                    <Progress value={hpPercentage} className="h-2 mt-1 bg-green-500/20 [&>div]:bg-green-500" />
                </div>
            </LiquidGlassCard>
             <LiquidGlassCard className="flex items-center gap-4 p-4">
                <Zap className="h-10 w-10 text-yellow-400"/>
                <div>
                    <p className="text-muted-foreground font-semibold">Stat Points</p>
                    <p className="text-3xl font-bold font-headline">{user.skillPoints}</p>
                    <p className="text-xs text-muted-foreground">Available to spend</p>
                </div>
            </LiquidGlassCard>
        </div>
      
      <div className="grid gap-6 mt-4 grid-cols-1 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
            <AiRecommendations />
           <Tabs defaultValue="overview">
            <TabsList>
                <TabsTrigger value="overview">Weekly XP Flow</TabsTrigger>
                <TabsTrigger value="streak">Contribution Heatmap</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
                <WeeklyOverviewChart />
            </TabsContent>
            <TabsContent value="streak">
                <StreakTracker />
            </TabsContent>
        </Tabs>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-6">
          <LiquidGlassCard>
            <div className="p-6">
              <h3 className="font-headline flex items-center gap-2 font-semibold text-white"><BookOpen className="h-5 w-5 text-primary" /> Upcoming Quests</h3>
              <p className="text-sm text-muted-foreground">Your next most important tasks.</p>
              <div className="mt-4 space-y-2">
                {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                  <Link href="/tasks" key={task.id} className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-semibold text-white">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{task.category}</Badge>
                        <Badge variant="secondary">{task.difficulty}</Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-bold text-sm text-primary">+{task.xp} XP</p>
                      <p className="font-semibold text-xs text-yellow-500">+{task.coins} Coins</p>
                    </div>
                  </Link>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No upcoming quests. Enjoy your break!</p>
                )}
                {upcomingTasks.length > 0 && (
                  <Link href="/tasks" passHref>
                    <LiquidGlassButton variant="glass" className="w-full mt-2">
                      View All Quests
                    </LiquidGlassButton>
                  </Link>
                )}
              </div>
            </div>
          </LiquidGlassCard>
          
          <LiquidGlassCard>
            <div className="p-6">
              <h3 className="font-headline flex items-center gap-2 font-semibold text-white"><Sword className="h-5 w-5 text-destructive" /> Weekly Boss</h3>
              <p className="text-sm text-muted-foreground">{boss.name} awaits...</p>
              <div className="mt-4">
                <div
                  className="w-full h-40 relative rounded-lg mb-4 overflow-hidden"
                  data-ai-hint="fantasy dragon"
                >
                  <Image src={boss.imageUrl} alt={boss.name} layout="fill" objectFit="cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <Progress value={(boss.currentHp / boss.maxHp) * 100} className="h-3" />
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>{boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP</span>
                  <span>{boss.timeRemaining} left</span>
                </div>
                <Link href="/boss-fight" passHref>
                  <LiquidGlassButton className="w-full mt-4" variant="glass">
                    Join the Fight <ArrowRight className="ml-2 h-4 w-4" />
                  </LiquidGlassButton>
                </Link>
              </div>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard>
              <div className="p-6">
                <h3 className="font-headline flex items-center gap-2 font-semibold text-white"><CheckCircle2 className="h-5 w-5 text-green-400" /> Daily Progress</h3>
                <p className="text-sm text-muted-foreground">You've completed {completedDailyTasks} of {dailyTasks.length} daily quests today.</p>
                 <div className="mt-4">
                    <Progress value={dailyProgress} className="h-3" />
                 </div>
              </div>
          </LiquidGlassCard>
        </div>
      </div>
    </>
  );
}

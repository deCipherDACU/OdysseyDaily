'use client';

import { useState, useMemo, lazy, Suspense } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Plus } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { DungeonCrawlItem } from '@/components/dungeons/DungeonCrawlItem';
import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { LiquidGlassButton } from '@/components/ui/LiquidGlassButton';
import { DungeonCrawl } from '@/lib/types';

const CreateDungeonDialog = lazy(() => import('@/components/dungeons/CreateDungeonDialog').then(module => ({ default: module.CreateDungeonDialog })));

const DUNGEONS_LEVEL_REQUIREMENT = 5;

export default function DungeonsPage() {
  const { user, dungeons } = useUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { activeDungeons, conqueredDungeons } = useMemo(() => {
    if (!user) return { activeDungeons: [], conqueredDungeons: [] };
    const active = dungeons.filter(d => !d.completed);
    const conquered = dungeons.filter(d => d.completed);
    return { activeDungeons: active, conqueredDungeons: conquered };
  }, [dungeons, user]);

  if (!user) {
    return <div>Loading...</div>
  }

  if (user.level < DUNGEONS_LEVEL_REQUIREMENT) {
    return (
      <>
        <PageHeader
          title="Special Quests"
          description="Conquer multi-task challenges for epic rewards."
        />
        <LiquidGlassCard className="flex flex-col items-center justify-center h-96 text-center p-6">
            <Lock className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold font-headline text-white">Feature Locked</h2>
            <p className="text-muted-foreground">You must reach Level {DUNGEONS_LEVEL_REQUIREMENT} to unlock Special Quests.</p>
            <Link href="/tasks">
              <LiquidGlassButton className="mt-4">
                Complete Quests to Level Up
              </LiquidGlassButton>
            </Link>
        </LiquidGlassCard>
      </>
    )
  }

  const renderDungeonList = (dungeonList: DungeonCrawl[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {dungeonList.map(dungeon => (
        <Link href={`/dungeons/${dungeon.id}`} key={dungeon.id}>
          <DungeonCrawlItem dungeon={dungeon} />
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Special Quests"
        description="Conquer multi-task challenges for epic rewards."
        actions={
          <LiquidGlassButton onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Special Quest
          </LiquidGlassButton>
        }
      />
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="active">Active ({activeDungeons.length})</TabsTrigger>
          <TabsTrigger value="conquered">Conquered ({conqueredDungeons.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {activeDungeons.length > 0 ? (
            renderDungeonList(activeDungeons)
          ) : (
            <LiquidGlassCard className="text-center py-16 p-6">
              <p className="font-semibold text-lg text-white">No active special quests!</p>
              <p className="text-muted-foreground">Start a new special quest to begin your adventure.</p>
                <LiquidGlassButton onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  New Special Quest
              </LiquidGlassButton>
            </LiquidGlassCard>
          )}
        </TabsContent>
        <TabsContent value="conquered" className="mt-4">
          {conqueredDungeons.length > 0 ? (
            renderDungeonList(conqueredDungeons)
          ) : (
            <LiquidGlassCard className="text-center py-16 p-6">
              <p className="font-semibold text-lg text-white">No quests conquered yet.</p>
              <p className="text-muted-foreground">Complete an active quest to see it here.</p>
            </LiquidGlassCard>
          )}
        </TabsContent>
      </Tabs>
      <Suspense fallback={<div/>}>
        {isCreateDialogOpen && <CreateDungeonDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />}
      </Suspense>
    </>
  );
}

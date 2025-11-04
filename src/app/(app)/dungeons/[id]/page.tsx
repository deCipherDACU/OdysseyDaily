
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import PageHeader from '@/components/shared/PageHeader';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Check, Loader2, Sparkles, Star, Target, Trophy, Wand2, Timer, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { weeklyReviewInsights } from '@/ai/flows/weekly-review-insights';
import type { DungeonCrawl, WeeklyReview } from '@/lib/types';
import Link from 'next/link';
import { differenceInSeconds, formatDistanceStrict } from 'date-fns';

function AdventurePath({ dungeon, onToggleChallenge }: { dungeon: DungeonCrawl, onToggleChallenge: (dungeonId: string, challengeId: string) => void }) {
    const totalChallenges = dungeon.challenges.length;

    return (
        <div className="space-y-4">
            {dungeon.challenges.map((challenge, index) => {
                const isLast = index === totalChallenges - 1;
                return (
                    <div key={challenge.id} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                            <div className={cn(
                                "flex items-center justify-center h-10 w-10 rounded-full border-2",
                                challenge.completed ? "bg-primary/20 border-primary" : "border-dashed border-white/30"
                            )}>
                                {challenge.completed ? <Check className="text-primary" /> : <span className="text-white font-bold">{index + 1}</span>}
                            </div>
                            {!isLast && <div className="w-0.5 h-16 bg-white/20" />}
                        </div>
                        <div className="mt-1.5 flex-1">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={challenge.id}
                                    checked={challenge.completed}
                                    onCheckedChange={() => onToggleChallenge(dungeon.id, challenge.id)}
                                    disabled={dungeon.completed || !dungeon.startTime}
                                />
                                <label
                                    htmlFor={challenge.id}
                                    className={cn(
                                        "font-semibold text-lg cursor-pointer",
                                        challenge.completed && "line-through text-muted-foreground",
                                        !dungeon.startTime && "text-muted-foreground"
                                    )}
                                >
                                    {challenge.title}
                                </label>
                            </div>
                        </div>
                    </div>
                );
            })}
             <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                    <Trophy className={cn("h-10 w-10", dungeon.completed ? "text-yellow-400" : "text-white/30")} />
                </div>
                <div className="mt-1.5 flex-1">
                    <p className="font-semibold text-lg">Dungeon Conquered!</p>
                    <p className="text-primary font-bold">+{dungeon.xp} XP</p>
                </div>
            </div>
        </div>
    );
}

function QuestTimer({ dungeon }: { dungeon: DungeonCrawl }) {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (!dungeon.startTime || dungeon.completed) {
            setElapsedTime(dungeon.timeTaken || 0);
            return;
        }

        const timer = setInterval(() => {
            setElapsedTime(differenceInSeconds(new Date(), new Date(dungeon.startTime as string)));
        }, 1000);

        return () => clearInterval(timer);
    }, [dungeon.startTime, dungeon.completed, dungeon.timeTaken]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return (
        <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <span className="font-mono text-lg font-semibold text-white">{formatTime(elapsedTime)}</span>
        </div>
    );
}


export default function DungeonDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { dungeons, toggleChallengeCompleted, startDungeon, completeDungeon } = useUser();
    const { toast } = useToast();

    const dungeon = useMemo(() => dungeons.find(d => d.id === id), [id, dungeons]);

    if (!dungeon) {
        return (
            <div className="text-center py-10">
                <p>Special Quest not found.</p>
                <Link href="/dungeons">
                    <Button variant="link">Return to Quest List</Button>
                </Link>
            </div>
        );
    }

    const completedChallenges = dungeon.challenges.filter(c => c.completed).length;
    const totalChallenges = dungeon.challenges.length;
    const progress = (completedChallenges / totalChallenges) * 100;
    const allChallengesDone = completedChallenges === totalChallenges;

    const handleStartDungeon = () => {
        startDungeon(dungeon.id);
        toast({ title: "Quest Started!", description: "The timer is running. Good luck!" });
    }

    const handleCompleteDungeon = () => {
        const result = completeDungeon(dungeon.id);
        if (result) {
             toast({ title: `Quest Conquered in ${formatDistanceStrict(result.timeTaken * 1000, 0)}!`, description: `You earned ${result.baseXp} XP + ${result.bonusXp} bonus XP!` });
        }
    };
    
    const timeBonus = dungeon.completed && dungeon.timeTaken ? Math.max(0, Math.round(dungeon.xp * (1 - (dungeon.timeTaken / (dungeon.challenges.length * 30 * 60))))) : 0;

    return (
        <>
            <PageHeader title={dungeon.title} description={dungeon.description} />
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <LiquidGlassCard className="p-6">
                        <AdventurePath dungeon={dungeon} onToggleChallenge={toggleChallengeCompleted} />
                    </LiquidGlassCard>
                </div>
                <div className="space-y-6">
                    <LiquidGlassCard className="p-6">
                        <h3 className="font-headline text-xl font-bold text-white mb-4">Quest Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Difficulty:</span>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("h-5 w-5", i < dungeon.difficulty ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")}/>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Time Elapsed:</span>
                                <QuestTimer dungeon={dungeon} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-semibold">Progress</span>
                                    <span>{completedChallenges} / {totalChallenges}</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                             {dungeon.completed ? (
                                <div className="space-y-3 text-center">
                                    <div className="flex items-center justify-center gap-2 text-green-400 font-semibold px-4 py-2 rounded-md bg-green-500/10">
                                        <Trophy />
                                        Conquered!
                                    </div>
                                    <div className="font-semibold text-sm">
                                        <p>Base Reward: <span className="text-primary">{dungeon.xp} XP</span></p>
                                        <p>Time Bonus: <span className="text-primary">{timeBonus} XP</span></p>
                                        <p className="text-lg">Total: <span className="text-primary">{dungeon.xp + timeBonus} XP</span></p>
                                    </div>
                                </div>
                            ) : !dungeon.startTime ? (
                                <Button onClick={handleStartDungeon} className="w-full">
                                    Start Quest & Timer
                                </Button>
                            ) : (
                                <Button onClick={handleCompleteDungeon} disabled={!allChallengesDone} className="w-full">
                                    <Award className="mr-2" /> Conquer Dungeon
                                </Button>
                            )}
                        </div>
                    </LiquidGlassCard>
                </div>
            </div>
        </>
    );
}

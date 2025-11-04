import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { LiquidGlassCard } from "@/components/ui/LiquidGlassCard";
import { mockAchievements } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AchievementsPage() {
    const unlockedAchievements = mockAchievements.filter(a => a.unlocked);
    const lockedAchievements = mockAchievements.filter(a => !a.unlocked);

    const rarityColors = {
        'Common': 'bg-gray-200 text-gray-800',
        'Rare': 'bg-blue-200 text-blue-800',
        'Epic': 'bg-purple-200 text-purple-800',
        'Legendary': 'bg-yellow-200 text-yellow-800',
    };
    
    return (
        <>
            <PageHeader
                title="Achievements"
                description={`You have unlocked ${unlockedAchievements.length} of ${mockAchievements.length} achievements.`}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {unlockedAchievements.map(ach => (
                    <LiquidGlassCard key={ach.id} className="flex flex-col p-6">
                        <div className="flex items-start justify-between">
                            <ach.icon className="h-10 w-10 text-primary" />
                            <Badge className={cn(rarityColors[ach.rarity])}>{ach.rarity}</Badge>
                        </div>
                        <div className="flex-grow mt-4">
                            <h3 className="font-bold font-headline text-lg text-white">{ach.title}</h3>
                            <p className="text-sm text-muted-foreground">{ach.description}</p>
                        </div>
                        {ach.unlockedDate &&
                            <div className="mt-4 text-xs text-muted-foreground">Unlocked on {format(ach.unlockedDate, 'P')}</div>
                        }
                    </LiquidGlassCard>
                ))}
                {lockedAchievements.map(ach => (
                    <LiquidGlassCard key={ach.id} className="flex flex-col p-6 bg-card/50 opacity-60">
                         <div className="flex items-start justify-between">
                            <ach.icon className="h-10 w-10 text-muted-foreground" />
                            <Badge variant="outline">{ach.rarity}</Badge>
                        </div>
                        <div className="flex-grow mt-4">
                             <h3 className="font-bold font-headline text-lg text-muted-foreground">{ach.title}</h3>
                            <p className="text-sm text-muted-foreground">{ach.description}</p>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground font-semibold">LOCKED</div>
                    </LiquidGlassCard>
                ))}
            </div>
        </>
    );
}

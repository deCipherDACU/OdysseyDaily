
'use client';

import { useState } from 'react';
import PageHeader from "@/components/shared/PageHeader";
import { soundscapeSystem } from '@/lib/soundscapes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Waves } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function SoundscapesPage() {
    const { user } = useUser();
    const [activePreset, setActivePreset] = useState<any | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(70);

    const handlePlayPause = (preset: any) => {
        if (activePreset?.id === preset.id) {
            setIsPlaying(!isPlaying);
        } else {
            setActivePreset(preset);
            setIsPlaying(true);
        }
    };

    if (!user) return <div>Loading...</div>;

    const { binauralBeats } = soundscapeSystem;

    return (
        <>
            <TooltipProvider>
                <PageHeader
                    title="Soundscapes"
                    description="Craft your perfect audio environment for focus, relaxation, or sleep."
                />

                <div className="space-y-8">
                    {binauralBeats.categories.map((category) => {
                        const isUnlocked = user.level >= category.unlockLevel;
                        return (
                            <Card key={category.id} className={cn(!isUnlocked && "opacity-60 bg-card/50")}>
                                 <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                               <span className="text-2xl">{category.icon}</span> {category.name}
                                            </CardTitle>
                                            <CardDescription>{category.benefits.join(', ')}.</CardDescription>
                                        </div>
                                        {!isUnlocked && <Badge variant="destructive">Lvl {category.unlockLevel} Required</Badge>}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.presets.map(preset => (
                                        <Card key={preset.id} className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle className="text-lg">{preset.name}</CardTitle>
                                                <CardDescription>{preset.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <div className="flex items-center gap-4">
                                                    <Button 
                                                        size="icon" 
                                                        onClick={() => handlePlayPause(preset)}
                                                        disabled={!isUnlocked}
                                                    >
                                                        {(isPlaying && activePreset?.id === preset.id) ? <Pause/> : <Play />}
                                                    </Button>
                                                    <div className="w-full">
                                                        <Slider 
                                                            defaultValue={[volume]} 
                                                            max={100} 
                                                            step={1}
                                                            onValueChange={(value) => setVolume(value[0])}
                                                            disabled={!isUnlocked || activePreset?.id !== preset.id}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </TooltipProvider>
        </>
    );
}

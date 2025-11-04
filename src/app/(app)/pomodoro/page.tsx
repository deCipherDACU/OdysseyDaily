
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain, SkipBack, SkipForward, Music, Volume2, VolumeX, Link as LinkIcon, X, Settings, Loader2, Wand2, Zap } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { Task, User } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { adaptiveTimingSuggestion, AdaptiveTimingSuggestionOutput } from '@/ai/flows/adaptive-timing-suggestion';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { LiquidGlassButton } from '@/components/ui/LiquidGlassButton';

type SessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

type Preset = {
  id: string;
  name: string;
  sessions: {
    pomodoro: { duration: number; label: string; icon: React.ElementType };
    shortBreak: { duration: number; label: string; icon: React.ElementType };
    longBreak: { duration: number; label: string; icon: React.ElementType };
  };
};

const sessionPresets: Record<string, Preset> = {
  deepCode: {
    id: 'deepCode',
    name: 'Deep Code',
    sessions: {
      pomodoro: { duration: 45 * 60, label: 'Coding', icon: Brain },
      shortBreak: { duration: 10 * 60, label: 'Short Break', icon: Coffee },
      longBreak: { duration: 20 * 60, label: 'Long Break', icon: Coffee },
    },
  },
  creativeWriting: {
    id: 'creativeWriting',
    name: 'Creative Flow',
    sessions: {
      pomodoro: { duration: 25 * 60, label: 'Writing', icon: Brain },
      shortBreak: { duration: 15 * 60, label: 'Reflection', icon: Coffee },
      longBreak: { duration: 30 * 60, label: 'Long Break', icon: Coffee },
    },
  },
  deepStudy: {
    id: 'deepStudy',
    name: 'Deep Study',
    sessions: {
      pomodoro: { duration: 35 * 60, label: 'Studying', icon: Brain },
      shortBreak: { duration: 8 * 60, label: 'Short Break', icon: Coffee },
      longBreak: { duration: 15 * 60, label: 'Long Break', icon: Coffee },
    },
  },
};

const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    if (!time || !modifier) return 0;

    let [hours, minutes] = time.split(':');
    if (!hours || !minutes) return 0;

    let hourNum = parseInt(hours, 10);
    if (modifier.toUpperCase() === 'PM' && hourNum < 12) {
        hourNum += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hourNum === 12) {
        hourNum = 0;
    }
    return hourNum * 60 + parseInt(minutes, 10);
};

export default function PomodoroPage() {
  const { user, tasks, addXp, addCoins, updateTask } = useUser();
  const { toast } = useToast();
  
  // Core Timer State
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  // Customization and Presets
  const [activePreset, setActivePreset] = useState<Preset>(sessionPresets.deepCode);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customTimings, setCustomTimings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  const getSessionDuration = useCallback((type: SessionType) => {
    return (isCustomizing ? customTimings[type] : activePreset.sessions[type].duration / 60) * 60;
  }, [activePreset, isCustomizing, customTimings]);
  
  const [timeLeft, setTimeLeft] = useState(getSessionDuration('pomodoro'));

  // Linked Quest State
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null);

  // Music Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // AI Suggestion State
  const [aiSuggestion, setAiSuggestion] = useState<AdaptiveTimingSuggestionOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Flow State Extension
  const [wasPaused, setWasPaused] = useState(false);
  const [showExtensionOffer, setShowExtensionOffer] = useState(false);
  const EXTENSION_DURATION = 10 * 60; // 10 minutes

  const musicTracks = useMemo(() => Array.from({ length: 8 }, (_, i) => `/audio/${i + 1}.mp3`), []);
  
  
  const handleSessionEnd = useCallback(() => {
    if (sessionType === 'pomodoro' && user) {
      const xpReward = 10;
      const coinReward = 2;
      const newCycles = cycles + 1;
      setCycles(newCycles);
      addXp(xpReward);
      addCoins(coinReward);
      toast({
        title: "Session Complete!",
        description: `You gained ${xpReward} XP and ${coinReward} coins for your focus.`
      });
      
      if (linkedTaskId) {
        const task = tasks.find(t => t.id === linkedTaskId);
        if (task && task.pomodoros) {
            const newPomodorosCompleted = (task.pomodorosCompleted || 0) + 1;
            const isNowComplete = newPomodorosCompleted >= task.pomodoros;
            
            const updatedTask: Task = {
                ...task,
                pomodorosCompleted: newPomodorosCompleted,
                completed: isNowComplete,
            };
            
            updateTask(updatedTask);

            if (isNowComplete) {
                addXp(task.xp);
                addCoins(task.coins);
                toast({
                    title: "Quest Complete!",
                    description: `You finished all focus sessions for "${task.title}"! You earned ${task.xp} XP and ${task.coins} Coins.`
                });
                setLinkedTaskId(null);
            }
        }
      }

      setSessionType(newCycles % 4 === 0 ? 'longBreak' : 'shortBreak');
    } else {
      setSessionType('pomodoro');
    }
  }, [sessionType, user, cycles, addXp, addCoins, toast, linkedTaskId, tasks, updateTask]);

  // Main timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
  
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      
      if (!wasPaused && timeLeft <= 60 && sessionType === 'pomodoro') {
        setShowExtensionOffer(true);
      }

    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (Notification.permission === "granted") {
        new Notification(`Session Complete!`, {
          body: `Time for your ${sessionType === 'pomodoro' ? 'break' : 'next focus session'}.`,
          icon: '/logo.png'
        });
      }
      handleSessionEnd();
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, wasPaused, sessionType, handleSessionEnd]);
  
  // Effect to reset timer when session type or preset changes
  useEffect(() => {
    setIsActive(false);
    setShowExtensionOffer(false);
    setWasPaused(false);
    setTimeLeft(getSessionDuration(sessionType));
  }, [sessionType, getSessionDuration]);

  // Effect to update page title
  useEffect(() => {
    const sessionLabel = isCustomizing ? 'Focus' : activePreset.sessions[sessionType].label;
    if (isActive) {
      document.title = `${formatTime(timeLeft)} - ${sessionLabel}`;
    } else {
      document.title = 'Pomodoro Timer | LifeQuest';
    }
     return () => { document.title = 'LifeQuest RPG'; }
  }, [timeLeft, isActive, sessionType, activePreset.sessions, isCustomizing]);

  const toggleTimer = () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    setWasPaused(isActive);
    setIsActive(!isActive);
  };
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(getSessionDuration(sessionType));
  }, [sessionType, getSessionDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = getSessionDuration(sessionType);
  const progress = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
  const radius = 110;
  const circumference = 2 * Math.PI * radius; 

  const handlePlayPauseMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMusicPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  }, [isMusicPlaying]);

  const handleNextTrack = useCallback(() => {
    setCurrentTrackIndex(prevIndex => (prevIndex + 1) % musicTracks.length);
  }, [musicTracks.length]);

  const handlePrevTrack = () => {
    setCurrentTrackIndex(prevIndex => (prevIndex - 1 + musicTracks.length) % musicTracks.length);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
        audioRef.current.currentTime = value[0];
    }
  }

  const handleCustomTimeChange = (field: keyof typeof customTimings, value: string) => {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes > 0) {
        setCustomTimings(prev => ({ ...prev, [field]: minutes }));
    }
  }

  const focusQuests = useMemo(() => {
    return tasks.filter(t => !t.completed && (t.pomodoros || 0) > (t.pomodorosCompleted || 0));
  }, [tasks]);

  const linkedTask = focusQuests.find(t => t.id === linkedTaskId);

  useEffect(() => {
    if (linkedTask && user) {
        setIsAiLoading(true);
        setAiSuggestion(null);
        adaptiveTimingSuggestion({
            taskDifficulty: linkedTask.difficulty,
            taskCategory: linkedTask.category,
            timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
            mbti: user.mbti,
        }).then(suggestion => {
            setAiSuggestion(suggestion);
        }).catch(e => {
            console.error("AI suggestion failed:", e);
        }).finally(() => {
            setIsAiLoading(false);
        });
    } else {
        setAiSuggestion(null);
    }
  }, [linkedTask, user]);

  const handleAcceptExtension = () => {
    setTimeLeft(timeLeft + EXTENSION_DURATION);
    setShowExtensionOffer(false);
    toast({ title: "Session Extended!", description: `${EXTENSION_DURATION / 60} minutes added to your focus time.` });
  };
  
  const handleApplyAISuggestion = (duration: number) => {
    setCustomTimings(prev => ({...prev, pomodoro: duration }));
    setIsCustomizing(true);
    setSessionType('pomodoro');
    setTimeLeft(duration * 60);
    setIsActive(true);
    toast({ title: "AI timing applied & timer started!" });
  };

  const currentSessionLabel = isCustomizing
  ? { 'pomodoro': 'Focus', 'shortBreak': 'Short Break', 'longBreak': 'Long Break' }[sessionType]
  : activePreset.sessions[sessionType].label;

  const currentSessionIcon = isCustomizing
    ? (sessionType === 'pomodoro' ? Brain : Coffee)
    : activePreset.sessions[sessionType].icon;

  const Icon = currentSessionIcon;
  const color = sessionType === 'pomodoro' ? 'hsl(var(--primary))' : 'hsl(var(--accent))';

  return (
    <>
      <PageHeader
        title="Pomodoro Timer"
        description="Focus on your quests with timed sessions."
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <LiquidGlassCard className="relative flex flex-col items-center justify-center p-4 sm:p-8 text-center h-full overflow-hidden">
             <AnimatePresence>
                {showExtensionOffer && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute bottom-4 left-4 right-4 z-20"
                    >
                        <LiquidGlassCard>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-primary" />
                                        <span className="font-semibold font-headline">Flow State Detected!</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3 text-left">
                                    You're in the zone! Extend this session by ${EXTENSION_DURATION / 60} minutes?
                                </p>
                                <div className="flex gap-2">
                                    <LiquidGlassButton
                                        size="sm"
                                        onClick={handleAcceptExtension}
                                        className="flex-1"
                                    >
                                        Extend Session
                                    </LiquidGlassButton>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowExtensionOffer(false)}
                                    >
                                        No, thanks
                                    </Button>
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                      <circle
                          cx="128"
                          cy="128"
                          r={radius}
                          stroke="hsl(var(--muted))"
                          strokeWidth="12"
                          fill="transparent"
                      />
                      <circle
                          cx="128"
                          cy="128"
                          r={radius}
                          stroke={color}
                          strokeWidth="12"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference * (1 - progress / 100)}
                          strokeLinecap="round"
                          className={cn(
                              "transition-all duration-1000",
                              isActive && "animate-pulse"
                          )}
                          style={{
                              filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none',
                              transitionProperty: 'stroke-dashoffset, filter'
                          }}
                      />
                  </svg>
                  <div className="z-10 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                          <Icon className="h-6 w-6 text-muted-foreground" />
                          <p className="text-lg text-muted-foreground">{currentSessionLabel}</p>
                      </div>
                      <p className="text-6xl sm:text-7xl font-bold font-headline tabular-nums">{formatTime(timeLeft)}</p>
                  </div>
              </div>

              <div className="flex items-center gap-4 mt-8">
                  <LiquidGlassButton onClick={toggleTimer} size="lg" className="w-32">
                      {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                      {isActive ? 'Pause' : 'Start'}
                  </LiquidGlassButton>
                  <Button onClick={resetTimer} variant="outline" size="icon" aria-label="Reset Timer">
                      <RotateCcw />
                  </Button>
              </div>
              
              <div className='text-sm text-muted-foreground mt-6'>
                  Completed cycles: {cycles}
              </div>
            </LiquidGlassCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <LiquidGlassCard className="p-6">
                <h3 className="font-headline text-lg font-semibold text-white">Session Setup</h3>
                <div className="space-y-4 mt-4">
                    <Select onValueChange={(id) => {
                        if (id === 'custom') {
                            setIsCustomizing(true);
                        } else {
                            setIsCustomizing(false);
                            setActivePreset(sessionPresets[id]);
                        }
                        setSessionType('pomodoro');
                    }} defaultValue={isCustomizing ? 'custom' : activePreset.id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a preset..."/>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(sessionPresets).map(preset => (
                          <SelectItem key={preset.id} value={preset.id}>{preset.name}</SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>

                    <Collapsible open={isCustomizing}>
                      <CollapsibleContent className="space-y-4 pt-4">
                        <h4 className="font-headline text-lg font-semibold text-white">Custom Timings (in minutes)</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label htmlFor="custom-pomodoro">Focus</Label>
                              <Input id="custom-pomodoro" type="number" value={customTimings.pomodoro} onChange={(e) => handleCustomTimeChange('pomodoro', e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="custom-short">Short Break</Label>
                              <Input id="custom-short" type="number" value={customTimings.shortBreak} onChange={(e) => handleCustomTimeChange('shortBreak', e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="custom-long">Long Break</Label>
                              <Input id="custom-long" type="number" value={customTimings.longBreak} onChange={(e) => handleCustomTimeChange('longBreak', e.target.value)} />
                            </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                     {linkedTask ? (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-left">{linkedTask.title}</p>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setLinkedTaskId(null)}><X className="h-4 w-4"/></Button>
                            </div>
                            {linkedTask.pomodoros && (
                                <div>
                                    <Progress value={((linkedTask.pomodorosCompleted || 0) / linkedTask.pomodoros) * 100} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1 text-right">
                                        {linkedTask.pomodorosCompleted || 0} / {linkedTask.pomodoros} sessions
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Select onValueChange={setLinkedTaskId} disabled={isActive}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <LinkIcon className="h-4 w-4" /><span>Link a Quest or Focus Block</span>
                                    </div>
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {focusQuests.length > 0 ? focusQuests.map(task => (
                                    <SelectItem key={task.id} value={task.id}>
                                        <span>{task.title}</span>
                                        {task.pomodoros && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                ({task.pomodorosCompleted || 0}/{task.pomodoros})
                                            </span>
                                        )}
                                    </SelectItem>
                                )) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No focus quests or blocks available.</div>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-6">
                <h3 className="font-headline text-lg font-semibold text-white flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    AI Timing Suggestion
                </h3>
                <div className="mt-4">
                    {isAiLoading ? (
                        <Skeleton className="h-24 w-full" />
                    ) : aiSuggestion ? (
                        <div className="space-y-3 text-center">
                            <div className="text-3xl font-bold text-primary">
                                {aiSuggestion.recommendedDuration} min
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {aiSuggestion.reasoning}
                            </p>
                            <LiquidGlassButton onClick={() => handleApplyAISuggestion(aiSuggestion.recommendedDuration)}>
                                Apply Suggestion
                            </LiquidGlassButton>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">Link a quest to get an AI-powered time suggestion.</p>
                    )}
                </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-6">
                <h3 className="font-headline text-lg font-semibold text-white">Music Player</h3>
                <div className="space-y-4 mt-4">
                    <div>
                        <p className="text-sm font-semibold truncate">{musicTracks[currentTrackIndex].split('/').pop()?.replace('.mp3', '')}</p>
                        <p className="text-xs text-muted-foreground">Ambient Lo-fi</p>
                    </div>
                    <div className="space-y-1">
                        <Slider 
                            value={[currentTime]}
                            max={duration || 1}
                            onValueChange={handleSeek}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Button variant="ghost" size="icon" onClick={handlePrevTrack}>
                            <SkipBack />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12" onClick={handlePlayPauseMusic}>
                            {isMusicPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNextTrack}>
                            <SkipForward />
                        </Button>
                        <div className="flex items-center gap-2 w-24">
                            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8">
                                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                onValueChange={handleVolumeChange}
                                max={1}
                                step={0.01}
                            />
                        </div>
                    </div>
                </div>
            </LiquidGlassCard>
        </div>
      </div>
      <audio 
          ref={audioRef}
          src={musicTracks[currentTrackIndex]}
          onEnded={handleNextTrack}
          onPlay={() => setIsMusicPlaying(true)}
          onPause={() => setIsMusicPlaying(false)}
          loop
      />
    </>
  );
}

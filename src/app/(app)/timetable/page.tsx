'use client';

import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Brain, LayoutGrid, Kanban, Save, Trash2, SlidersHorizontal, ChevronsRight, ChevronsLeft, X, Calendar, User as UserIcon } from "lucide-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { smartTimetableGeneration, SmartTimetableInput, SmartTimetableOutput } from "@/ai/flows/smart-timetable-generation";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mbtiTypes } from "@/components/welcome/shared";
import type { KanbanData, KanbanCard, Subtask } from "@/components/timetable/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableTable } from "@/components/timetable/EditableTable";
import type { Task } from "@/lib/types";


const KanbanBoard = dynamic(() => import('@/components/timetable/KanbanBoard').then(mod => mod.KanbanBoard), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
});


type FormValues = Omit<SmartTimetableInput, 'availableHours'> & {
    dayStart: string;
    dayEnd: string;
};

type ScheduleItem = SmartTimetableOutput['schedule'][0];

type Preset = {
    name: string;
    values: FormValues;
    schedule: KanbanCard[] | null;
};

const parseTime = (timeStr: string) => {
    if (!timeStr) return new Date(0);
    const [time, modifier] = timeStr.split(' ');
    if (!time || !modifier) return new Date(0); // Handle cases where modifier might be missing

    let [hours, minutes] = time.split(':');
    if (!hours || !minutes) return new Date(0);

    let hourNum = parseInt(hours, 10);
    if (modifier.toUpperCase() === 'PM' && hourNum < 12) {
        hourNum += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hourNum === 12) {
        hourNum = 0;
    }
    const date = new Date();
    date.setHours(hourNum, parseInt(minutes, 10), 0, 0);
    return date;
};

const scheduleToKanbanData = (schedule: ScheduleItem[]): KanbanData => {
    if (!schedule || !Array.isArray(schedule)) {
        return { columns: [] };
    }
    
    const sortedSchedule = [...schedule].sort((a, b) => {
        const timeA = parseTime(a.time.split(' - ')[0]);
        const timeB = parseTime(b.time.split(' - ')[0]);
        return timeA.getTime() - timeB.getTime();
    });

    const columnOrder: Array<Task['category']> = ['Education', 'Career', 'Health', 'Mental Wellness', 'Finance', 'Social', 'Hobbies', 'Home', 'Break', 'Commitment'];
    
    const columns = columnOrder.map(category => ({
        id: category,
        title: category,
        cards: sortedSchedule
            .filter(item => item.category === category)
            .map(item => ({
                id: item.time + item.task + Math.random(), // Create a more unique ID
                title: item.task,
                description: item.time,
                difficulty: item.difficulty,
                category: item.category,
                subtasks: [],
            }))
    })).filter(col => col.cards.length > 0); // Only include columns that have cards

    return { columns };
}

const kanbanDataToSchedule = (kanbanData: KanbanData): ScheduleItem[] => {
    const schedule: ScheduleItem[] = [];
    kanbanData.columns.forEach(column => {
        const category = column.title as ScheduleItem['category'];
        column.cards.forEach(card => {
            schedule.push({
                time: card.description,
                task: card.title,
                category: category,
                difficulty: card.difficulty,
            });
        });
    });
    
    schedule.sort((a, b) => {
        const timeA = parseTime(a.time.split(' - ')[0]);
        const timeB = parseTime(b.time.split(' - ')[0]);
        return timeA.getTime() - timeB.getTime();
    });
    return schedule;
};


export default function TimetablePage() {
    const { user } = useUser();
    const { toast } = useToast();
    const { register, handleSubmit, control, formState: { errors }, reset, getValues } = useForm<FormValues>({
        defaultValues: {
            dayStart: '09:00',
            dayEnd: '22:00',
            breakPreferences: '15-minute breaks every 2 hours, 1-hour lunch break',
            fixedCommitments: 'Class from 10 AM - 11:30 AM, Team meeting at 2 PM',
            tasksToSchedule: 'Study for exam, Work on project, Go to the gym, Read a book',
            chronotype: 'morning',
            workStyle: 'hybrid',
            mbti: user?.mbti
        }
    });
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);
    const [kanbanData, setKanbanData] = useState<KanbanData | null>(null);

    const [presets, setPresets] = useState<Preset[]>([]);
    const [presetName, setPresetName] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        try {
            const savedKanbanRaw = localStorage.getItem('timetable-kanban');
            if (savedKanbanRaw) {
                const savedData = JSON.parse(savedKanbanRaw);
                 if (savedData && Array.isArray(savedData.columns)) {
                    setKanbanData(savedData);
                }
            } else {
                const savedScheduleRaw = localStorage.getItem('timetable-schedule');
                if (savedScheduleRaw) {
                    const savedData = JSON.parse(savedScheduleRaw);
                    if (Array.isArray(savedData)) {
                        setKanbanData(scheduleToKanbanData(savedData));
                    }
                }
            }
            
            const savedPresets = localStorage.getItem('timetable-presets');
            if (savedPresets) {
                setPresets(JSON.parse(savedPresets));
            }
        } catch (error) {
            console.error("Failed to load data from local storage", error);
        }
    }, []);
    
    const handleKanbanChange = (newKanbanData: KanbanData) => {
        setKanbanData(newKanbanData);
        localStorage.setItem('timetable-kanban', JSON.stringify(newKanbanData));
    };

    const tableData = useMemo(() => kanbanData ? kanbanDataToSchedule(kanbanData) : [], [kanbanData]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setLoading(true);
        setKanbanData(null);
        
        const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        };
        
        const availableHours = `${formatTime(data.dayStart)} - ${formatTime(data.dayEnd)}`;

        try {
            const result = await smartTimetableGeneration({ ...data, availableHours });
            if (result && result.schedule) {
                const newKanbanData = scheduleToKanbanData(result.schedule);
                handleKanbanChange(newKanbanData);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to generate schedule. Please try again.",
                variant: "destructive"
            });
        }
        setLoading(false);
    };

    const savePreset = () => {
        if (!presetName.trim()) {
            toast({ title: "Preset name cannot be empty", variant: "destructive"});
            return;
        }
        const newPreset = {
            name: presetName,
            values: getValues(),
            schedule: kanbanData ? kanbanData.columns.flatMap(c => c.cards) : null,
        };
        const updatedPresets = [...presets.filter(p => p.name !== presetName), newPreset];
        setPresets(updatedPresets);
        localStorage.setItem('timetable-presets', JSON.stringify(updatedPresets));
        setPresetName("");
        toast({ title: `Preset "${presetName}" saved!`});
    };

    const loadPreset = (name: string) => {
        const preset = presets.find(p => p.name === name);
        if (preset) {
            reset(preset.values);
            if (preset.schedule) {
                const scheduleItems: ScheduleItem[] = preset.schedule.map(card => ({
                    time: card.description,
                    task: card.title,
                    category: card.category,
                    difficulty: card.difficulty,
                }));
                const newKanbanData = scheduleToKanbanData(scheduleItems);
                handleKanbanChange(newKanbanData);
            } else {
                setKanbanData(null);
            }
            toast({ title: `Preset "${name}" loaded!`});
        }
    };
    
    const deletePreset = (name: string) => {
        const updatedPresets = presets.filter(p => p.name !== name);
        setPresets(updatedPresets);
        localStorage.setItem('timetable-presets', JSON.stringify(updatedPresets));
        toast({ title: `Preset "${name}" deleted.`, variant: "destructive"});
    };

    const renderForm = () => (
      <form id="timetable-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                    <h4 className="font-headline font-semibold flex items-center gap-2"><SlidersHorizontal className="h-4 w-4"/> Step 1: Core Details</h4>
                    <ChevronsRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90"/>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dayStart" className="text-accent">Day Start</Label>
                        <Input id="dayStart" type="time" {...register("dayStart", { required: true })} className="[color-scheme:dark]" style={{ accentColor: 'hsl(var(--accent))' }} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dayEnd" className="text-accent">Day End</Label>
                        <Input id="dayEnd" type="time" {...register("dayEnd", { required: true })} className="[color-scheme:dark]" style={{ accentColor: 'hsl(var(--accent))' }} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tasksToSchedule">Tasks to Schedule</Label>
                    <Textarea id="tasksToSchedule" {...register("tasksToSchedule", { required: true })} placeholder="e.g., Study for exam, Work on project, Go to the gym" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fixedCommitments">Fixed Commitments</Label>
                    <Textarea id="fixedCommitments" {...register("fixedCommitments")} placeholder="e.g., Classes, meetings, appointments" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="breakPreferences">Break Preferences</Label>
                    <Input id="breakPreferences" {...register("breakPreferences")} />
                </div>
            </CollapsibleContent>
        </Collapsible>
        
        <Separator />
        
        <Collapsible>
            <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                    <h4 className="font-headline font-semibold flex items-center gap-2"><UserIcon className="h-4 w-4"/> Step 2: Personality (Optional)</h4>
                    <ChevronsRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90"/>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2 space-y-4">
                 <div className="space-y-2">
                    <Label>Chronotype</Label>
                    <Controller
                        name="chronotype"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="morning" id="morning" className="text-accent" /><Label htmlFor="morning">Morning</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="evening" id="evening" className="text-accent" /><Label htmlFor="evening">Evening</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="flexible" id="flexible" className="text-accent" /><Label htmlFor="flexible">Flexible</Label></div>
                            </RadioGroup>
                        )}
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Work Style</Label>
                    <Controller
                        name="workStyle"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="deep_focus" id="deep_focus" className="text-accent" /><Label htmlFor="deep_focus">Deep Focus</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="multitask" id="multitask" className="text-accent" /><Label htmlFor="multitask">Multitask</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="hybrid" id="hybrid" className="text-accent" /><Label htmlFor="hybrid">Hybrid</Label></div>
                            </RadioGroup>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="char-mbti" className="flex items-center gap-2"><Brain /> MBTI Type</Label>
                    <Controller
                        name="mbti"
                        control={control}
                        render={({ field }) => (
                             <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="char-mbti">
                                    <SelectValue placeholder="Select your MBTI type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mbtiTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>

        <Separator />
        
        <Collapsible>
            <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                    <h4 className="font-headline font-semibold flex items-center gap-2"><Save className="h-4 w-4"/> Step 3: Presets</h4>
                    <ChevronsRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90"/>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2 space-y-4">
                 <div className="space-y-2">
                    <Label>Manage Presets</Label>
                    <Select onValueChange={loadPreset} disabled={presets.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Load a preset..." />
                        </SelectTrigger>
                        <SelectContent>
                            {presets.map(p => (
                                <SelectItem key={p.name} value={p.name}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{p.name}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto hover:bg-destructive/20 group" onClick={(e) => { e.stopPropagation(); deletePreset(p.name); }}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                                        </Button>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="preset-name">Save Current as Preset</Label>
                    <div className="flex gap-2">
                        <Input id="preset-name" placeholder="Preset name..." value={presetName} onChange={e => setPresetName(e.target.value)} />
                        <Button type="button" variant="outline" size="icon" onClick={savePreset}><Save /></Button>
                    </div>
                 </div>
            </CollapsibleContent>
        </Collapsible>
      </form>
    );

    return (
        <div className="flex h-[calc(100vh-8rem)]">
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, padding: 0, opacity: 0 }}
                        animate={{ width: 384, padding: '1rem', opacity: 1 }}
                        exit={{ width: 0, padding: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="hidden lg:block overflow-hidden"
                    >
                        <Card className="h-full flex flex-col">
                           <CardHeader>
                                <CardTitle className="font-headline">Smart Schedule Wizard</CardTitle>
                                <CardDescription>Follow the steps to generate your perfect day.</CardDescription>
                            </CardHeader>
                             <ScrollArea className="flex-grow px-6">
                               {renderForm()}
                             </ScrollArea>
                            <CardFooter className="mt-auto p-6 border-t border-border">
                                <Button type="submit" form="timetable-form" size="lg" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    {schedule ? 'Regenerate Schedule' : 'Generate Schedule'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="flex-1 flex flex-col pl-0 lg:pl-4">
                 <PageHeader
                    title="Smart Timetable"
                    description="Let our AI craft the perfect, optimized schedule for your day."
                    actions={
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:inline-flex">
                            {isSidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
                        </Button>
                    }
                />

                <div className="flex-1 -mt-6">
                     {loading && <div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
                    {!loading && !kanbanData && (
                        <div className="text-center text-muted-foreground bg-card rounded-lg h-full flex flex-col items-center justify-center">
                            <Calendar className="h-16 w-16 mb-4 text-primary"/>
                            <h2 className="text-xl font-bold font-headline mb-2">Your Schedule Awaits</h2>
                            <p className="max-w-sm">Use the panel on the left to input your tasks and preferences, and let our AI generate the optimal plan for your day.</p>
                             <Button onClick={() => setIsSidebarOpen(true)} className="mt-4 lg:hidden">
                                <SlidersHorizontal className="mr-2"/> Open Controls
                            </Button>
                        </div>
                    )}
                    
                    {kanbanData && (
                        <Tabs defaultValue="kanban">
                            <div className="flex justify-end">
                                <TabsList>
                                    <TabsTrigger value="kanban"><Kanban /></TabsTrigger>
                                    <TabsTrigger value="table"><LayoutGrid /></TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="kanban" className="mt-4">
                                {kanbanData && <KanbanBoard data={kanbanData} onChange={handleKanbanChange} />}
                            </TabsContent>
                            <TabsContent value="table" className="mt-4">
                                {tableData && (
                                    <EditableTable
                                        data={tableData}
                                        onChange={(newSchedule) => setKanbanData(scheduleToKanbanData(newSchedule))}
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
             <AnimatePresence>
                 {isSidebarOpen && (
                    <motion.div
                         initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 bg-background z-50 lg:hidden"
                    >
                         <Card className="h-full rounded-none border-none flex flex-col">
                           <CardHeader>
                               <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="font-headline">Smart Schedule Wizard</CardTitle>
                                        <CardDescription>Provide details for the AI.</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}><X className="h-5 w-5" /></Button>
                               </div>
                            </CardHeader>
                             <ScrollArea className="flex-grow px-6">
                               {renderForm()}
                             </ScrollArea>
                            <CardFooter className="mt-auto p-6 border-t border-border">
                                <Button type="submit" form="timetable-form" size="lg" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    {schedule ? 'Regenerate Schedule' : 'Generate Schedule'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
